# Stage 1: Minimal Viable Intelligence

## Goal
Build the smallest possible working system that demonstrates:
- Server can execute agents
- Agents can gather data
- Data persists in a queryable format
- Basic API to trigger and read results

## Success Criteria
- [ ] Start server with `npm start`
- [ ] Trigger agent via `curl http://localhost:3000/api/agents/workspace-scanner/run`
- [ ] See results in SQLite database
- [ ] Query results via API
- [ ] No crashes on repeated runs

## Implementation

### 1. Simple Express Server
```javascript
// server.js
const express = require('express');
const Database = require('better-sqlite3');
const { exec } = require('child_process');

const app = express();
const db = new Database('~/.techman/data.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS agent_runs (
    id INTEGER PRIMARY KEY,
    agent_name TEXT,
    started_at TEXT,
    completed_at TEXT,
    status TEXT,
    error TEXT
  );
  
  CREATE TABLE IF NOT EXISTS workspace_data (
    id INTEGER PRIMARY KEY,
    run_id INTEGER,
    file_path TEXT,
    file_type TEXT,
    last_modified TEXT,
    metadata TEXT,
    FOREIGN KEY (run_id) REFERENCES agent_runs(id)
  );
`);

app.listen(3000);
```

### 2. Single Agent Endpoint
```javascript
app.post('/api/agents/:agentName/run', async (req, res) => {
  const { agentName } = req.params;
  
  // Record run start
  const run = db.prepare(
    'INSERT INTO agent_runs (agent_name, started_at, status) VALUES (?, ?, ?)'
  ).run(agentName, new Date().toISOString(), 'running');
  
  // Execute agent
  const agentPrompt = `Use the ${agentName} agent to analyze the workspace and output results in JSON format.`;
  exec(`echo "${agentPrompt}" | cat ~/.claude/agents/${agentName}.md - | claude -p --output-format json --dangerously-skip-permissions`, (error, stdout) => {
    if (error) {
      db.prepare('UPDATE agent_runs SET status = ?, error = ? WHERE id = ?')
        .run('failed', error.message, run.lastInsertRowid);
    } else {
      // Agent should write to DB directly
      db.prepare('UPDATE agent_runs SET status = ?, completed_at = ? WHERE id = ?')
        .run('completed', new Date().toISOString(), run.lastInsertRowid);
    }
  });
  
  res.json({ runId: run.lastInsertRowid, status: 'started' });
});
```

### 3. Query Endpoint
```javascript
app.get('/api/data/workspace', (req, res) => {
  const data = db.prepare(`
    SELECT * FROM workspace_data 
    WHERE run_id = (SELECT MAX(id) FROM agent_runs WHERE status = 'completed')
    LIMIT 100
  `).all();
  
  res.json({ data });
});
```

### 4. Minimal Workspace Scanner Agent
```markdown
---
name: workspace-scanner
description: Scans workspace for files and writes to SQLite database
model: sonnet
---
You scan the current directory and write file information to ~/.techman/data.db.

Connect to SQLite and get the latest run_id:
```sql
SELECT MAX(id) as run_id FROM agent_runs WHERE agent_name = 'workspace-scanner'
```

Then scan files and insert:
```sql
INSERT INTO workspace_data (run_id, file_path, file_type, last_modified, metadata)
VALUES (?, ?, ?, ?, ?)
```

Focus on .js, .md, .json files. Write actual data, not examples.
```

## Testing Plan

1. **Start Server**
   ```bash
   cd ~/workspace/techman
   npm install express better-sqlite3
   node server.js
   ```

2. **Trigger Agent**
   ```bash
   curl -X POST http://localhost:3000/api/agents/workspace-scanner/run
   ```

3. **Check Results**
   ```bash
   curl http://localhost:3000/api/data/workspace | jq
   ```

4. **Verify Database**
   ```bash
   sqlite3 ~/.techman/data.db "SELECT * FROM agent_runs;"
   sqlite3 ~/.techman/data.db "SELECT COUNT(*) FROM workspace_data;"
   ```

## What We Learn

- Can Claude Code agents write to SQLite?
- Is the execution model reliable?
- What's the performance like?
- What error cases emerge?

## Next Stage Preparations

If this works, Stage 2 will add:
- Schema versioning
- Multiple agents
- Agent dependencies
- Graceful error handling

But first, we need to prove the basic execution model works.

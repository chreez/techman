const express = require('express');
const Database = require('better-sqlite3');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database
const dbPath = path.join(process.env.HOME, '.techman', 'data.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS agent_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name TEXT NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    status TEXT NOT NULL,
    error TEXT
  );
  
  CREATE TABLE IF NOT EXISTS workspace_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    last_modified TEXT,
    metadata TEXT,
    FOREIGN KEY (run_id) REFERENCES agent_runs(id)
  );
`);

// Prepare statements for better performance
const insertRunStmt = db.prepare(
  'INSERT INTO agent_runs (agent_name, started_at, status) VALUES (?, ?, ?)'
);
const updateRunStmt = db.prepare(
  'UPDATE agent_runs SET status = ?, error = ?, completed_at = ? WHERE id = ?'
);
const getWorkspaceDataStmt = db.prepare(`
  SELECT w.*, r.agent_name, r.started_at
  FROM workspace_data w
  JOIN agent_runs r ON w.run_id = r.id
  WHERE r.id = (
    SELECT MAX(id) FROM agent_runs 
    WHERE agent_name = 'workspace-scanner' AND status = 'completed'
  )
  LIMIT 100
`);
const getAgentStatusStmt = db.prepare(`
  SELECT * FROM agent_runs 
  WHERE agent_name = ? 
  ORDER BY id DESC 
  LIMIT 10
`);

// Agent execution endpoint
app.post('/api/agents/:agentName/run', async (req, res) => {
  const { agentName } = req.params;
  console.log(`Starting agent: ${agentName}`);
  
  try {
    // Record run start
    const result = insertRunStmt.run(agentName, new Date().toISOString(), 'running');
    const runId = result.lastInsertRowid;
    
    // Execute agent - using mock implementation for Stage 1
    if (agentName === 'workspace-scanner') {
      const mockScriptPath = path.join(__dirname, 'mock-workspace-scanner.js');
      exec(`node "${mockScriptPath}"`, {
        env: { ...process.env, TECHMAN_RUN_ID: runId.toString() },
        cwd: process.cwd(),
        timeout: 30000
      }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Agent ${agentName} failed:`, error.message);
          updateRunStmt.run('failed', error.message, new Date().toISOString(), runId);
        } else {
          console.log(`Agent ${agentName} completed successfully`);
          console.log('Agent output:', stdout);
          updateRunStmt.run('completed', null, new Date().toISOString(), runId);
        }
      });
    } else {
      // For other agents, use the original Claude CLI approach
      const agentPrompt = `Act as a ${agentName} agent and output results in JSON format.`;
      exec(`echo "${agentPrompt}" | claude -p --output-format json`, {
        env: { ...process.env, TECHMAN_RUN_ID: runId.toString() },
        cwd: process.cwd(),
        timeout: 30000
      }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Agent ${agentName} failed:`, error.message);
          updateRunStmt.run('failed', error.message, new Date().toISOString(), runId);
        } else {
          console.log(`Agent ${agentName} completed successfully`);
          updateRunStmt.run('completed', null, new Date().toISOString(), runId);
        }
      });
    }
    
    res.json({ 
      runId: Number(runId), 
      status: 'started',
      message: `Agent ${agentName} execution started`
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Query endpoint
app.get('/api/data/workspace', (req, res) => {
  try {
    const rows = getWorkspaceDataStmt.all();
    res.json({ 
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    res.json({ 
      success: false,
      error: err.message,
      data: [] 
    });
  }
});

// Status endpoint
app.get('/api/agents/:agentName/status', (req, res) => {
  const { agentName } = req.params;
  
  try {
    const rows = getAgentStatusStmt.all(agentName);
    res.json({ agentName, runs: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Techman server running on http://localhost:${PORT}`);
  console.log(`Database location: ${dbPath}`);
});
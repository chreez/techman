#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Get run ID from environment
const runId = process.env.TECHMAN_RUN_ID;
if (!runId) {
  console.error('No TECHMAN_RUN_ID provided');
  process.exit(1);
}

// Connect to database
const dbPath = path.join(process.env.HOME, '.techman', 'data.db');
const db = new Database(dbPath);

// Prepare insert statement
const stmt = db.prepare(`
  INSERT INTO workspace_data (run_id, file_path, file_type, last_modified, metadata)
  VALUES (?, ?, ?, ?, ?)
`);

let fileCount = 0;

// Scan current directory
function scanDirectory(dir, baseDir = dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const relativePath = path.relative(baseDir, filePath);
      
      // Skip hidden files and node_modules
      if (file.startsWith('.') || file === 'node_modules') return;
      
      try {
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          scanDirectory(filePath, baseDir);
        } else if (stats.isFile()) {
          // Only process code files for Stage 1
          const ext = path.extname(file);
          if (['.js', '.md', '.json', '.ts', '.py'].includes(ext)) {
            try {
              stmt.run(
                runId,
                relativePath,
                ext,
                stats.mtime.toISOString(),
                JSON.stringify({ size: stats.size })
              );
              console.log(`Recorded: ${relativePath}`);
              fileCount++;
            } catch (err) {
              console.error(`Error inserting ${relativePath}:`, err.message);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
}

// Run the scan
console.log(`Starting workspace scan for run ${runId}`);
scanDirectory(process.cwd());

// Close database
db.close();
console.log(`Workspace scan completed. Recorded ${fileCount} files.`);
process.exit(0);
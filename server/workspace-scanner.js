const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Get run ID from environment
const runId = process.env.TECHMAN_RUN_ID;
if (!runId) {
  console.error('No TECHMAN_RUN_ID provided');
  process.exit(1);
}

console.log(`Starting workspace scan for run ${runId}`);

// Connect to database
const dbPath = path.join(process.env.HOME, '.techman', 'data.db');
console.log(`Connecting to database: ${dbPath}`);

const db = new Database(dbPath);
console.log('Connected to SQLite database');

// Prepare insert statement
const stmt = db.prepare(`
  INSERT INTO workspace_data (run_id, file_path, file_type, last_modified, metadata)
  VALUES (?, ?, ?, ?, ?)
`);

let filesProcessed = 0;
let errors = [];

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
          // Get file extension
          const ext = path.extname(file);
          
          // Determine file type
          let fileType = 'other';
          if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) fileType = 'javascript';
          else if (['.py'].includes(ext)) fileType = 'python';
          else if (['.json', '.yaml', '.yml'].includes(ext)) fileType = 'config';
          else if (['.md', '.txt'].includes(ext)) fileType = 'documentation';
          
          // Create metadata
          const metadata = {
            size: stats.size,
            permissions: stats.mode,
            isExecutable: (stats.mode & parseInt('111', 8)) !== 0
          };
          
          try {
            stmt.run(
              runId,
              relativePath,
              fileType,
              stats.mtime.toISOString(),
              JSON.stringify(metadata)
            );
            filesProcessed++;
            console.log(`Processed: ${relativePath}`);
          } catch (err) {
            errors.push({ file: relativePath, error: err.message });
            console.error(`Error inserting ${relativePath}:`, err.message);
          }
        }
      } catch (error) {
        errors.push({ file: filePath, error: error.message });
        console.error(`Error processing ${filePath}:`, error.message);
      }
    });
  } catch (error) {
    errors.push({ directory: dir, error: error.message });
    console.error(`Error reading directory ${dir}:`, error.message);
  }
}

// Run the scan
const workDir = process.cwd();
console.log(`Scanning directory: ${workDir}`);
scanDirectory(workDir);

// Create summary
const summary = {
  runId: runId,
  workingDirectory: workDir,
  filesProcessed: filesProcessed,
  errors: errors.length,
  errorDetails: errors.slice(0, 10) // Limit error details
};

// Close database
db.close();

// Output summary
console.log('\n=== Workspace Scan Summary ===');
console.log(JSON.stringify(summary, null, 2));
console.log(`\nWorkspace scan completed. Processed ${filesProcessed} files with ${errors.length} errors.`);

process.exit(errors.length > 0 ? 1 : 0);

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Restarting server...');

// First build and then start the server
try {
  // Build the project
  execSync('node scripts/build.js', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  // Start the server
  execSync('node scripts/start.js', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
} catch (error) {
  console.error('❌ Server restart failed:', error);
  process.exit(1);
}

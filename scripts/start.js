
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// First build the project
console.log('Building server before starting...');
try {
  execSync('node scripts/build.js', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

console.log('Starting server in production mode...');

// Run the compiled server
const server = spawn('node', ['dist/server/start.js'], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..')
});

server.on('close', (code) => {
  if (code !== 0) {
    console.error(`Server process exited with code ${code}`);
    process.exit(code);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.kill('SIGTERM');
});


const { spawn } = require('child_process');
const path = require('path');

// First build the project
require('./build');

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

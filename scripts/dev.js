
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting server in development mode with nodemon...');

// Run nodemon with ts-node for development
const nodemon = spawn('npx', ['nodemon', '--watch', 'src/server', '--ext', 'ts', '--exec', 'ts-node', 'src/server/start.ts'], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..')
});

nodemon.on('close', (code) => {
  if (code !== 0) {
    console.error(`Nodemon process exited with code ${code}`);
    process.exit(code);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  nodemon.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  nodemon.kill('SIGTERM');
});

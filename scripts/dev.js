
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting server in development mode with nodemon...');

// Run nodemon with ts-node-esm for proper ESM support
const nodemon = spawn('npx', [
  'nodemon',
  '--watch', 'src/server',
  '--ext', 'ts',
  '--exec', 'ts-node',
  '--esm',
  '--project', './tsconfig.server.json',
  'src/server/start.ts'
], {
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

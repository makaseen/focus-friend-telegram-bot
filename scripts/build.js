
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building server...');

try {
  // Use the TypeScript compiler with the server config
  execSync('npx tsc --project tsconfig.server.json', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  console.log('✅ Server built successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

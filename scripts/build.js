
const { execSync } = require('child_process');
const path = require('path');

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

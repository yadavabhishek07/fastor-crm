const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Installing frontend dependencies...');
  execSync('npm --prefix frontend install', { stdio: 'inherit' });

  console.log('Building frontend with Vite...');
  execSync('npm --prefix frontend run build', { stdio: 'inherit' });

  const src = path.join(__dirname, 'frontend', 'dist');
  const dest = path.join(__dirname, 'dist');

  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log('Successfully copied frontend/dist to ./dist for Vercel!');
  }
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

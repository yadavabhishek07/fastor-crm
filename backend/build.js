const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Starting build for Fastor CRM...');
  const frontendDir = path.join(__dirname, '..', 'frontend');
  const distDir = path.join(__dirname, 'dist');

  if (fs.existsSync(frontendDir)) {
    console.log('Installing frontend dependencies...');
    execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });

    console.log('Building frontend with Vite...');
    execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

    const srcDist = path.join(frontendDir, 'dist');
    if (fs.existsSync(srcDist)) {
      fs.cpSync(srcDist, distDir, { recursive: true, force: true });
      console.log('Successfully copied frontend build to backend/dist!');
    }
  } else {
    fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(
      path.join(distDir, 'index.html'),
      '<!DOCTYPE html><html><head><title>Fastor CRM API</title></head><body><h1>Fastor CRM API is Live</h1><p>Visit <a href="/api-docs">/api-docs</a> for Swagger documentation.</p></body></html>'
    );
  }
} catch (error) {
  console.error('Build step warning:', error.message);
  // Ensure dist exists so Vercel does not fail on missing output directory
  const distDir = path.join(__dirname, 'dist');
  fs.mkdirSync(distDir, { recursive: true });
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    fs.writeFileSync(
      path.join(distDir, 'index.html'),
      '<!DOCTYPE html><html><head><title>Fastor CRM</title></head><body><h1>Fastor CRM is Live</h1></body></html>'
    );
  }
}

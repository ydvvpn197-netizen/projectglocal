#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Creating domain deployment package for theglocal.in...');

try {
  // Check if dist folder exists
  if (!fs.existsSync('dist')) {
    console.error('❌ dist folder not found. Please run "npm run build:prod" first.');
    process.exit(1);
  }

  // Verify the build output
  console.log('✅ Verifying build output...');
  if (!fs.existsSync('dist/index.html')) {
    throw new Error('Build failed: index.html not found');
  }

  // Copy .htaccess to dist folder if it doesn't exist
  console.log('📋 Ensuring .htaccess file...');
  if (fs.existsSync('public/.htaccess') && !fs.existsSync('dist/.htaccess')) {
    fs.copyFileSync('public/.htaccess', 'dist/.htaccess');
  }

  // Create a web.config file for IIS servers (if needed)
  console.log('📋 Creating web.config for IIS compatibility...');
  const webConfig = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".js" mimeType="application/javascript" />
      <mimeMap fileExtension=".css" mimeType="text/css" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="DENY" />
        <add name="X-XSS-Protection" value="1; mode=block" />
        <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>`;
  
  fs.writeFileSync('dist/web.config', webConfig);

  // Create deployment package
  console.log('📦 Creating deployment package...');
  const output = fs.createWriteStream('theglocal-domain-deploy.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log('🎉 Domain deployment package created: theglocal-domain-deploy.zip');
    console.log('');
    console.log('📁 DEPLOYMENT INSTRUCTIONS:');
    console.log('1. Upload the contents of the "dist" folder to your web server');
    console.log('2. Ensure your domain theglocal.in points to your web server');
    console.log('3. Configure SSL certificate for https://theglocal.in');
    console.log('4. Your site should be available at: https://theglocal.in');
    console.log('');
    console.log('📊 Build Information:');
    console.log('   - Build directory: dist/');
    console.log('   - Main entry: dist/index.html');
    console.log('   - Assets: dist/js/, dist/css/, dist/assets/');
    console.log('   - Configuration: dist/.htaccess, dist/web.config');
    console.log('   - Domain: https://theglocal.in');
    console.log('');
    console.log('🔧 DNS Configuration Required:');
    console.log('   - A record: theglocal.in → Your server IP');
    console.log('   - CNAME record: www.theglocal.in → theglocal.in');
    console.log('');
    console.log('🔒 SSL Certificate:');
    console.log('   - Install SSL certificate for theglocal.in');
    console.log('   - Redirect HTTP to HTTPS');
    console.log('');
    console.log('📋 Files in dist/:');
    const files = fs.readdirSync('dist');
    files.forEach(file => {
      const stats = fs.statSync(path.join('dist', file));
      if (stats.isDirectory()) {
        console.log(`   📁 ${file}/`);
      } else {
        console.log(`   📄 ${file}`);
      }
    });
  });

  archive.pipe(output);
  archive.directory('dist/', false);
  archive.finalize();

} catch (error) {
  console.error('❌ Deployment package creation failed:', error.message);
  process.exit(1);
}

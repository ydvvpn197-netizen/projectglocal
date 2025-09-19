#!/usr/bin/env node

/**
 * Deployment Verification Script for TheGlocal
 * Checks if the site is properly deployed and accessible
 */

import https from 'https';
import http from 'http';
import { exec } from 'child_process';

const SITE_URLS = [
  'https://theglocal.in/',
  'https://ydvvpn197-netizen.github.io/projectglocal/'
];

const DNS_SERVERS = [
  '8.8.8.8',
  '1.1.1.1',
  '208.67.222.222'
];

console.log('🔍 TheGlocal Deployment Verification\n');

async function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 400,
        headers: res.headers
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        success: false,
        error: err.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.abort();
      resolve({
        url,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

async function checkDNS(domain) {
  return new Promise((resolve) => {
    exec(`nslookup ${domain}`, (error, stdout, stderr) => {
      if (error) {
        resolve({
          domain,
          success: false,
          error: error.message
        });
      } else {
        resolve({
          domain,
          success: true,
          result: stdout
        });
      }
    });
  });
}

async function main() {
  // Check site accessibility
  console.log('📡 Checking Site Accessibility...\n');
  
  for (const url of SITE_URLS) {
    const result = await checkUrl(url);
    
    if (result.success) {
      console.log(`✅ ${url} - Status: ${result.status}`);
    } else {
      console.log(`❌ ${url} - Status: ${result.status} - ${result.error || 'Failed'}`);
    }
  }
  
  console.log('\n🌐 Checking DNS Configuration...\n');
  
  // Check DNS for custom domain
  const dnsResult = await checkDNS('theglocal.in');
  if (dnsResult.success) {
    console.log('✅ DNS Resolution for theglocal.in:');
    console.log(dnsResult.result);
  } else {
    console.log('❌ DNS Resolution failed:', dnsResult.error);
  }
  
  console.log('\n🔧 Deployment Status Summary:\n');
  
  const primarySite = await checkUrl('https://theglocal.in/');
  const fallbackSite = await checkUrl('https://ydvvpn197-netizen.github.io/projectglocal/');
  
  if (primarySite.success) {
    console.log('🎉 PRIMARY SITE WORKING: https://theglocal.in/');
    console.log('✅ Custom domain deployment successful!');
  } else if (fallbackSite.success) {
    console.log('⚠️  FALLBACK SITE WORKING: GitHub Pages URL');
    console.log('🔧 Custom domain needs configuration');
    console.log('📖 See CUSTOM_DOMAIN_SETUP_GUIDE.md for instructions');
  } else {
    console.log('❌ DEPLOYMENT ISSUES DETECTED');
    console.log('🔍 Check GitHub Actions logs for details');
  }
  
  console.log('\n📊 Next Steps:');
  if (!primarySite.success) {
    console.log('1. Configure custom domain in GitHub Pages settings');
    console.log('2. Set up DNS records for theglocal.in');
    console.log('3. Add required GitHub secrets');
    console.log('4. Wait for DNS propagation (up to 24 hours)');
  } else {
    console.log('1. Test all site features');
    console.log('2. Set up monitoring and analytics');
    console.log('3. Configure automated backups');
  }
  
  console.log('\n🔗 Useful Links:');
  console.log('- GitHub Repository: https://github.com/ydvvpn197-netizen/projectglocal');
  console.log('- GitHub Actions: https://github.com/ydvvpn197-netizen/projectglocal/actions');
  console.log('- DNS Checker: https://dnschecker.org/');
}

main().catch(console.error);

#!/usr/bin/env node

import https from 'https';
import { promisify } from 'util';

const DEPLOYMENT_CONFIG = {
  siteUrl: 'https://theglocal.in',
  maxRetries: 10,
  retryDelay: 10000,
  timeout: 15000
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const checkSiteHealth = async (url) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = https.get(url, {
      timeout: DEPLOYMENT_CONFIG.timeout,
      headers: {
        'User-Agent': 'Deployment-Monitor/1.0'
      }
    }, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (res.statusCode >= 200 && res.statusCode < 400) {
        resolve({
          status: 'healthy',
          statusCode: res.statusCode,
          responseTime,
          headers: res.headers
        });
      } else {
        reject({
          status: 'unhealthy',
          statusCode: res.statusCode,
          responseTime,
          error: `HTTP ${res.statusCode}`
        });
      }
    });
    
    req.on('error', (error) => {
      const endTime = Date.now();
      reject({
        status: 'error',
        responseTime: endTime - startTime,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject({
        status: 'timeout',
        error: 'Request timeout'
      });
    });
  });
};

const monitorDeployment = async () => {
  console.log('🔍 Monitoring deployment health...');
  console.log(`🌐 Checking: ${DEPLOYMENT_CONFIG.siteUrl}`);
  console.log('=====================================');
  
  for (let attempt = 1; attempt <= DEPLOYMENT_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`📊 Health check attempt ${attempt}/${DEPLOYMENT_CONFIG.maxRetries}`);
      
      const health = await checkSiteHealth(DEPLOYMENT_CONFIG.siteUrl);
      
      console.log('✅ Site is healthy!');
      console.log(`   Status: ${health.statusCode}`);
      console.log(`   Response time: ${health.responseTime}ms`);
      
      if (health.headers['content-type']) {
        console.log(`   Content type: ${health.headers['content-type']}`);
      }
      
      // Check for critical resources
      console.log('\n🔍 Checking critical resources...');
      
      try {
        const jsHealth = await checkSiteHealth(`${DEPLOYMENT_CONFIG.siteUrl}/js/main-`);
        console.log('✅ JavaScript files are accessible');
      } catch (error) {
        console.warn('⚠️  JavaScript files may not be fully deployed yet');
      }
      
      try {
        const cssHealth = await checkSiteHealth(`${DEPLOYMENT_CONFIG.siteUrl}/css/main-`);
        console.log('✅ CSS files are accessible');
      } catch (error) {
        console.warn('⚠️  CSS files may not be fully deployed yet');
      }
      
      console.log('\n🎉 Deployment monitoring completed successfully!');
      return true;
      
    } catch (error) {
      console.error(`❌ Health check ${attempt} failed:`, error.error || error.message);
      
      if (attempt < DEPLOYMENT_CONFIG.maxRetries) {
        console.log(`⏳ Waiting ${DEPLOYMENT_CONFIG.retryDelay / 1000}s before retry...`);
        await sleep(DEPLOYMENT_CONFIG.retryDelay);
      } else {
        console.error('\n💥 All health checks failed!');
        console.error('🔧 Troubleshooting suggestions:');
        console.error('   1. Check if GitHub Pages deployment is still in progress');
        console.error('   2. Verify DNS propagation if using custom domain');
        console.error('   3. Check GitHub Actions logs for deployment errors');
        console.error('   4. Ensure all build files are present in the gh-pages branch');
        return false;
      }
    }
  }
};

// Performance monitoring
const runPerformanceCheck = async () => {
  console.log('\n⚡ Running performance check...');
  
  try {
    const health = await checkSiteHealth(DEPLOYMENT_CONFIG.siteUrl);
    
    if (health.responseTime < 1000) {
      console.log('🚀 Excellent performance! (< 1s)');
    } else if (health.responseTime < 3000) {
      console.log('✅ Good performance (< 3s)');
    } else if (health.responseTime < 5000) {
      console.log('⚠️  Moderate performance (< 5s)');
    } else {
      console.log('🐌 Slow performance (> 5s)');
    }
    
    return health.responseTime;
  } catch (error) {
    console.error('❌ Performance check failed:', error.message);
    return null;
  }
};

// Main monitoring process
const main = async () => {
  console.log('🚀 Deployment Monitor');
  console.log('====================');
  
  const startTime = Date.now();
  
  try {
    const healthSuccess = await monitorDeployment();
    
    if (healthSuccess) {
      const responseTime = await runPerformanceCheck();
      
      const totalTime = Date.now() - startTime;
      console.log(`\n📊 Monitoring Summary:`);
      console.log(`   Total monitoring time: ${totalTime}ms`);
      console.log(`   Site response time: ${responseTime}ms`);
      console.log(`   Status: ✅ Healthy`);
      
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Monitoring failed:', error);
    process.exit(1);
  }
};

// Handle termination
process.on('SIGINT', () => {
  console.log('\n🛑 Monitoring interrupted by user');
  process.exit(1);
});

main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});

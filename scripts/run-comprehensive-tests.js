#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Runs all test suites with detailed reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ComprehensiveTestRunner {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, total: 0 },
      integration: { passed: 0, failed: 0, total: 0 },
      security: { passed: 0, failed: 0, total: 0 },
      performance: { passed: 0, failed: 0, total: 0 },
      accessibility: { passed: 0, failed: 0, total: 0 }
    };
    this.startTime = Date.now();
  }

  /**
   * Run all test suites
   */
  async runAllTests() {
    console.log('🧪 Starting Comprehensive Test Suite\n');
    
    try {
      // Run unit tests
      await this.runUnitTests();
      
      // Run integration tests
      await this.runIntegrationTests();
      
      // Run security tests
      await this.runSecurityTests();
      
      // Run performance tests
      await this.runPerformanceTests();
      
      // Run accessibility tests
      await this.runAccessibilityTests();
      
      // Generate comprehensive report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Run unit tests
   */
  async runUnitTests() {
    console.log('📋 Running Unit Tests...');
    
    try {
      const output = execSync('npm run test:fast', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.parseTestOutput('unit', output);
      console.log('✅ Unit tests completed\n');
      
    } catch (error) {
      console.error('❌ Unit tests failed:', error.message);
      this.results.unit.failed++;
    }
  }

  /**
   * Run integration tests
   */
  async runIntegrationTests() {
    console.log('🔗 Running Integration Tests...');
    
    try {
      // Run integration test file
      const testFile = path.join(__dirname, '../src/tests/integration.test.ts');
      if (fs.existsSync(testFile)) {
        const output = execSync(`npx vitest run ${testFile}`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        this.parseTestOutput('integration', output);
        console.log('✅ Integration tests completed\n');
      } else {
        console.log('⚠️ Integration test file not found\n');
      }
      
    } catch (error) {
      console.error('❌ Integration tests failed:', error.message);
      this.results.integration.failed++;
    }
  }

  /**
   * Run security tests
   */
  async runSecurityTests() {
    console.log('🔒 Running Security Tests...');
    
    try {
      // Run security test file
      const testFile = path.join(__dirname, '../src/tests/security.test.ts');
      if (fs.existsSync(testFile)) {
        const output = execSync(`npx vitest run ${testFile}`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        this.parseTestOutput('security', output);
        console.log('✅ Security tests completed\n');
      } else {
        console.log('⚠️ Security test file not found\n');
      }
      
    } catch (error) {
      console.error('❌ Security tests failed:', error.message);
      this.results.security.failed++;
    }
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests() {
    console.log('⚡ Running Performance Tests...');
    
    try {
      // Run performance test file
      const testFile = path.join(__dirname, '../src/tests/performance.test.ts');
      if (fs.existsSync(testFile)) {
        const output = execSync(`npx vitest run ${testFile}`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        this.parseTestOutput('performance', output);
        console.log('✅ Performance tests completed\n');
      } else {
        console.log('⚠️ Performance test file not found\n');
      }
      
    } catch (error) {
      console.error('❌ Performance tests failed:', error.message);
      this.results.performance.failed++;
    }
  }

  /**
   * Run accessibility tests
   */
  async runAccessibilityTests() {
    console.log('♿ Running Accessibility Tests...');
    
    try {
      // Run accessibility tests using axe-core
      const output = execSync('npx @axe-core/cli --exit', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.parseTestOutput('accessibility', output);
      console.log('✅ Accessibility tests completed\n');
      
    } catch (error) {
      console.error('❌ Accessibility tests failed:', error.message);
      this.results.accessibility.failed++;
    }
  }

  /**
   * Parse test output to extract results
   */
  parseTestOutput(suite, output) {
    const lines = output.split('\n');
    let passed = 0;
    let failed = 0;
    let total = 0;

    lines.forEach(line => {
      if (line.includes('✅') || line.includes('PASS')) {
        passed++;
      } else if (line.includes('❌') || line.includes('FAIL')) {
        failed++;
      }
    });

    total = passed + failed;
    
    this.results[suite] = { passed, failed, total };
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    
    const totalTests = Object.values(this.results).reduce((sum, suite) => sum + suite.total, 0);
    const totalPassed = Object.values(this.results).reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, suite) => sum + suite.failed, 0);
    
    console.log('📊 Test Report Summary');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Duration: ${totalDuration}ms`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    console.log('');
    
    // Detailed results by suite
    Object.entries(this.results).forEach(([suite, result]) => {
      if (result.total > 0) {
        const successRate = ((result.passed / result.total) * 100).toFixed(1);
        console.log(`${suite.toUpperCase()}: ${result.passed}/${result.total} (${successRate}%)`);
      }
    });
    
    console.log('');
    
    // Generate HTML report
    this.generateHTMLReport(totalTests, totalPassed, totalFailed, totalDuration);
    
    // Exit with appropriate code
    if (totalFailed > 0) {
      console.log('❌ Some tests failed');
      process.exit(1);
    } else {
      console.log('✅ All tests passed');
      process.exit(0);
    }
  }

  /**
   * Generate HTML test report
   */
  generateHTMLReport(totalTests, totalPassed, totalFailed, duration) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - TheGlocal</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { color: #28a745; }
        .failure { color: #dc3545; }
        .warning { color: #ffc107; }
        .suite-results { margin: 20px 0; }
        .suite { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Test Report - TheGlocal</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="card">
            <h3>Total Tests</h3>
            <p style="font-size: 2em; margin: 0;">${totalTests}</p>
        </div>
        <div class="card">
            <h3>Passed</h3>
            <p style="font-size: 2em; margin: 0;" class="success">${totalPassed}</p>
        </div>
        <div class="card">
            <h3>Failed</h3>
            <p style="font-size: 2em; margin: 0;" class="failure">${totalFailed}</p>
        </div>
        <div class="card">
            <h3>Duration</h3>
            <p style="font-size: 2em; margin: 0;">${duration}ms</p>
        </div>
    </div>
    
    <div class="suite-results">
        <h2>Test Suite Results</h2>
        ${Object.entries(this.results).map(([suite, result]) => `
            <div class="suite">
                <h3>${suite.toUpperCase()}</h3>
                <p>Passed: ${result.passed} | Failed: ${result.failed} | Total: ${result.total}</p>
                <p>Success Rate: ${result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : 0}%</p>
            </div>
        `).join('')}
    </div>
</body>
</html>
    `;
    
    const reportPath = path.join(__dirname, '../test-report.html');
    fs.writeFileSync(reportPath, html);
    console.log(`📄 HTML report generated: ${reportPath}`);
  }
}

// Run the comprehensive test suite
if (require.main === module) {
  const runner = new ComprehensiveTestRunner();
  runner.runAllTests();
}

module.exports = ComprehensiveTestRunner;

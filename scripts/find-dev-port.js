#!/usr/bin/env node

const { exec } = require('child_process');
const netstat = require('netstat');

// Function to find the port where Vite dev server is running
function findVitePort() {
    return new Promise((resolve, reject) => {
        exec('netstat -an', (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            
            // Look for ports in the 8000-9000 range that are listening
            const lines = stdout.split('\n');
            const vitePorts = [];
            
            for (const line of lines) {
                // Match listening ports in the 8000-9000 range
                const match = line.match(/:(\d{4})\s+.*LISTENING/);
                if (match) {
                    const port = parseInt(match[1]);
                    if (port >= 8000 && port <= 9000) {
                        vitePorts.push(port);
                    }
                }
            }
            
            // Return the highest port (likely the most recent Vite instance)
            if (vitePorts.length > 0) {
                const latestPort = Math.max(...vitePorts);
                console.log(`Found Vite dev server on port: ${latestPort}`);
                resolve(latestPort);
            } else {
                console.log('No Vite dev server found. Make sure to run "npm run dev" first.');
                reject(new Error('No Vite dev server found'));
            }
        });
    });
}

// Main execution
if (require.main === module) {
    findVitePort()
        .then(port => {
            console.log(`\nUpdate your launch.json URL to: http://localhost:${port}`);
            console.log('\nOr use this configuration:');
            console.log(JSON.stringify({
                "name": "Launch Chrome (Current Port)",
                "request": "launch",
                "type": "chrome",
                "url": `http://localhost:${port}`,
                "webRoot": "${workspaceFolder}/src",
                "sourceMaps": true,
                "userDataDir": false
            }, null, 2));
        })
        .catch(error => {
            console.error('Error:', error.message);
            process.exit(1);
        });
}

module.exports = { findVitePort };

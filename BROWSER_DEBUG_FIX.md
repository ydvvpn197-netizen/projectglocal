# Browser Debug Launch Fix

## Problem
The error "Unable to launch browser: Unable to attach to browser" occurs when trying to debug in Cursor/VS Code.

## Solution Applied

### 1. Fixed launch.json Configuration
- **Removed duplicate configurations** that were causing conflicts
- **Updated port to 8086** (current Vite dev server port)
- **Added proper webRoot path** pointing to `/src` directory
- **Added sourceMaps support** for better debugging
- **Added runtime arguments** to disable web security for debugging
- **Added auto-detect port configuration** for dynamic port handling

### 2. Created VS Code Settings
- Added proper TypeScript and ESLint configurations
- Enabled auto-imports and code actions
- Configured file associations for React/TypeScript

### 3. Added Tasks Configuration
- Created task to start dev server with proper background detection
- Added build and preview tasks
- Configured problem matcher for Vite output

## How to Use

### Method 1: Using Debug Panel
1. Start the development server: `npm run dev`
2. Open the Debug panel (Ctrl+Shift+D)
3. Select "Launch Chrome (Vite Dev Server)" from the dropdown
4. Click the green play button or press F5

### Method 2: Using Tasks
1. Open Command Palette (Ctrl+Shift+P)
2. Type "Tasks: Run Task"
3. Select "Start Dev Server"
4. Wait for server to start
5. Use debug panel to launch browser

### Method 3: Manual Launch
1. Start dev server: `npm run dev`
2. Open browser manually to `http://localhost:5173`
3. Use "Attach to Chrome" configuration in debug panel

## Troubleshooting

### If browser still won't launch:
1. **Check if Chrome/Edge is installed** and accessible
2. **Verify dev server is running** on port 8086 (or check current port with `node scripts/find-dev-port.js`)
3. **Try different browser** (Chrome vs Edge)
4. **Check Windows firewall** settings
5. **Restart Cursor/VS Code** after configuration changes

### Alternative Ports:
If port 8080 is busy, Vite will use the next available port (8081, 8082, etc.). Your current server is running on port 8086. Use the "Launch Chrome (Auto-detect Port)" configuration or update the URL in launch.json accordingly.

### Port Detection Script:
Run `node scripts/find-dev-port.js` to automatically detect the current Vite dev server port.

### Browser Path Issues:
If you have Chrome/Edge installed in non-standard locations, you may need to add the `runtimeExecutable` property to launch.json:

```json
{
    "name": "Launch Chrome (Custom Path)",
    "request": "launch",
    "type": "chrome",
    "url": "http://localhost:5173",
    "webRoot": "${workspaceFolder}/src",
    "runtimeExecutable": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
}
```

## Configuration Files Created/Modified:
- `.vscode/launch.json` - Debug configurations
- `.vscode/settings.json` - VS Code settings
- `.vscode/tasks.json` - Build and dev server tasks

## Next Steps:
1. Try launching the debugger using Method 1 above
2. If issues persist, check the troubleshooting section
3. Verify that the development server is running on the correct port

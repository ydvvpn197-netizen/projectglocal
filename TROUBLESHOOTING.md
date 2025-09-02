# CSS Loading Troubleshooting Guide

## Issue: Project Loading as Plain HTML

If your project is loading as plain HTML without styling, follow these steps:

### 1. Check the Correct URL

**Development Mode:**
- Use: `http://localhost:8080`
- NOT: `file://` URLs or direct HTML file access

**Production Mode:**
- Use: `http://localhost:4173` (after running `npm run preview`)
- Or serve the `dist/` folder from a web server

### 2. Verify CSS is Loading

1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for CSS files being loaded
5. Check for any 404 errors

### 3. Check Console for Errors

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for JavaScript errors
4. Look for CSS loading errors

### 4. Common Solutions

#### Solution 1: Clear Browser Cache
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache and cookies
- Try incognito/private browsing mode

#### Solution 2: Check File Paths
- Ensure you're running from the project root directory
- Verify `node_modules` exists
- Check that `package.json` is present

#### Solution 3: Reinstall Dependencies
```bash
npm run clean:all
npm install
```

#### Solution 4: Rebuild the Project
```bash
npm run build
npm run preview
```

### 5. Development vs Production

**Development Mode (`npm run dev`):**
- URL: `http://localhost:8080`
- Hot reload enabled
- CSS processed on-the-fly
- Source maps available

**Production Mode (`npm run preview`):**
- URL: `http://localhost:4173`
- Optimized build
- CSS minified and bundled
- No source maps

### 6. CSS Fallback System

The project includes a CSS fallback system that provides basic styling even if Tailwind fails to load:

- Basic layout utilities (`.container`, `.grid`, `.flex`)
- Basic component styles (`.btn`, `.card`, `.nav`)
- Responsive design support
- Color utilities

### 7. File Structure Check

Ensure these files exist and are correct:
```
projectglocal/
├── src/
│   ├── index.css          # Main CSS file with Tailwind imports
│   └── main.tsx           # Entry point
├── tailwind.config.ts     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
├── vite.config.ts         # Vite configuration
└── package.json           # Dependencies
```

### 8. Browser Compatibility

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Enable JavaScript
- Allow CSS loading
- Check Content Security Policy settings

### 9. Network Issues

- Check firewall settings
- Verify proxy configuration
- Try different network (mobile hotspot, etc.)
- Check if corporate network blocks localhost

### 10. Still Not Working?

If none of the above solutions work:

1. Check the browser console for specific error messages
2. Verify all dependencies are installed correctly
3. Try a different browser
4. Check if antivirus software is blocking localhost
5. Restart your computer and try again

## Quick Test

Open `test-styles.html` in your browser to test if CSS is working independently of the React app.

## Support

If you continue to have issues, check:
- Browser console errors
- Network tab for failed requests
- Terminal output for build errors
- File permissions and paths

// Deployment configuration for theglocal.in
module.exports = {
  // Production build settings
  build: {
    // Output directory
    outDir: 'dist',
    
    // Base URL for the domain
    base: '/',
    
    // Assets directory
    assetsDir: 'assets',
    
    // Source maps (disabled for production)
    sourcemap: false,
    
    // Minification
    minify: 'terser',
    
    // Rollup options
    rollupOptions: {
      output: {
        // Chunk file names
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
  },
  
  // Server configuration for production
  server: {
    // Enable SPA routing
    historyApiFallback: true,
    
    // Headers for security
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  
  // Environment variables
  env: {
    VITE_SUPABASE_URL: 'https://tepvzhbgobckybyhryuj.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcHZ6aGJnb2Jja3lieWhyeXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODIzNzQsImV4cCI6MjA2OTk1ODM3NH0.RBtDkdzRu-rgRs-kYHj9zlChhqO7lLvrnnVR2vBwji4',
    VITE_APP_URL: 'https://theglocal.in',
  },
};

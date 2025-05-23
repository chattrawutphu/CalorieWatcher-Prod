#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting performance optimization...');

// 1. Clean up unused files
function cleanupUnusedFiles() {
  console.log('🧹 Cleaning up unused files...');
  
  const filesToRemove = [
    'app/(main)/_social_disabled',
    'app/api/social',
    'app/locales/social',
    'components/social',
    'lib/social',
  ];
  
  filesToRemove.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Removed: ${filePath}`);
    }
  });
}

// 2. Optimize package.json
function optimizePackageJson() {
  console.log('📦 Optimizing package.json...');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Add performance scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'analyze': 'ANALYZE=true npm run build',
    'perf:monitor': 'node scripts/performance-monitor.js',
    'perf:optimize': 'node scripts/optimize-performance.js',
    'build:fast': 'next build --experimental-build-mode=compile',
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json with performance scripts');
}

// 3. Create performance monitoring script
function createPerformanceMonitor() {
  console.log('📊 Creating performance monitor...');
  
  const monitorScript = `
const { PerformanceMonitor, monitorMemoryUsage, FPSMonitor } = require('../lib/utils/performance-monitor');

// Initialize performance monitoring
const monitor = PerformanceMonitor.getInstance();
const fpsMonitor = new FPSMonitor();

console.log('🔍 Starting performance monitoring...');

// Start monitoring
monitor.startMonitoring();
fpsMonitor.start();

// Monitor memory usage every 30 seconds
setInterval(() => {
  monitorMemoryUsage();
  console.log('FPS:', fpsMonitor.getFPS());
}, 30000);

// Log performance metrics every 5 minutes
setInterval(() => {
  monitor.logPerformanceIssues();
  console.log('Performance metrics:', monitor.getMetrics());
}, 300000);

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('🛑 Stopping performance monitoring...');
  monitor.cleanup();
  fpsMonitor.stop();
  process.exit(0);
});
`;
  
  const scriptPath = path.join(process.cwd(), 'scripts', 'performance-monitor.js');
  fs.writeFileSync(scriptPath, monitorScript);
  console.log('✅ Created performance monitor script');
}

// 4. Optimize Tailwind CSS
function optimizeTailwind() {
  console.log('🎨 Optimizing Tailwind CSS...');
  
  const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
  
  if (fs.existsSync(tailwindConfigPath)) {
    let config = fs.readFileSync(tailwindConfigPath, 'utf8');
    
    // Add performance optimizations
    if (!config.includes('experimental')) {
      config = config.replace(
        'module.exports = {',
        `module.exports = {
  experimental: {
    optimizeUniversalDefaults: true,
  },
  future: {
    hoverOnlyWhenSupported: true,
  },`
      );
      
      fs.writeFileSync(tailwindConfigPath, config);
      console.log('✅ Optimized Tailwind CSS configuration');
    }
  }
}

// 5. Create .env.local with performance settings
function createEnvLocal() {
  console.log('⚙️ Creating performance environment settings...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = `
# Performance optimizations
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production

# Mobile optimizations
NEXT_OPTIMIZE_FONTS=true
NEXT_OPTIMIZE_IMAGES=true

# Bundle analysis
ANALYZE=false

# PWA settings
PWA_ENABLED=true
`;
  
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local with performance settings');
  }
}

// 6. Create performance README
function createPerformanceReadme() {
  console.log('📚 Creating performance documentation...');
  
  const readmeContent = `# Performance Optimizations

## Mobile-First Optimizations

### 1. Bundle Optimizations
- Removed social features and unused code
- Enabled SWC minification
- Optimized image formats (WebP, AVIF)
- Implemented code splitting

### 2. Runtime Optimizations
- Virtual scrolling for long lists
- Lazy loading for images and components
- Throttled scroll and resize handlers
- Batched state updates

### 3. Device-Specific Optimizations
- Low-end device detection
- Reduced animations for slow devices
- Adaptive prefetching strategy
- Memory usage monitoring

### 4. Caching Strategy
- Service Worker caching
- Route prefetching
- Image caching
- API response caching

## Performance Monitoring

### Scripts
- \`npm run perf:monitor\` - Start performance monitoring
- \`npm run analyze\` - Analyze bundle size
- \`npm run build:fast\` - Fast build mode

### Metrics Tracked
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Memory usage
- FPS monitoring

## Best Practices

1. Use \`LazyImage\` for all images
2. Use \`VirtualList\` for long lists (>100 items)
3. Implement proper error boundaries
4. Use React.memo for expensive components
5. Optimize re-renders with useCallback and useMemo

## Mobile Specific

- Touch event optimizations
- Viewport meta tag optimization
- iOS momentum scrolling
- Prevent zoom on input focus
`;
  
  const readmePath = path.join(process.cwd(), 'PERFORMANCE.md');
  fs.writeFileSync(readmePath, readmeContent);
  console.log('✅ Created performance documentation');
}

// Run all optimizations
async function main() {
  try {
    cleanupUnusedFiles();
    optimizePackageJson();
    createPerformanceMonitor();
    optimizeTailwind();
    createEnvLocal();
    createPerformanceReadme();
    
    console.log('\n🎉 Performance optimization completed!');
    console.log('\nNext steps:');
    console.log('1. Run `npm run build` to test optimizations');
    console.log('2. Run `npm run analyze` to check bundle size');
    console.log('3. Run `npm run perf:monitor` to start monitoring');
    
  } catch (error) {
    console.error('❌ Error during optimization:', error);
    process.exit(1);
  }
}

main(); 
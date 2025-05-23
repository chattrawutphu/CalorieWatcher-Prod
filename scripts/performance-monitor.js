
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

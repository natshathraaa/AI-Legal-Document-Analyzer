require('dotenv').config();

// Require the analysis queue which registers the processor
const analysisQueue = require('./jobs/analysisQueue');

console.log('✅ LexAI Bull worker started');

// Keep the process alive. Also handle graceful shutdown.
process.on('SIGINT', async () => {
  console.log('Shutting down LexAI Bull worker...');
  try {
    if (analysisQueue && typeof analysisQueue.close === 'function') {
      await analysisQueue.close();
    }
  } catch (e) {
    // ignore
  }
  process.exit(0);
});

// fallback keep-alive for environments that don't send signals
setInterval(() => {}, 1 << 30);

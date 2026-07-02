(async ()=>{
  try{
    const q = require('../jobs/analysisQueue');
    console.log('queue type:', typeof q);
    console.log('queue keys:', Object.keys(q));
    console.log('queue name:', q.name || q._name || q.queueName || q.client?.name);
    // attempt to see internal processor count if available
    console.log('hasProcessMethod:', typeof q.process === 'function');
    await new Promise(r=>setTimeout(r,500));
    process.exit(0);
  }catch(e){console.error('err', e); process.exit(1);} })();

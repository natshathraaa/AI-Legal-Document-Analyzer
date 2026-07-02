(async ()=>{
  try{
    require('dotenv').config();
    const { createClient } = require('redis');
    const client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (e)=>{});
    await client.connect();
    const keys = await client.keys('bull:document-analysis*');
    console.log('keys:', keys);
    const lists = ['wait', 'active', 'completed', 'failed', 'delayed', 'paused'];
    for (const l of lists) {
      const k = `bull:document-analysis:${l}`;
      try{
        const len = await client.lLen(k);
        console.log(k, len);
      }catch(e){console.log(k, 'error', e.message)}
    }
    await client.disconnect();
  }catch(e){console.error('inspect error', e.message||e); process.exit(1);} })();

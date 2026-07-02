(async ()=>{
  try{
    require('dotenv').config();
    const { createClient } = require('redis');
    const client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err)=>console.error('redis err', err));
    await client.connect();
    const r = await client.ping();
    console.log('redis ping:', r);
    await client.disconnect();
  }catch(e){
    console.error('redis check failed', e.message || e);
    process.exit(1);
  }
})();

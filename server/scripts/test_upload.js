(async ()=>{
  try{
    const fetch = global.fetch;
    const fs = require('fs');
    const FormData = require('form-data');
    const base = 'http://localhost:5000';
    const email = 'test+pipeline@example.com';
    const password = 'TestPass123';

    // login
    const loginRes = await fetch(base + '/api/auth/login', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email,password})
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) { console.error('login failed', loginJson); process.exit(1); }
    const token = loginJson.token;
    console.log('token obtained');

    const form = new FormData();
    form.append('file', fs.createReadStream('test_upload.pdf'), { filename: 'test_upload.pdf', contentType: 'application/pdf' });

    const axios = require('axios');
    const headers = { 'Authorization': 'Bearer ' + token, ...form.getHeaders() };
    const res = await axios.post(base + '/api/documents/upload', form, { headers, maxBodyLength: Infinity });
    let text;
    try {
      // axios returns data already parsed when JSON
      console.log('upload status', res.status, res.data);
    } catch (e) {
      console.error('upload fetch read error', e);
    }
  }catch(e){ console.error('upload error', e); process.exit(1); }
})();

(async () => {
  try {
    const fetch = global.fetch;
    if (!fetch) {
      console.error('fetch not available in this Node environment');
      process.exit(1);
    }

    const base = 'http://localhost:5000';

    // 1) Register (or login if already exists)
    const email = 'test+pipeline@example.com';
    const password = 'TestPass123';
    let userId;

    let registerRes = await fetch(base + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email, password })
    });

    let registerJson = await registerRes.json();

    if (!registerRes.ok) {
      if (registerJson && registerJson.message && registerJson.message.includes('Email already registered')) {
        // login
        const loginRes = await fetch(base + '/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginJson = await loginRes.json();
        if (!loginRes.ok) {
          console.error('Login failed', loginJson);
          process.exit(1);
        }
        userId = loginJson.user.id;
        console.log('Logged in existing user', userId);
      } else {
        console.error('Register failed', registerJson);
        process.exit(1);
      }
    } else {
      userId = registerJson.user.id;
      console.log('Registered user', userId);
    }

    // 2) Insert document directly into DB
    const db = require('../db');
    const rawText = 'This is a sample contract clause: Payment due within 30 days. Termination on breach.';

    const insertRes = await db.query(
      'INSERT INTO documents (user_id, filename, original_name, doc_type, raw_text, overall_risk_score, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [userId, 'testdoc.pdf', 'testdoc.pdf', 'unknown', rawText, 0, 'processing']
    );

    const documentId = insertRes.rows[0].id;
    console.log('Inserted document id', documentId);

    // 3) Enqueue job
    const analysisQueue = require('../jobs/analysisQueue');
    await analysisQueue.add({ documentId, rawText });
    console.log('Enqueued job for document', documentId);

    process.exit(0);
  } catch (err) {
    console.error('Script error', err);
    process.exit(1);
  }
})();

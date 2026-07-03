(async () => {
  try {
    const db = require('../db');
    const id = 4;
    const r = await db.query('SELECT id, status, overall_risk_score, created_at FROM documents WHERE id = $1', [id]);
    console.log(r.rows);
  } catch (err) {
    console.error('check error', err);
    process.exit(1);
  }
})();

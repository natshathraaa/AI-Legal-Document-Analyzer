(async () => {
  try {
    const db = require('../db');
    const docId = 4;
    const doc = await db.query('SELECT id, status, overall_risk_score FROM documents WHERE id=$1', [docId]);
    console.log('document:', doc.rows[0]);
    const clauses = await db.query('SELECT id, clause_type, original_text, risk_score FROM clauses WHERE document_id=$1', [docId]);
    console.log('clauses count:', clauses.rows.length);
    console.log(clauses.rows.slice(0,10));
  } catch (err) {
    console.error(err);
  }
})();

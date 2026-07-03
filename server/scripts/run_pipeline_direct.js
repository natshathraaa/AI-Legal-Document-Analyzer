(async () => {
  try {
    const db = require('../db');
    const pipeline = require('../agents/pipeline');
    const id = 4;
    const r = await db.query('SELECT raw_text FROM documents WHERE id = $1', [id]);
    if (r.rows.length === 0) throw new Error('Document not found');
    const rawText = r.rows[0].raw_text;
    await pipeline.runDocumentPipeline(id, rawText);
    console.log('Pipeline run finished');
  } catch (err) {
    console.error('Pipeline direct error', err);
    process.exit(1);
  }
})();

(async () => {
  try {
    const id = process.argv[2];
    if (!id) throw new Error('Provide document id as arg');
    const db = require('../db');
    const pipeline = require('../agents/pipeline');
    const r = await db.query('SELECT raw_text FROM documents WHERE id = $1', [id]);
    if (r.rows.length === 0) throw new Error('Document not found');
    const rawText = r.rows[0].raw_text;
    console.log('Running pipeline for document', id);
    await pipeline.runDocumentPipeline(id, rawText);
    console.log('Done');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

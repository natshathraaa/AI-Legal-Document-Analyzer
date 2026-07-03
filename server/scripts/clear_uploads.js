(async () => {
  const db = require('../db')
  const fs = require('fs')
  const path = require('path')

  try {
    const res = await db.query("SELECT id, filename FROM documents WHERE doc_type = 'pdf'")
    const rows = res.rows || []
    for (const r of rows) {
      const filePath = path.join(__dirname, '..', 'uploads', r.filename || '')
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      } catch (e) {
        console.error('Failed to unlink', filePath, e.message)
      }
      try {
        await db.query('DELETE FROM clauses WHERE document_id=$1', [r.id])
      } catch (e) {
        console.error('Failed to delete clauses for', r.id, e.message)
      }
    }

    await db.query("DELETE FROM documents WHERE doc_type = 'pdf'")
    console.log('Cleared PDF documents and clauses from database and removed files where present.')
    process.exit(0)
  } catch (err) {
    console.error('Error while clearing uploads:', err)
    process.exit(1)
  }
})()

const db = require('../db/index')

async function main() {
  try {
    await db.query(`
      CREATE TABLE document_chats (
        id SERIAL PRIMARY KEY,
        document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        source_clause_ids INTEGER[],
        created_at TIMESTAMP DEFAULT NOW()
      );
    `)

    console.log('document_chats table created successfully')
    process.exit(0)
  } catch (error) {
    console.error('Failed to create document_chats table:', error.message)
    process.exit(1)
  }
}

main()

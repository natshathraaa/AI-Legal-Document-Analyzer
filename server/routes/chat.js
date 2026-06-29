const express = require('express')
const router = express.Router()
const db = require('../db/index')
const { callGemini } = require('../utils/geminiClient')
const authenticateToken = require('../middleware/authMiddleware')

function findRelevantClauses(question, clauses) {
  const stopWords = ['what', 'who', 'how', 'when', 'where', 'is', 'are',
    'can', 'the', 'my', 'me', 'do', 'does', 'will', 'and', 'or', 'a', 'an',
    'to', 'of', 'in', 'for', 'on', 'with', 'about', 'that', 'this', 'they']

  const questionWords = question
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .filter(word => word.length > 3 && !stopWords.includes(word))

  if (questionWords.length === 0) return clauses.slice(0, 4)

  const scored = clauses.map(clause => {
    const searchText = (
      (clause.clause_type || '') + ' ' +
      (clause.original_text || '') + ' ' +
      (clause.risk_type || '') + ' ' +
      (clause.risk_explanation || '')
    ).toLowerCase()

    let score = 0
    for (const word of questionWords) {
      if (searchText.includes(word)) score++
    }

    return { ...clause, matchScore: score }
  })

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5)
}

router.post('/:documentId', authenticateToken, async (req, res) => {
  try {
    const documentId = parseInt(req.params.documentId, 10)
    const { question, history } = req.body

    if (!question) {
      return res.status(400).json({ error: 'Question is required' })
    }

    const documentResult = await db.query(
      'SELECT id FROM documents WHERE id = $1 AND user_id = $2',
      [documentId, req.user.id]
    )

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' })
    }

    const clausesResult = await db.query(
      `SELECT id, clause_type, original_text, risk_score, risk_explanation,
              risk_type, severity, standard_comparison
       FROM clauses WHERE document_id = $1 ORDER BY risk_score DESC`,
      [documentId]
    )

    const clauses = clausesResult.rows

    if (clauses.length === 0) {
      return res.status(200).json({
        answer: 'No clauses found for this document. The analysis may still be processing.',
        sources: []
      })
    }

    const relevantClauses = findRelevantClauses(question, clauses)

    const context = relevantClauses.map((clause, index) =>
      `Clause ${index + 1} [${clause.clause_type}] (Risk: ${clause.risk_score}/10):\n${clause.original_text}\nRisk: ${clause.risk_explanation || 'N/A'}`
    ).join('\n\n---\n\n')

    const historyText = (history || [])
      .slice(-6)
      .map(message => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
      .join('\n')

    const prompt = `You are a legal assistant helping someone understand their contract.
Answer the user's question clearly and directly using ONLY the contract
clauses provided below. Use plain English — no legal jargon.

Rules:
- Answer directly and concisely
- If the answer is in the clauses, quote the relevant part briefly
- If you cannot find the answer in the clauses, say exactly:
  'I could not find specific information about that in your contract clauses.'
- Never make up information not found in the clauses
- Keep your answer under 150 words

CONTRACT CLAUSES:
${context}

CONVERSATION HISTORY:
${historyText}

USER QUESTION: ${question}

ANSWER:`

    const geminiResponse = await callGemini(prompt)

    await db.query(
      `INSERT INTO document_chats (document_id, user_id, question, answer, source_clause_ids)
       VALUES ($1, $2, $3, $4, $5)`,
      [documentId, req.user.id, question, geminiResponse, relevantClauses.map(clause => clause.id)]
    )

    return res.json({
      answer: geminiResponse,
      sources: relevantClauses.map(clause => ({
        id: clause.id,
        clause_type: clause.clause_type,
        risk_score: clause.risk_score
      }))
    })
  } catch (error) {
    console.error('Chat POST error:', error)
    return res.status(500).json({ error: 'Failed to process chat request' })
  }
})

router.get('/:documentId', authenticateToken, async (req, res) => {
  try {
    const documentId = parseInt(req.params.documentId, 10)

    const documentResult = await db.query(
      'SELECT id FROM documents WHERE id = $1 AND user_id = $2',
      [documentId, req.user.id]
    )

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' })
    }

    const chatsResult = await db.query(
      `SELECT id, question, answer, source_clause_ids, created_at
       FROM document_chats
       WHERE document_id = $1 AND user_id = $2
       ORDER BY created_at ASC`,
      [documentId, req.user.id]
    )

    return res.json(chatsResult.rows)
  } catch (error) {
    console.error('Chat GET error:', error)
    return res.status(500).json({ error: 'Failed to fetch chat history' })
  }
})

module.exports = router

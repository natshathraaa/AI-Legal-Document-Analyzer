const db = require('../db/index')
const { extractClauses } = require('./extractClauses')
const { analyzeRisk, analyzeRisks } = require('./analyzeRisk')
const { compareStandard } = require('./compareStandard')
const { suggestNegotiation } = require('./suggestNegotiation')

async function runDocumentPipeline(documentId, rawText) {
  try {
    console.log('Pipeline started for document', documentId)

    // STEP 1 — Extract clauses and metadata
    console.log('Step 1: Extracting clauses...')
    const extracted = await extractClauses(rawText)
    console.log('Extracted', extracted.clauses.length, 'clauses, doc_type:', extracted.doc_type)

    // STEP 2 — Update document with metadata
    await db.query(
      'UPDATE documents SET doc_type = $1, parties = $2, effective_date = $3 WHERE id = $4',
      [
        extracted.doc_type,
        JSON.stringify(extracted.parties),
        extracted.effective_date,
        documentId
      ]
    )

    // STEP 3 — Analyze risk for all clauses (batched to reduce API calls)
    console.log('Step 3: Analyzing risk...')
    const analyzed = await analyzeRisks(extracted.clauses)

    // STEP 4 — Compare to standards for all clauses (sequential with delay to avoid rate limits)
    console.log('Step 4: Comparing to standards...')
    const compared = []
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    for (const clause of analyzed) {
      try {
        const result = await compareStandard(clause)
        compared.push(result)
        console.log('Compared clause')
      } catch (e) {
        console.error('Compare failed for clause:', e.message || e)
        compared.push(clause)
      }
      await delay(1500)
    }

    // STEP 5 — Suggest negotiations only for high risk clauses (sequential with delay)
    console.log('Step 5: Generating negotiation suggestions...')
    const final = []
    for (const clause of compared) {
      try {
        if (clause.risk_score > 6) {
          const res = await suggestNegotiation(clause)
          final.push(res)
          console.log('Suggested negotiation for clause')
          await delay(1500)
        } else {
          final.push(clause)
        }
      } catch (e) {
        console.error('Suggestion failed for clause:', e.message || e)
        final.push(clause)
      }
    }

    // STEP 6 — Calculate overall risk score
    const overall = Math.round(
      final.reduce((sum, c) => sum + (c.risk_score || 5), 0) / final.length
    )
    console.log('Overall risk score:', overall)

    // STEP 7 — Insert all clauses into PostgreSQL
    console.log('Step 7: Saving clauses to database...')
    for (const clause of final) {
      await db.query(
        `INSERT INTO clauses
         (document_id, clause_type, original_text, risk_score, risk_explanation,
          risk_type, severity, suggested_text, negotiation_reasoning, standard_comparison)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          documentId,
          clause.clause_type || 'other',
          clause.original_text || '',
          clause.risk_score || 5,
          clause.risk_explanation || null,
          clause.risk_type || null,
          clause.severity || 'MEDIUM',
          clause.suggested_text || null,
          clause.negotiation_reasoning || null,
          clause.standard_comparison || null
        ]
      )
    }

    // STEP 8 — Mark document as completed
    await db.query(
      'UPDATE documents SET status = $1, overall_risk_score = $2 WHERE id = $3',
      ['completed', overall, documentId]
    )

    console.log('Pipeline completed successfully for document', documentId)

  } catch (err) {
    console.error('Pipeline failed for document', documentId, err.message)
    await db.query(
      'UPDATE documents SET status = $1 WHERE id = $2',
      ['failed', documentId]
    )
  }
}

module.exports = { runDocumentPipeline }

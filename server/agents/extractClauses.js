const { callGemini, safeParseJSON } = require('../utils/geminiClient')

async function extractClauses(rawText) {
  const prompt = `You are a legal document parser. Analyze the contract text below and return ONLY a valid JSON object. No markdown, no code fences, no explanation. Just the raw JSON object.

Return exactly this structure:
{
  "parties": ["Party A full name", "Party B full name"],
  "effective_date": "date string or null",
  "doc_type": "one of: NDA, employment, freelance, rental, service, partnership, other",
  "clauses": [
    {
      "clause_type": "one of: payment, termination, ip_ownership, non_compete, liability, confidentiality, governing_law, dispute_resolution, indemnification, other",
      "original_text": "exact text of this clause copied from the document",
      "obligations": ["obligation 1", "obligation 2"]
    }
  ]
}

Rules:
- Extract every distinct clause you can find
- clause_type must be exactly one of the values listed above
- original_text must be the actual text from the document, not a summary
- Return at minimum 3 clauses even for short contracts
- parties must be the actual names found in the document

Example input and expected output (for guidance only):
Input:
"""
Party A: Acme Corp\nParty B: Beta LLC\nEffective Date: January 1, 2023\n\n1. Payment: Buyer will pay $10,000 within 30 days.\n2. Termination: Either party may terminate with 30 days notice.\n3. Confidentiality: Each party will keep confidential information secret.\n+"""

Expected JSON:
{
  "parties": ["Acme Corp", "Beta LLC"],
  "effective_date": "2023-01-01",
  "doc_type": "service",
  "clauses": [
    { "clause_type": "payment", "original_text": "Payment: Buyer will pay $10,000 within 30 days.", "obligations": ["Buyer pays $10,000 within 30 days"] },
    { "clause_type": "termination", "original_text": "Termination: Either party may terminate with 30 days notice.", "obligations": ["Either party may terminate with 30 days notice"] },
    { "clause_type": "confidentiality", "original_text": "Confidentiality: Each party will keep confidential information secret.", "obligations": ["Keep confidential information secret"] }
  ]
}

Contract text:
${rawText}`

  const response = await callGemini(prompt)

  const fallback = {
    parties: [],
    effective_date: null,
    doc_type: 'other',
    clauses: []
  }

  const parsed = safeParseJSON(response, fallback)

  // Ensure at least 3 clauses so the pipeline can continue even if the model fails
  if (!parsed.clauses || parsed.clauses.length < 3) {
    const sentences = rawText
      .split(/\.|\n/) // split on periods or newlines
      .map(s => s.trim())
      .filter(Boolean)

    const clauses = []
    for (let i = 0; i < 3; i++) {
      const text = sentences[i] || sentences.slice(i*2, i*2+2).join('. ') || 'Clause text not available.'
      clauses.push({
        clause_type: 'other',
        original_text: text,
        obligations: []
      })
    }

    parsed.clauses = clauses
    parsed.doc_type = parsed.doc_type || 'other'
  }

  return parsed
}

module.exports = { extractClauses }

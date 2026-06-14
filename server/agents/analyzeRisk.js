const { callGemini, safeParseJSON } = require('../utils/geminiClient')

async function analyzeRisk(clause) {
  const prompt = `You are a legal risk analyst. Analyze this contract clause and return ONLY valid JSON. No markdown, no code fences, no explanation.

Return exactly this structure:
{
  "risk_score": <integer between 1 and 10>,
  "risk_type": "<short label such as: IP Trap, Unlimited Liability, One-sided Termination, Evergreen NDA, Broad Non-Compete, No Payment Protection, Unfair Penalty, etc>",
  "severity": "<exactly one of: HIGH, MEDIUM, LOW>",
  "risk_explanation": "<2-3 plain English sentences explaining the risk to someone who is not a lawyer>"
}

Scoring guide:
- 8 to 10: Severely unfair, dangerous, or exploitative clause
- 5 to 7: Somewhat unfair or unusual, worth negotiating  
- 1 to 4: Standard and acceptable clause

severity must match risk_score exactly:
- risk_score 7 to 10 → severity must be HIGH
- risk_score 4 to 6 → severity must be MEDIUM
- risk_score 1 to 3 → severity must be LOW

Clause type: ${clause.clause_type}
Clause text: ${clause.original_text}`

  const response = await callGemini(prompt)

  const fallback = {
    risk_score: 5,
    risk_type: 'Unknown',
    severity: 'MEDIUM',
    risk_explanation: 'Could not analyze this clause automatically.'
  }

  const parsed = safeParseJSON(response, fallback)
  return { ...clause, ...parsed }
}

async function analyzeRisks(clauses) {
  if (!Array.isArray(clauses) || clauses.length === 0) return []

  const combined = clauses.map((c, idx) => `CLAUSE_INDEX:${idx}\nTYPE:${c.clause_type}\nTEXT:${c.original_text}`).join('\n\n')

  const prompt = `You are a legal risk analyst. Analyze each clause below and return ONLY valid JSON array where each element corresponds to the same index in the input list. No markdown, no code fences, no explanation.\n\nReturn an array of objects of the form: { "risk_score": <1-10>, "risk_type": "<label>", "severity": "<HIGH|MEDIUM|LOW>", "risk_explanation": "<2-3 sentences>" }\n\nClauses:\n${combined}`

  const response = await callGemini(prompt)

  const fallback = clauses.map(c => ({
    ...c,
    risk_score: 5,
    risk_type: 'Unknown',
    severity: 'MEDIUM',
    risk_explanation: 'Could not analyze this clause automatically.'
  }))

  const parsedArray = safeParseJSON(response, null)
  if (!Array.isArray(parsedArray) || parsedArray.length !== clauses.length) {
    return fallback
  }

  return clauses.map((c, i) => ({ ...c, ...parsedArray[i] }))
}

module.exports = { analyzeRisk, analyzeRisks }

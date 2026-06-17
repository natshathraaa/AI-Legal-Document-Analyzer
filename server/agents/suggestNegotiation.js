const { callGemini, safeParseJSON } = require('../utils/geminiClient')

async function suggestNegotiation(clause) {
  const prompt = `You are a contract negotiation expert representing the receiving party such as a freelancer, employee, or tenant. Rewrite the risky clause below to be fair and balanced for both sides. Return ONLY valid JSON. No markdown, no code fences.

Return exactly this structure:
{
  "suggested_text": "<full rewritten clause text that is fair to both parties>",
  "negotiation_reasoning": "<2-3 sentences explaining what you changed and why it better protects the receiving party>"
}

Risk identified: ${clause.risk_type}
Why it is risky: ${clause.risk_explanation}
Original clause: ${clause.original_text}`

  const response = await callGemini(prompt)

  const fallback = {
    suggested_text: null,
    negotiation_reasoning: null
  }

  const parsed = safeParseJSON(response, fallback)
  return { ...clause, ...parsed }
}

module.exports = { suggestNegotiation }

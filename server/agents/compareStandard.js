const { callGemini, safeParseJSON } = require('../utils/geminiClient')

const standardTexts = {
  payment: "Payment shall be made within 30 days of invoice receipt. Late payments accrue interest at 1.5% per month.",
  termination: "Either party may terminate with 30 days written notice. Termination for cause requires written notice and a 7-day cure period.",
  ip_ownership: "Intellectual property created specifically for this project and fully paid for belongs to the client. The contractor retains all rights to pre-existing work, tools, and frameworks.",
  non_compete: "Non-compete restrictions are limited to 6 months post-contract and apply only to direct competitors in the same geographic market.",
  liability: "Total liability is capped at the total fees paid under this contract. Neither party is liable for indirect, incidental, or consequential damages.",
  confidentiality: "Confidential information must be protected for 2 years after contract termination. Excludes information already in the public domain.",
  governing_law: "This agreement is governed by the laws of the jurisdiction where the primary services are delivered.",
  dispute_resolution: "Disputes shall first be attempted through good-faith negotiation, then mediation, before any arbitration or litigation.",
  indemnification: "Each party indemnifies the other solely for damages arising from their own negligence or willful misconduct.",
  other: "Standard commercial terms and conditions apply as per industry norms and applicable law."
}

async function compareStandard(clause) {
  const standardText = standardTexts[clause.clause_type] || standardTexts.other

  const prompt = `You are a contract standards expert. Compare the contract clause against the industry standard below. Return ONLY valid JSON. No markdown, no code fences.

Return exactly this structure:
{
  "standard_comparison": "<2-3 sentences explaining how this clause differs from the industry standard and whether it is more or less favorable to the receiving party such as employee, freelancer, or tenant>"
}

Industry standard for ${clause.clause_type} clauses:
${standardText}

Actual contract clause:
${clause.original_text}`

  const response = await callGemini(prompt)

  const fallback = {
    standard_comparison: 'Could not compare this clause to the industry standard.'
  }

  const parsed = safeParseJSON(response, fallback)
  return { ...clause, ...parsed }
}

module.exports = { compareStandard }

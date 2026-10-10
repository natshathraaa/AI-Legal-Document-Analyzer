const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Lazily discover a model supported by this API key. We call the ListModels
// endpoint and pick a likely candidate that supports generateContent.
let model = null
let _modelDiscoveryInProgress = null
let _resolvedModelName = null

async function discoverModelName() {
  if (_modelDiscoveryInProgress) return _modelDiscoveryInProgress
  _modelDiscoveryInProgress = (async () => {
    try {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models'
      const res = await fetch(url, { headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY } })
      if (!res.ok) return process.env.GEMINI_MODEL || 'gemini-1.5'
      const js = await res.json()
      const list = js.models || js.model || []
      if (!Array.isArray(list) || list.length === 0) return process.env.GEMINI_MODEL || 'gemini-1.5'
      const names = list.map(m => (m.name || m).toString())
      const prefer = names.find(n => /gemini/i.test(n))
      if (prefer) return prefer
      const preferChat = names.find(n => /chat|bison|text/i.test(n))
      if (preferChat) return preferChat
      return names[0]
    } catch (e) {
      return process.env.GEMINI_MODEL || 'gemini-1.5'
    }
  })()
  return _modelDiscoveryInProgress
}

async function ensureModel() {
  if (model) return model
  const modelName = await discoverModelName()
  try {
    const resolvedName = process.env.GEMINI_MODEL || modelName
    _resolvedModelName = resolvedName
    console.log('Using Gemini model:', resolvedName)
    model = genAI.getGenerativeModel({ model: resolvedName })
  } catch (e) {
    const fallbackName = process.env.GEMINI_MODEL || 'gemini-1.5'
    console.warn('Failed to create model with', process.env.GEMINI_MODEL || modelName, 'falling back to', fallbackName)
    _resolvedModelName = fallbackName
    model = genAI.getGenerativeModel({ model: fallbackName })
  }
  return model
}

async function callGemini(prompt) {
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {

    try {
      // Ensure model instance is ready (discovers model on first call)
      const resolvedModel = await ensureModel()

      if (resolvedModel && typeof resolvedModel.generateContent === 'function') {
        const result = await resolvedModel.generateContent(prompt)
        try {
          // Log a small debug snippet of the raw response for diagnostics
          if (result && result.response && typeof result.response.text === 'function') {
            const raw = result.response.text()
            console.log('[Gemini] raw response snippet:', raw && raw.toString ? raw.toString().slice(0,200) : String(raw).slice(0,200))
          }
        } catch (e) {
          // ignore logging errors
        }
        if (result && result.response && typeof result.response.text === 'function') {
          return result.response.text()
        }
        if (result && result.output?.[0]?.content?.text) {
          return result.output[0].content.text
        }
      }

      // If generateContent is not available on the resolved model, throw to trigger retry/fallback
      throw new Error('Resolved model does not support generateContent')
    } catch (err) {
      attempts++
      console.error(`Gemini attempt ${attempts} failed:`, err.message || err)
      const isRateLimit = err.status === 429 ||
        (err.message && (err.message.toLowerCase().includes('rate') || err.message.toLowerCase().includes('quota')))

      if (isRateLimit && attempts < maxAttempts) {
        const waitTime = Math.pow(2, attempts) * 3000
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempts}/${maxAttempts}`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      } else if (attempts >= maxAttempts) {
        console.error(`Gemini API failed after ${maxAttempts} attempts: ${err.message}`)
        // Return empty JSON so callers can fall back via `safeParseJSON` instead of
        // throwing and failing the whole pipeline.
        return '{}'
      } else {
        // If the error is a 404 model-not-found, avoid retrying with same model.
        if (err.message && err.message.toLowerCase().includes('not found')) {
          // continue to outer retry loop and allow discovery to pick another model next attempt
        }
        if (attempts >= maxAttempts) throw err
      }
    }
  }
}

function safeParseJSON(text, fallback) {
  try {
    return JSON.parse(text)
  } catch (e) {}

  try {
    const stripped = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()
    return JSON.parse(stripped)
  } catch (e) {}

  try {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.substring(start, end + 1))
    }
  } catch (e) {}

  console.error('JSON parse failed. Raw response:', text)
  return fallback
}

module.exports = { callGemini, safeParseJSON }

import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import Navbar from '../components/Navbar'
import RiskMeter from '../components/RiskMeter'
import RiskBadge from '../components/RiskBadge'
import ClauseCard from '../components/ClauseCard'

export default function Analysis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [clauses, setClauses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [processingStatus, setProcessingStatus] = useState('processing')
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const pollingRef = useRef(null)

  const loadChatHistory = async () => {
    try {
      const chatResponse = await axios.get(`/api/chat/${id}`)
      const savedMessages = chatResponse.data.flatMap(chat => [
        { role: 'user', content: chat.question },
        { role: 'assistant', content: chat.answer, sources: [] }
      ])
      setChatMessages(savedMessages)
    } catch (err) {
      console.log('No chat history yet')
    }
  }

  const loadDocumentAndChats = async () => {
    const full = await axios.get(`/api/documents/${id}`)
    setDocument(full.data)
    setClauses(full.data.clauses || [])
    setLoading(false)
    await loadChatHistory()
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return

    const question = chatInput.trim()
    const userMessage = { role: 'user', content: question }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    try {
      const history = chatMessages.slice(-6)

      const response = await axios.post(`/api/chat/${id}`, {
        question,
        history
      })

      const aiMessage = {
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources || []
      }

      setChatMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error('Chat error:', err)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I could not process your question. Please try again.',
        sources: []
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setChatLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const checkStatus = async () => {
      try {
        const res = await axios.get(`/api/documents/${id}/status`)
        if (!mounted) return
        setProcessingStatus(res.data.status)
        if (res.data.status === 'completed') {
          clearInterval(pollingRef.current)
          await loadDocumentAndChats()
        } else if (res.data.status === 'failed') {
          clearInterval(pollingRef.current)
          setError('Analysis failed')
          setLoading(false)
        }
      } catch (err) {
        console.error(err)
        setError('Failed to fetch status')
        setLoading(false)
      }
    }

    const init = async () => {
      try {
        const res = await axios.get(`/api/documents/${id}/status`)
        if (!mounted) return
        if (res.data.status === 'processing') {
          setProcessingStatus('processing')
          pollingRef.current = setInterval(checkStatus, 4000)
        } else if (res.data.status === 'completed') {
          await loadDocumentAndChats()
        } else if (res.data.status === 'failed') {
          setError('Analysis failed')
          setLoading(false)
        }
      } catch (err) {
        console.error(err)
        setError('Failed to fetch status')
        setLoading(false)
      }
    }

    init()

    return () => {
      mounted = false
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [id])

  // cycling text for processing
  const steps = ['Extracting clauses...', 'Detecting risk patterns...', 'Comparing to industry standards...', 'Generating negotiation suggestions...']
  const [stepIndex, setStepIndex] = useState(0)
  useEffect(() => {
    if (processingStatus !== 'processing') return
    const iv = setInterval(() => setStepIndex(i => (i + 1) % steps.length), 2000)
    return () => clearInterval(iv)
  }, [processingStatus])

  if (loading && processingStatus === 'processing') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <h2 className="text-2xl">🤖 Analyzing Your Contract...</h2>
          <p className="mt-3 text-slate-400">{steps[stepIndex]}</p>
          <p className="mt-2 text-sm text-slate-500">This usually takes 30-60 seconds</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-red-400">❌ Analysis Failed</h2>
          <p className="mt-3 text-slate-400">The AI pipeline encountered an error. Please try uploading again.</p>
          <div className="mt-6">
            <button onClick={() => navigate('/documents')} className="rounded-lg bg-indigo-600 px-4 py-2 text-white">← Back to Documents</button>
          </div>
        </div>
      </div>
    )
  }

  // Completed UI
  const high = clauses.filter(c => c.severity === 'HIGH')
  const med = clauses.filter(c => c.severity === 'MEDIUM')
  const low = clauses.filter(c => c.severity === 'LOW')

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold">{document?.original_name || document?.filename || 'Document'}</h1>
        <div className="mt-3">
          <span className="bg-indigo-600 text-white rounded px-2 py-1 text-xs">{document?.doc_type || 'Processing...'}</span>
        </div>

        <div className="mt-6 border-b border-slate-700">
          <div className="flex gap-8">
            {['overview','clauses','negotiate','ask'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`pb-3 ${activeTab===t ? 'border-b-2 border-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-6 flex flex-col items-center">
                <RiskMeter score={Number(document?.overall_risk_score) || 0} />
              </div>

              <div className="space-y-6">
                <div className="bg-slate-800 rounded-xl p-6">
                  <div className="text-sm text-slate-400">Parties Involved</div>
                  <div className="mt-3">
                    {(typeof document?.parties === 'string' ? (()=>{try{return JSON.parse(document.parties)}catch(e){return []}})() : document?.parties || []).map((p,idx)=> (
                      <span key={idx} className="mr-2 inline-block rounded px-2 py-1 bg-slate-700 text-sm">{p}</span>
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-slate-400">Effective Date</div>
                  <div className="mt-1">{document?.effective_date || 'Not specified'}</div>
                  <div className="mt-4 text-sm text-slate-400">Document Type</div>
                  <div className="mt-1">{document?.doc_type || 'other'}</div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg p-4 bg-slate-700">
                    <div className="text-3xl font-bold">{clauses.length}</div>
                    <div className="text-sm text-slate-400">Total Clauses</div>
                  </div>
                  <div className="rounded-lg p-4 bg-red-900/50">
                    <div className="text-3xl font-bold text-red-400">{high.length}</div>
                    <div className="text-sm text-slate-400">High Risk</div>
                  </div>
                  <div className="rounded-lg p-4 bg-amber-900/50">
                    <div className="text-3xl font-bold text-amber-400">{med.length}</div>
                    <div className="text-sm text-slate-400">Medium Risk</div>
                  </div>
                  <div className="rounded-lg p-4 bg-green-900/50">
                    <div className="text-3xl font-bold text-green-400">{low.length}</div>
                    <div className="text-sm text-slate-400">Low Risk</div>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6">
                  <div className="text-sm text-slate-400">Quick Insights</div>
                  <div className="mt-3 text-slate-200">Most Dangerous Clause: {clauses.sort((a,b)=> (b.risk_score||0)-(a.risk_score||0))[0]?.clause_type || '—'}</div>
                  <div className="mt-2 text-slate-200">Needs Negotiation: {clauses.filter(c=> (c.risk_score||0) > 6).length}</div>
                  <div className="mt-2 text-slate-200">Safe to Sign: {clauses.filter(c=> (c.risk_score||0) <= 3).length}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clauses' && (
            <div>
              <section className="mb-6">
                <h3 className="text-lg font-semibold">🔴 High Risk Clauses <span className="text-red-400">{high.length}</span></h3>
                {high.length === 0 ? <p className="text-slate-400">No high risk clauses found</p> : high.map(c => <ClauseCard key={c.id} clause={c} />)}
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-semibold">🟡 Medium Risk Clauses <span className="text-amber-400">{med.length}</span></h3>
                {med.map(c => <ClauseCard key={c.id} clause={c} />)}
              </section>

              <section>
                <h3 className="text-lg font-semibold">🟢 Standard Clauses <span className="text-green-400">{low.length}</span></h3>
                {low.map(c => <ClauseCard key={c.id} clause={c} />)}
              </section>
            </div>
          )}

          {activeTab === 'negotiate' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Negotiation Suggestions</h3>
              {clauses.filter(c => c.suggested_text).length === 0 ? (
                <p className="text-slate-400">No negotiation suggestions available. Your contract has no severely risky clauses.</p>
              ) : (
                clauses.filter(c => c.suggested_text).map(c => (
                  <div key={c.id} className="bg-slate-800 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">{c.clause_type}</div>
                      <RiskBadge severity={c.severity} />
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-red-400 font-semibold">⚠️ Original</div>
                        <div className="mt-2 bg-red-900/20 border border-red-800 rounded p-4 text-slate-300">{c.original_text}</div>
                      </div>
                      <div>
                        <div className="text-green-400 font-semibold">✅ AI Suggested Rewrite</div>
                        <div className="mt-2 bg-green-900/20 border border-green-800 rounded p-4 text-green-100">{c.suggested_text}</div>
                        <div className="mt-2 italic text-slate-400">{c.negotiation_reasoning}</div>
                        <button onClick={() => navigator.clipboard.writeText(c.suggested_text)} className="mt-3 bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1 rounded">Copy Suggestion</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'ask' && (
            <div className="flex flex-col h-[60vh]">
              <div className="mb-4">
                {['Can they terminate without notice?','Who owns the work I create?','What are my payment terms?'].map((chip) => (
                  <button key={chip} onClick={() => setChatInput(chip)} className="mr-2 mb-2 inline-block rounded-full bg-slate-700 px-4 py-2 text-sm text-slate-300">{chip}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-4 mb-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-slate-400">
                    <div>💬 Ask anything about your contract<br/><span className="text-sm text-slate-500">For example: Can they fire me without notice? or Who owns my code?</span></div>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    message.role === 'user' ? (
                      <div key={index} className="flex justify-end">
                        <div className="max-w-xs rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-3 text-sm text-white md:max-w-md">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div key={index} className="flex justify-start">
                        <div className="max-w-xs rounded-2xl rounded-tl-sm bg-slate-700 px-4 py-3 text-sm text-slate-100 md:max-w-md">
                          {message.content}
                          {message.sources && message.sources.length > 0 && (
                            <div style={{marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                              {message.sources.map((source, i) => (
                                <span key={i} style={{
                                  background: '#1e293b',
                                  border: '1px solid #334155',
                                  borderRadius: '4px',
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                  color: '#94a3b8'
                                }}>
                                  {source.clause_type} · {source.risk_score}/10
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  ))
                )}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-xs rounded-2xl rounded-tl-sm bg-slate-700 px-4 py-3 text-sm text-slate-100 md:max-w-md animate-pulse">
                      • • •
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center border-t border-slate-700 pt-4">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask a question about your contract..."
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white mr-3"
                />
                <button onClick={handleSendMessage} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg">Send</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

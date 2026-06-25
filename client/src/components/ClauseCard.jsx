import React, { useState } from 'react'
import RiskBadge from './RiskBadge'

function severityBorder(sev) {
  if (!sev) return 'border-l-4 border-slate-700'
  const s = sev.toUpperCase()
  if (s === 'HIGH') return 'border-l-4 border-red-500'
  if (s === 'MEDIUM') return 'border-l-4 border-amber-500'
  return 'border-l-4 border-green-500'
}

export default function ClauseCard({ clause }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className={`bg-slate-800/50 rounded-lg p-4 mb-3 hover:bg-slate-800 transition ${severityBorder(clause.severity)}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="capitalize font-semibold text-indigo-400">{clause.clause_type || 'other'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-400">Risk Score: <span className="font-bold text-slate-100">{clause.risk_score || 0}/10</span></div>
          <RiskBadge severity={clause.severity} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-slate-400">{clause.risk_type || ''}</div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm text-slate-300">{isExpanded ? '▲ Hide Details' : '▼ Show Details'}</button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="text-sm font-semibold text-slate-300">Original Clause</div>
            <div className="mt-2 bg-slate-800 font-mono text-sm p-3 rounded text-slate-200">{clause.original_text || '—'}</div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-300">Why This Is Risky</div>
            <p className="mt-2 text-slate-300 text-sm">{clause.risk_explanation || 'No explanation available.'}</p>
          </div>

          {clause.standard_comparison ? (
            <div>
              <div className="text-sm font-semibold text-slate-300">Industry Standard Comparison</div>
              <p className="mt-2 text-slate-300 text-sm">{clause.standard_comparison}</p>
            </div>
          ) : null}

          {clause.suggested_text ? (
            <div>
              <div className="bg-green-900/30 border border-green-700 rounded p-4 mt-3">
                <div className="text-green-400 font-semibold">💡 AI Negotiation Suggestion</div>
                <div className="mt-2 text-green-100">{clause.suggested_text}</div>
                <div className="mt-3 text-green-400 font-semibold">Why this change?</div>
                <div className="mt-1 text-green-200 text-sm">{clause.negotiation_reasoning}</div>
                <button
                  onClick={() => handleCopy(clause.suggested_text)}
                  className="mt-3 bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1 rounded"
                >
                  {copied ? 'Copied!' : 'Copy Suggestion'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

import React, { useEffect, useState } from 'react'

function getColor(score) {
  if (score >= 7) return '#ef4444'
  if (score >= 4) return '#f59e0b'
  return '#22c55e'
}

export default function RiskMeter({ score = 0 }) {
  const [display, setDisplay] = useState(0)
  const normalized = Math.max(0, Math.min(10, Number(score) || 0))
  const circumference = 2 * Math.PI * 50 // r=50 => 314
  const dash = (normalized / 10) * circumference
  const color = getColor(normalized)

  useEffect(() => {
    let raf
    const start = performance.now()
    const from = 0
    const to = normalized
    const duration = 900
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const val = from + (to - from) * t
      setDisplay(Number(val.toFixed(1)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [normalized])

  const dashArray = `${(display / 10) * circumference} ${circumference}`

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 120" width="160" height="160">
        <circle cx="60" cy="60" r="50" stroke="#1e293b" strokeWidth="10" fill="none" />
        <circle
          cx="60"
          cy="60"
          r="50"
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
          strokeDasharray={dashArray}
        />
        <text x="60" y="60" textAnchor="middle" dominantBaseline="central" fontSize="22" fill={color} fontWeight="700">
          {display}
        </text>
        <text x="60" y="80" textAnchor="middle" fontSize="12" fill={color}>
          Risk Score
        </text>
      </svg>

      <div className="mt-3 text-sm font-semibold" style={{ color }}>
        {normalized >= 7 ? 'HIGH RISK' : normalized >= 4 ? 'MEDIUM RISK' : 'LOW RISK'}
      </div>
    </div>
  )
}

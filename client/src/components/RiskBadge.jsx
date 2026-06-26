import React from 'react'

export default function RiskBadge({ severity = 'LOW' }) {
  const s = (severity || '').toUpperCase()
  if (s === 'HIGH') return <span className="rounded-full px-3 py-1 text-xs font-bold uppercase bg-[#ef4444] text-white">HIGH</span>
  if (s === 'MEDIUM') return <span className="rounded-full px-3 py-1 text-xs font-bold uppercase bg-[#f59e0b] text-[#0f172a]">MEDIUM</span>
  return <span className="rounded-full px-3 py-1 text-xs font-bold uppercase bg-[#22c55e] text-white">LOW</span>
}

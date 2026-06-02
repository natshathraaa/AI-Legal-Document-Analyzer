import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LexAIIcon from './LexAIIcon'

export default function Navbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <Link to="/documents" className="flex items-center gap-3 text-lg font-semibold">
            <LexAIIcon size={32} className="shrink-0" />
            <span>LexAI</span>
          </Link>
        </div>
        <div className="flex items-center">
          <button onClick={handleLogout} className="ml-4 text-slate-400 hover:text-white text-sm">Logout</button>
        </div>
      </div>
    </div>
  )
}

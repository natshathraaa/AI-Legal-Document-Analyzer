import React from 'react'
import { Link } from 'react-router-dom'
import LexAIIcon from '../components/LexAIIcon'

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.18),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(15,23,42,0.9),transparent_22%),linear-gradient(to_bottom,rgba(15,23,42,0.92),rgba(15,23,42,1))]" />

      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
        <div className="flex items-center gap-3 text-xl font-bold text-white">
          <LexAIIcon size={40} className="shrink-0" />
          <span>LexAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white">
            Login
          </Link>
          <Link to="/register" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500">
            Register
          </Link>
        </div>
      </nav>

      <main className="relative mx-auto max-w-6xl px-6 pb-16 pt-10 lg:px-8 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-1">
          <section className="text-center">
            <div className="inline-flex items-center rounded-full border border-indigo-700 bg-indigo-900/50 px-4 py-1 text-sm font-medium uppercase tracking-wider text-indigo-300">
              AI-Powered Legal Analysis
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Understand Any Contract
              <br />
              in Minutes
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base font-normal leading-relaxed text-slate-400 sm:text-lg">
              Upload any legal document and get instant risk analysis, plain English explanations, and negotiation suggestions — no lawyer needed.
            </p>
            <p className="mt-3 text-center text-sm font-normal text-slate-500">
              Powered by a 4-agent AI pipeline
            </p>

            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/register" className="rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white transition hover:bg-indigo-500">
                Analyze a Document →
              </Link>
              <Link to="/login" className="rounded-xl border border-slate-600 px-8 py-3 font-medium text-slate-300 transition hover:border-slate-500 hover:text-white">
                Login
              </Link>
              <a href="#features" className="rounded-xl border border-slate-600 px-8 py-3 font-medium text-slate-300 transition hover:text-white">
                See How It Works
              </a>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Already registered? Log in to upload and review your documents.
            </p>
          </section>

        </div>

        <section id="features" className="mt-14">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8 text-center">
              <div className="mb-4 text-4xl">🔍</div>
              <div className="mb-2 text-base font-semibold text-white">Risk Detection</div>
              <div className="text-sm font-normal leading-relaxed text-slate-400">Every clause scored 1-10 for risk. Instantly spot what could hurt you.</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8 text-center">
              <div className="mb-4 text-4xl">⚖️</div>
              <div className="mb-2 text-base font-semibold text-white">Fair Comparison</div>
              <div className="text-sm font-normal leading-relaxed text-slate-400">See how your contract stacks up against industry standard templates.</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8 text-center">
              <div className="mb-4 text-4xl">💬</div>
              <div className="mb-2 text-base font-semibold text-white">Ask Anything</div>
              <div className="text-sm font-normal leading-relaxed text-slate-400">Chat with your document. Get plain English answers about any clause.</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-slate-800 py-8 text-center text-xs text-slate-600">
        ⚖️ LexAI is not a law firm. Analysis is for informational purposes only.
      </footer>
    </div>
  )
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDocuments = async () => {
      try {
        const response = await api.get('/api/documents');
        if (isMounted) {
          setDocuments(response.data);
        }
      } catch (error) {
        if (isMounted) {
          setDocuments([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDocuments();

    return () => {
      isMounted = false;
    };
  }, []);

  const statusStyles = {
    processing: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    failed: 'bg-red-500/15 text-red-300 border-red-500/30',
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10 text-slate-100">
      <Navbar />
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Your documents</h1>
            <p className="mt-2 text-slate-400">Track uploads and analysis status.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="rounded-xl bg-indigo-500 px-5 py-3 font-medium text-white transition hover:bg-indigo-400"
          >
            Upload PDF
          </button>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-slate-950/40">
          {loading ? (
            <div className="p-6">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse mb-3 bg-slate-800 rounded-lg h-16" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg text-slate-200">No documents yet. Upload your first contract.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {documents.map((document) => (
                <button
                  key={document.id}
                  type="button"
                  onClick={() => navigate(`/analysis/${document.id}`)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-800/60"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">📄</div>
                    <div>
                      <p className="font-medium text-slate-100">{document.filename || document.original_name}</p>
                      <p className="mt-1 text-sm text-slate-400">{new Date(document.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded px-2 py-1 text-xs bg-slate-700">{document.doc_type || 'Processing...'}</div>
                    <div className={`${statusStyles[document.status] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'} rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]`}>{document.status}</div>
                    {document.status === 'completed' && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${document.overall_risk_score >= 7 ? 'bg-red-500' : document.overall_risk_score >=4 ? 'bg-amber-500' : 'bg-green-500'}`}>
                        {Math.round(document.overall_risk_score || 0)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Documents;

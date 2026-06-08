import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const validateFile = (selectedFile) => selectedFile && selectedFile.type === 'application/pdf';

  const handleFile = (selectedFile) => {
    setError('');
    setMessage('');

    if (!validateFile(selectedFile)) {
      setFile(null);
      setError('Only PDF files are allowed');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setError('');
      setMessage('');
      const res = await api.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const docId = res.data?.documentId
      if (docId) {
        setMessage('Document uploaded! Redirecting to analysis...')
        navigate(`/analysis/${docId}`)
        return
      }
      setMessage('Document uploaded! Analysis starting...')
      setTimeout(() => navigate('/documents'), 2000);
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <Navbar />
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
          <h1 className="text-3xl font-semibold tracking-tight">Upload a contract</h1>
          <p className="mt-2 text-slate-400">Drop a PDF to start Phase 1 analysis.</p>

          <div
            className={`mt-8 flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 text-center transition ${isDragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700 bg-slate-950/60 hover:border-indigo-500/60'}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => handleFile(event.target.files[0])}
            />
            <div className="max-w-lg">
              <p className="text-lg font-medium text-slate-200">Drag and drop your PDF here</p>
              <p className="mt-2 text-sm text-slate-400">or click to choose a file from your device.</p>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">PDF only, max 10MB</p>
            </div>
            {file ? <p className="mt-8 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">{file.name}</p> : null}
          </div>

          {error ? <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p> : null}
          {message ? <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</p> : null}

              <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              className="rounded-xl bg-indigo-500 px-6 py-3 font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
                  {loading ? 'Uploading...' : 'Upload document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;

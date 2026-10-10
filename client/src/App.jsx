import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Documents from './pages/Documents';
import Analysis from './pages/Analysis'
import Landing from './pages/Landing'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/analysis/:id" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

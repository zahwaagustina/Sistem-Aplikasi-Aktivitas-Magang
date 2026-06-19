import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster, toast } from 'react-hot-toast'

// Override window.alert globally to use beautiful toast notifications
window.alert = (message) => {
  if (typeof message === 'string') {
    const lowerMsg = message.toLowerCase();
    // Simple heuristic to determine if it's an error message
    if (lowerMsg.includes('gagal') || lowerMsg.includes('error') || lowerMsg.includes('mohon') || lowerMsg.includes('terjadi') || lowerMsg.includes('tidak valid')) {
      toast.error(message, { 
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#FEF2F2',
          color: '#991B1B',
          border: '1px solid #FEE2E2',
          fontWeight: '500'
        }
      });
    } else {
      toast.success(message, { 
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#F0FDF4',
          color: '#166534',
          border: '1px solid #DCFCE7',
          fontWeight: '500'
        }
      });
    }
  } else {
    toast(String(message));
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="top-right" />
    </AuthProvider>
  </React.StrictMode>,
)

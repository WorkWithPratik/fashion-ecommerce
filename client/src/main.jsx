import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import './index.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1029384756-dummyclientid.apps.googleusercontent.com'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
            <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a1a',
                color: '#c8a97e',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                borderRadius: '0',
              },
              success: {
                iconTheme: { primary: '#c8a97e', secondary: '#1a1a1a' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
                style: {
                  background: '#1a1a1a',
                  color: '#ef4444',
                },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
  </React.StrictMode>,
)

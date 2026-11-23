import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-accent" />
      </div>
    )
  }

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

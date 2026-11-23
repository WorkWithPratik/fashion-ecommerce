import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-accent" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register, googleLogin } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Name is required'
    if (!formData.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email'
    if (!formData.password) errs.password = 'Password is required'
    else if (formData.password.length < 6) errs.password = 'At least 6 characters'
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(formData.name, formData.email, formData.password)
      toast.success('Account created! Welcome to LUXE')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-[88px] min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/">
            <span className="text-primary font-black text-3xl tracking-[0.3em] uppercase">LUXE</span>
          </Link>
          <h1 className="text-2xl font-bold text-primary mt-4">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join LUXE and explore exclusive fashion</p>
        </div>

        <div className="bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => {
                    const val = e.target.value
                    setFormData(p => ({ ...p, name: val }))
                    setErrors(p => ({ ...p, name: '' }))
                  }}
                  placeholder="Your full name"
                  className={`w-full pl-9 pr-4 py-3 border text-sm focus:outline-none focus:border-accent transition-colors ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => {
                    const val = e.target.value
                    setFormData(p => ({ ...p, email: val }))
                    setErrors(p => ({ ...p, email: '' }))
                  }}
                  placeholder="your@email.com"
                  className={`w-full pl-9 pr-4 py-3 border text-sm focus:outline-none focus:border-accent transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => {
                    const val = e.target.value
                    setFormData(p => ({ ...p, password: val }))
                    setErrors(p => ({ ...p, password: '' }))
                  }}
                  placeholder="Min 6 characters"
                  className={`w-full pl-9 pr-11 py-3 border text-sm focus:outline-none focus:border-accent transition-colors ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={e => {
                    const val = e.target.value
                    setFormData(p => ({ ...p, confirmPassword: val }))
                    setErrors(p => ({ ...p, confirmPassword: '' }))
                  }}
                  placeholder="Repeat your password"
                  className={`w-full pl-9 pr-4 py-3 border text-sm focus:outline-none focus:border-accent transition-colors ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-accent py-4 font-bold text-sm uppercase tracking-widest hover:bg-primary-light transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  await googleLogin(credentialResponse.credential)
                  toast.success('Welcome to LUXE!')
                  navigate('/')
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Google registration failed')
                }
              }}
              onError={() => toast.error('Google Sign In failed')}
              theme="outline"
              size="large"
              text="signup_with"
              shape="rectangular"
              width="384"
            />
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
          </p>

          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <span className="text-[11px] text-gray-400 font-mono">Version: 1.0.1</span>
          </div>
        </div>
      </div>
    </div>
  )
}

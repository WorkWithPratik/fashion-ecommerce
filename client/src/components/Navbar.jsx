import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Search, Menu, X, ChevronDown, LogOut, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const { cartCount, setCartOpen } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    setUserDropdown(false)
    navigate('/')
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-primary shadow-xl' : 'bg-primary'}`}>
      {/* Top announcement bar */}
      <div className="bg-accent text-primary text-center text-xs py-2 font-medium tracking-widest uppercase">
        Free shipping on orders over ₹999 &nbsp;|&nbsp; New Collection 2024 is live
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-accent font-black text-2xl tracking-[0.3em] uppercase">LUXE</span>
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white/80 hover:text-accent text-sm font-medium tracking-widest uppercase transition-colors duration-300">
              Home
            </Link>
            <Link to="/products" className="text-white/80 hover:text-accent text-sm font-medium tracking-widest uppercase transition-colors duration-300">
              Shop
            </Link>
            <Link to="/products?category=clothing" className="text-white/80 hover:text-accent text-sm font-medium tracking-widest uppercase transition-colors duration-300">
              Clothing
            </Link>
            <Link to="/products?category=shoes" className="text-white/80 hover:text-accent text-sm font-medium tracking-widest uppercase transition-colors duration-300">
              Shoes
            </Link>
            <Link to="/products?category=accessories" className="text-white/80 hover:text-accent text-sm font-medium tracking-widest uppercase transition-colors duration-300">
              Accessories
            </Link>
          </nav>

          {/* Right icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-white/80 hover:text-accent transition-colors duration-300 p-1"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white shadow-xl z-50">
                  <form onSubmit={handleSearch} className="flex">
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="flex-1 px-4 py-3 text-sm text-primary focus:outline-none"
                    />
                    <button type="submit" className="px-4 bg-primary text-accent hover:bg-primary-light transition-colors">
                      <Search size={16} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative text-white/80 hover:text-accent transition-colors duration-300 p-1"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-primary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center space-x-1 text-white/80 hover:text-accent transition-colors duration-300"
                >
                  <div className="w-8 h-8 bg-accent text-primary rounded-full flex items-center justify-center font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${userDropdown ? 'rotate-180' : ''}`} />
                </button>
                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold text-primary truncate">{user?.name}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center px-4 py-3 text-sm text-primary hover:bg-gray-50 hover:text-accent transition-colors"
                      >
                        <Package size={16} className="mr-2" /> Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center px-4 py-3 text-sm text-primary hover:bg-gray-50 hover:text-accent transition-colors"
                    >
                      <Package size={16} className="mr-2" /> My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login" className="text-white/80 hover:text-accent text-sm font-medium tracking-wider uppercase transition-colors duration-300">
                  Login
                </Link>
                <Link to="/register" className="bg-accent text-primary text-sm font-semibold px-4 py-2 hover:bg-accent-dark transition-colors duration-300 tracking-wider uppercase">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white/80 hover:text-accent transition-colors p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary border-t border-white/10">
          <div className="px-4 py-4 space-y-1">
            {[['/', 'Home'], ['/products', 'Shop'], ['/products?category=clothing', 'Clothing'], ['/products?category=shoes', 'Shoes'], ['/products?category=accessories', 'Accessories']].map(([href, label]) => (
              <Link
                key={href}
                to={href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 text-white/80 hover:text-accent text-sm font-medium tracking-widest uppercase transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10 space-y-1">
              {isLoggedIn ? (
                <>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-white/80 hover:text-accent text-sm font-medium transition-colors">My Orders</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-white/80 hover:text-accent text-sm font-medium transition-colors">Admin Panel</Link>}
                  <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="block w-full text-left px-3 py-2.5 text-red-400 text-sm font-medium transition-colors">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-white/80 hover:text-accent text-sm font-medium transition-colors">Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-accent text-sm font-semibold transition-colors">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

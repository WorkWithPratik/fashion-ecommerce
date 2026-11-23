import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function CartSidebar() {
  const { cartItems, cartOpen, setCartOpen, cartTotal, updateQuantity, removeFromCart } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const sidebarRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') setCartOpen(false) }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (cartOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen])

  const handleCheckout = () => {
    setCartOpen(false)
    navigate('/checkout')
  }

  const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`
  const shippingFee = cartTotal >= 999 ? 0 : 99
  const totalWithShipping = cartTotal + shippingFee

  if (!cartOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300"
        onClick={() => setCartOpen(false)}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl transform transition-transform duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-primary uppercase tracking-widest">Your Cart</h2>
            {cartItems.length > 0 && (
              <span className="bg-accent text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {cartItems.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!isLoggedIn ? (
            <div className="flex flex-col items-center justify-center h-full gap-5">
              <ShoppingBag size={56} className="text-gray-200" />
              <p className="text-gray-500 text-sm">Please login to view your cart</p>
              <Link
                to="/login"
                onClick={() => setCartOpen(false)}
                className="bg-primary text-accent px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-primary-light transition-colors"
              >
                Login
              </Link>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5">
              <ShoppingBag size={56} className="text-gray-200" />
              <p className="text-gray-500 text-sm">Your cart is empty</p>
              <button
                onClick={() => setCartOpen(false)}
                className="bg-primary text-accent px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-primary-light transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {cartItems.map((item) => {
                const product = item.product || {}
                const image = product.images?.[0] || 'https://via.placeholder.com/80x100'
                return (
                  <div key={item.id || item._id} className="flex gap-4 pb-5 border-b border-gray-100 last:border-0">
                    {/* Product image */}
                    <Link to={`/products/${product.id || product._id}`} onClick={() => setCartOpen(false)}>
                      <img
                        src={image}
                        alt={product.name}
                        className="w-20 h-24 object-cover bg-gray-100 hover:opacity-80 transition-opacity"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${product.id || product._id}`}
                        onClick={() => setCartOpen(false)}
                        className="text-sm font-semibold text-primary hover:text-accent transition-colors line-clamp-2 leading-snug"
                      >
                        {product.name}
                      </Link>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                      <p className="text-accent font-bold text-sm mt-1.5">
                        {formatPrice(product.price)}
                      </p>

                      {/* Quantity + Remove */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.id || item._id, item.quantity - 1)}
                            className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-sm font-medium min-w-[32px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id || item._id, item.quantity + 1)}
                            className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id || item._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {isLoggedIn && cartItems.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-gray-400">Add {formatPrice(999 - cartTotal)} more for free shipping</p>
              )}
              <div className="flex justify-between font-bold text-primary text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(totalWithShipping)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-primary text-accent py-3.5 text-sm font-semibold uppercase tracking-widest hover:bg-primary-light transition-colors duration-300"
            >
              Checkout
            </button>
            <button
              onClick={() => setCartOpen(false)}
              className="w-full border border-gray-200 text-primary py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}

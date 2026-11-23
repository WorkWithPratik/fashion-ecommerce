import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'

export default function Cart() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart()
  const navigate = useNavigate()

  const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`
  const shippingFee = cartTotal >= 999 ? 0 : 99
  const totalWithShipping = cartTotal + shippingFee

  if (cartItems.length === 0) {
    return (
      <div className="pt-[88px] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={72} className="mx-auto text-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-primary">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mt-2">Looks like you haven't added anything yet.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 mt-8 bg-primary text-accent px-10 py-4 font-semibold uppercase tracking-widest text-sm hover:bg-primary-light transition-colors"
          >
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[88px] min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-primary mb-8 uppercase tracking-tight">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.product || {}
              const image = product.images?.[0] || 'https://via.placeholder.com/120x150'
              const subtotal = (product.price || 0) * item.quantity

              return (
                <div key={item.id || item._id} className="bg-white p-5 flex gap-5">
                  {/* Image */}
                  <Link to={`/products/${product.id || product._id}`}>
                    <img
                      src={image}
                      alt={product.name}
                      className="w-24 h-32 object-cover bg-gray-100 hover:opacity-80 transition-opacity flex-shrink-0"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link
                          to={`/products/${product.id || product._id}`}
                          className="font-semibold text-primary hover:text-accent transition-colors leading-snug line-clamp-2"
                        >
                          {product.name}
                        </Link>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500">
                          {item.size && <span>Size: <strong>{item.size}</strong></span>}
                          {item.color && <span>Color: <strong>{item.color}</strong></span>}
                        </div>
                        <p className="text-primary font-semibold mt-1">{formatPrice(product.price)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id || item._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Quantity + Subtotal */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id || item._id, item.quantity - 1)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-4 py-2 text-sm font-semibold min-w-[40px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id || item._id, item.quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="font-bold text-primary">{formatPrice(subtotal)}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mt-2"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 sticky top-24">
              <h2 className="font-bold text-primary uppercase tracking-widest text-sm mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-semibold' : ''}>{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                    Add {formatPrice(999 - cartTotal)} more to get free shipping!
                  </p>
                )}
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-primary">
                <span>Total</span>
                <span className="text-xl">{formatPrice(totalWithShipping)}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 bg-primary text-accent py-4 font-bold text-sm uppercase tracking-widest hover:bg-primary-light transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
              {/* Trust badges */}
              <div className="mt-6 space-y-2 text-xs text-gray-500">
                {['🔒 Secure SSL Checkout', '↩️ 7-Day Easy Returns', '🚚 Free Shipping Over ₹999'].map(t => (
                  <div key={t}>{t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

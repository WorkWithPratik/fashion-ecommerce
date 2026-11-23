import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MapPin, User, Mail, Phone, Building, CreditCard } from 'lucide-react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true)
  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  script.onload = () => resolve(true)
  script.onerror = () => resolve(false)
  document.body.appendChild(script)
})

export default function Checkout() {
  const { user } = useAuth()
  const { cartItems, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  const [errors, setErrors] = useState({})

  const shippingFee = cartTotal >= 999 ? 0 : 99
  const totalWithShipping = cartTotal + shippingFee

  const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Name is required'
    if (!formData.email.trim()) errs.email = 'Email is required'
    if (!formData.phone.trim() || formData.phone.length < 10) errs.phone = 'Valid phone is required'
    if (!formData.address.trim()) errs.address = 'Address is required'
    if (!formData.city.trim()) errs.city = 'City is required'
    if (!formData.state.trim()) errs.state = 'State is required'
    if (!formData.pincode.trim() || formData.pincode.length < 6) errs.pincode = 'Valid pincode is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handlePayment = async () => {
    if (!validate()) return
    if (cartItems.length === 0) { toast.error('Your cart is empty'); return }

    setLoading(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { toast.error('Payment gateway failed to load. Please try again.'); setLoading(false); return }

      const { data } = await api.post('/orders/create-razorpay-order', { amount: totalWithShipping })

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency || 'INR',
        order_id: data.orderId,
        name: 'LUXE Fashion',
        description: 'Fashion Order',
        image: '/vite.svg',
        handler: async (response) => {
          try {
            await api.post('/orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              address: formData,
            })
            clearCart()
            toast.success('Order placed successfully! 🎉')
            navigate('/orders')
          } catch {
            toast.error('Payment verification failed. Contact support.')
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#1a1a1a' },
        modal: {
          ondismiss: () => {
            setLoading(false)
            toast('Payment cancelled')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.')
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  const Field = ({ name, label, icon: Icon, type = 'text', placeholder, className = '' }) => (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-9' : 'px-4'} pr-4 py-3 border text-sm focus:outline-none focus:border-accent transition-colors
            ${errors[name] ? 'border-red-400' : 'border-gray-200'}`}
        />
      </div>
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  if (cartItems.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="pt-[88px] min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-primary mb-8 uppercase tracking-tight">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-3 bg-white p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary pb-4 border-b border-gray-100 flex items-center gap-2">
              <MapPin size={16} className="text-accent" /> Shipping Address
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field name="name" label="Full Name" icon={User} placeholder="Your full name" className="sm:col-span-2" />
              <Field name="email" label="Email" icon={Mail} type="email" placeholder="your@email.com" />
              <Field name="phone" label="Phone" icon={Phone} type="tel" placeholder="10-digit number" />
              <Field name="address" label="Address" icon={Building} placeholder="Street address, apt, etc." className="sm:col-span-2" />
              <Field name="city" label="City" placeholder="City" />
              <Field name="state" label="State" placeholder="State" />
              <Field name="pincode" label="Pincode" placeholder="6-digit pincode" />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-5 pb-4 border-b border-gray-100">
                Order Summary
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const product = item.product || {}
                  const image = product.images?.[0] || 'https://via.placeholder.com/60x75'
                  return (
                    <div key={item.id || item._id} className="flex gap-3">
                      <img src={image} alt={product.name} className="w-14 h-18 object-cover bg-gray-100 flex-shrink-0" style={{ height: '72px' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`} · Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-primary mt-1">{formatPrice((product.price || 0) * item.quantity)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-100 mt-5 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-semibold' : ''}>{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-primary text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatPrice(totalWithShipping)}</span>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-primary text-accent py-4 font-bold uppercase tracking-widest text-sm hover:bg-primary-light transition-colors disabled:opacity-60 flex items-center justify-center gap-3"
            >
              <CreditCard size={18} />
              {loading ? 'Processing...' : `Pay ${formatPrice(totalWithShipping)}`}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span>🔒</span> <span>Secured by Razorpay. 100% safe payment.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

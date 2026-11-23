import { useState, useEffect } from 'react'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../api/axios.js'

const STATUS_STYLES = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  PAID:      'bg-blue-100 text-blue-800',
  SHIPPED:   'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders')
        const orderList = Array.isArray(data) ? data : (data.orders || [])
        setOrders(orderList)
      } catch { setOrders([]) }
      finally { setLoading(false) }
    }
    fetchOrders()
  }, [])

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })

  if (loading) {
    return (
      <div className="pt-[88px] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-6 animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="h-5 bg-gray-200 rounded w-1/4" />
                <div className="h-5 bg-gray-200 rounded w-20" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[88px] min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-primary mb-8 uppercase tracking-tight">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white text-center py-20">
            <Package size={64} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-primary">No orders yet</h2>
            <p className="text-gray-500 text-sm mt-2">Your order history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id || order._id} className="bg-white overflow-hidden">
                {/* Order Header */}
                <div className="p-5 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2.5 py-1 font-semibold">
                        #{order.orderId || (order.id || order._id).slice(-8).toUpperCase()}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 uppercase tracking-wider rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span>{formatDate(order.createdAt)}</span>
                      <span>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
                      <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(order.id || order._id)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {expanded[order.id || order._id] ? (
                      <><ChevronUp size={16} /> Hide Details</>
                    ) : (
                      <><ChevronDown size={16} /> View Details</>
                    )}
                  </button>
                </div>

                {/* Order Items (expandable) */}
                {expanded[order.id || order._id] && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                    {/* Items */}
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Items</h3>
                    <div className="space-y-3">
                      {(order.items || []).map((item) => (
                        <div key={item.id || item._id} className="flex items-center gap-4">
                          {item.product?.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-12 h-14 object-cover bg-gray-200 flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-primary line-clamp-1">
                              {item.product?.name || `Product (${item.productId?.slice(-6)})`}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.size && `Size: ${item.size}`}{item.color && ` · Color: ${item.color}`} · Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-semibold text-sm text-primary flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    {order.address && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Shipping To</h3>
                        <p className="text-sm text-gray-700">
                          {order.address.name} · {order.address.phone}<br />
                          {order.address.address}, {order.address.city}, {order.address.state} – {order.address.pincode}
                        </p>
                      </div>
                    )}

                    {/* Payment ID */}
                    {order.paymentId && (
                      <p className="text-xs text-gray-400 mt-3">Payment ID: {order.paymentId}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

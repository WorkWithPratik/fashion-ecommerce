import { useState, useEffect } from 'react'
import { Eye, X, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios.js'

const STATUS_OPTIONS = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_STYLES = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  PAID:      'bg-blue-100 text-blue-800',
  SHIPPED:   'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => { fetchOrders() }, [filterStatus])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.set('status', filterStatus)
      const { data } = await api.get(`/admin/orders?${params}`)
      setOrders(data.orders || [])
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status })
      toast.success('Status updated')
      fetchOrders()
      if (selectedOrder?.id === orderId || selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status }))
      }
    } catch { toast.error('Failed to update status') }
  }

  const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Orders</h2>
          <p className="text-gray-500 text-sm mt-1">{orders.length} orders</p>
        </div>
        {/* Filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-accent bg-white pr-8 appearance-none"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-accent rounded-full mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr
                    key={order.id || order._id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-5 py-4 font-mono text-xs">#{order.orderId || (order.id || order._id).slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4 font-medium text-primary">{order.user?.name || '—'}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-4 text-gray-600">{order.items?.length || 0}</td>
                    <td className="px-5 py-4 font-bold text-primary">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id || order._id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent ${STATUS_STYLES[order.status]}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order) }}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-primary uppercase tracking-widest text-sm">
                  Order #{selectedOrder.orderId || (selectedOrder.id || selectedOrder._id).slice(-8).toUpperCase()}
                </h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 inline-block ${STATUS_STYLES[selectedOrder.status]}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Customer</h4>
                <p className="text-sm font-semibold text-primary">{selectedOrder.user?.name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.user?.email}</p>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Items</h4>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item) => (
                    <div key={item.id || item._id} className="flex items-center gap-4">
                      {item.product?.images?.[0] && (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-14 object-cover bg-gray-100 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">{item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`} · Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.address && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-700">
                    {selectedOrder.address.name}, {selectedOrder.address.phone}<br />
                    {selectedOrder.address.address}<br />
                    {selectedOrder.address.city}, {selectedOrder.address.state} – {selectedOrder.address.pincode}
                  </p>
                </div>
              )}

              {/* Summary */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between font-bold text-primary">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
                {selectedOrder.paymentId && (
                  <p className="text-xs text-gray-400 mt-1">Payment ID: {selectedOrder.paymentId}</p>
                )}
              </div>

              {/* Status update */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedOrder.id || selectedOrder._id, s)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all border
                        ${selectedOrder.status === s ? STATUS_STYLES[s] + ' border-transparent' : 'border-gray-200 text-gray-600 hover:border-primary'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

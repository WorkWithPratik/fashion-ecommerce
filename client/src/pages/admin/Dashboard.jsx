import { useState, useEffect } from 'react'
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api/axios.js'

const STATUS_STYLES = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  PAID:      'bg-blue-100 text-blue-800',
  SHIPPED:   'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function Dashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, users: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/admin/dashboard')
        setStats(data.stats || {})
        setRecentOrders(data.recentOrders || [])
      } catch { /* silent */ }
      finally { setLoading(false) }
    }
    fetchDashboard()
  }, [])

  const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })

  const STAT_CARDS = [
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: 'bg-green-500', trend: '+8%' },
    { label: 'Products', value: stats.products, icon: Package, color: 'bg-purple-500', trend: '+3' },
    { label: 'Customers', value: stats.users, icon: Users, color: 'bg-amber-500', trend: '+24' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="bg-white p-6 animate-pulse h-32" />)}
        </div>
        <div className="bg-white p-6 animate-pulse h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-primary mt-1">{value}</p>
              </div>
              <div className={`${color} p-3 rounded-sm`}>
                <Icon size={20} className="text-white" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-green-600 font-semibold">
              <TrendingUp size={12} /> {trend} this month
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-primary uppercase tracking-widest text-sm">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs text-accent hover:underline font-semibold">View All</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingCart size={40} className="mx-auto mb-3" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id || order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-700">
                      #{order.orderId || (order.id || order._id).slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-medium text-primary">{order.user?.name || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 text-gray-500">{order.items?.length || 0}</td>
                    <td className="px-6 py-4 font-bold text-primary">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

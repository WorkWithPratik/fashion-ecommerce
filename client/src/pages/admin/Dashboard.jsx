import { useState, useEffect } from 'react'
import { ShoppingCart, DollarSign, Package, Users } from 'lucide-react'
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
        setStats({
          orders: data.totalOrders ?? data.orders ?? 0,
          revenue: data.revenue ?? 0,
          products: data.totalProducts ?? data.products ?? 0,
          users: data.totalUsers ?? data.users ?? 0,
        })
        setRecentOrders(data.recentOrders || [])
      } catch {
        // Fallback default 0s
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })

  const STAT_CARDS = [
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-blue-600', subtitle: 'Lifetime orders' },
    { label: 'Total Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: 'bg-emerald-600', subtitle: 'From completed orders' },
    { label: 'Active Products', value: stats.products, icon: Package, color: 'bg-purple-600', subtitle: 'Products in catalog' },
    { label: 'Total Customers', value: stats.users, icon: Users, color: 'bg-amber-600', subtitle: 'Registered users' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="bg-white p-6 animate-pulse h-28" />)}
        </div>
        <div className="bg-white p-6 animate-pulse h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Live real-time store performance from your database.</p>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, subtitle }) => (
          <div key={label} className="bg-white p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-primary mt-1">{value}</p>
              </div>
              <div className={`${color} p-3 rounded-sm`}>
                <Icon size={20} className="text-white" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-gray-400 font-medium">{subtitle}</p>
          </div>
        ))}
      </div>

      {/* Real Recent Orders */}
      <div className="bg-white shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-primary uppercase tracking-widest text-sm">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs text-accent hover:underline font-semibold">View All</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingCart size={36} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No orders placed yet</p>
            <p className="text-xs text-gray-400 mt-1">Orders placed by customers will appear here in real time.</p>
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
                    <td className="px-6 py-4 font-mono text-xs text-gray-700 font-semibold">
                      #{order.orderId || (order.id || order._id).slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-medium text-primary">{order.user?.name || order.user?.email || 'Customer'}</td>
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

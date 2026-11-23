import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios.js'
import ImageDropzone from '../../components/ImageDropzone.jsx'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const EMPTY_FORM = {
  name: '', description: '', price: '', stock: '', categoryId: '',
  sizes: [], colors: '', images: [],
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFiles, setImageFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/products/categories'),
      ])
      setProducts(prodRes.data.products || [])
      setCategories(catRes.data.categories || [])
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const openAdd = () => {
    setEditProduct(null)
    setForm(EMPTY_FORM)
    setImageFiles([])
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditProduct(product)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId || product.category?.id || product.category?._id || '',
      sizes: product.sizes || [],
      colors: (product.colors || []).join(', '),
      images: product.images || [],
    })
    setImageFiles([])
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditProduct(null); setForm(EMPTY_FORM); setImageFiles([]) }

  const handleSizeToggle = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.stock || !form.categoryId) {
      toast.error('Please fill all required fields'); return
    }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('description', form.description)
      fd.append('price', form.price)
      fd.append('stock', form.stock)
      fd.append('categoryId', form.categoryId)
      fd.append('sizes', JSON.stringify(form.sizes))
      fd.append('colors', JSON.stringify(form.colors.split(',').map(c => c.trim()).filter(Boolean)))
      imageFiles.forEach(file => fd.append('images', file))

      if (editProduct) {
        await api.put(`/admin/products/${editProduct.id || editProduct._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Product updated')
      } else {
        await api.post('/admin/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Product created')
      }
      closeModal()
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Product deleted')
      setDeleteConfirm(null)
      fetchAll()
    } catch { toast.error('Failed to delete product') }
  }

  const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Products</h2>
          <p className="text-gray-500 text-sm mt-1">{products.length} products total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-widest hover:bg-primary-light transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-accent rounded-full mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 text-sm">No products yet. Add your first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['', 'Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id || product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/50x60'}
                        alt={product.name}
                        className="w-10 h-12 object-cover bg-gray-100"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-primary line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {product.category?.name || '—'}
                    </td>
                    <td className="px-5 py-3 font-bold text-primary">{formatPrice(product.price)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold ${product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-amber-500' : 'text-green-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(product)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteConfirm(product.id || product._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-primary uppercase tracking-widest text-sm">
                {editProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Images */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">
                  Product Images (up to 5)
                </label>
                <ImageDropzone
                  onChange={setImageFiles}
                  maxFiles={5}
                  existingImages={form.images}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Classic White Shirt"
                  className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Product description..."
                  className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none"
                />
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="999"
                    min="0"
                    className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Stock *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                    placeholder="100"
                    min="0"
                    className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Category *</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                  className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-accent bg-white"
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-1.5 text-xs font-semibold border transition-all
                        ${form.sizes.includes(size) ? 'bg-primary text-accent border-primary' : 'border-gray-200 text-gray-600 hover:border-primary'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Colors (comma-separated)</label>
                <input
                  type="text"
                  value={form.colors}
                  onChange={e => setForm(p => ({ ...p, colors: e.target.value }))}
                  placeholder="e.g. Black, White, Red"
                  className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-accent py-3 text-sm font-bold uppercase tracking-widest hover:bg-primary-light transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-sm w-full">
            <h3 className="font-bold text-primary text-lg">Delete Product?</h3>
            <p className="text-gray-500 text-sm mt-2">This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white py-2.5 text-sm font-semibold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

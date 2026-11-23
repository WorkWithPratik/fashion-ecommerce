import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios.js'
import ImageDropzone from '../../components/ImageDropzone.jsx'

const EMPTY_FORM = { name: '', slug: '', image: null }

const toSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFiles, setImageFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/categories')
      setCategories(data.categories || [])
    } catch { toast.error('Failed to load categories') }
    finally { setLoading(false) }
  }

  const openAdd = () => {
    setEditCat(null)
    setForm(EMPTY_FORM)
    setImageFiles([])
    setModalOpen(true)
  }

  const openEdit = (cat) => {
    setEditCat(cat)
    setForm({ name: cat.name, slug: cat.slug, image: cat.image || null })
    setImageFiles([])
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditCat(null); setForm(EMPTY_FORM); setImageFiles([]) }

  const handleNameChange = (name) => {
    setForm(prev => ({ ...prev, name, slug: editCat ? prev.slug : toSlug(name) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.slug.trim()) { toast.error('Slug is required'); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('slug', form.slug)
      if (imageFiles.length > 0) fd.append('image', imageFiles[0])

      if (editCat) {
        await api.put(`/admin/categories/${editCat.id || editCat._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Category updated')
      } else {
        await api.post('/admin/categories', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Category created')
      }
      closeModal()
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`)
      toast.success('Category deleted')
      setDeleteConfirm(null)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete category')
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Categories</h2>
          <p className="text-gray-500 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-widest hover:bg-primary-light transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-accent rounded-full mx-auto" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <Tag size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 text-sm">No categories yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['', 'Name', 'Slug', 'Products', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((cat) => (
                  <tr key={cat.id || cat._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover bg-gray-100 rounded-sm" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded-sm">
                          <Tag size={16} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-semibold text-primary">{cat.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{cat.slug}</td>
                    <td className="px-5 py-3 text-gray-600">{cat._count?.products ?? cat.productCount ?? '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(cat)}
                          disabled={!!(cat._count?.products || cat.productCount)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={(cat._count?.products || cat.productCount) ? 'Cannot delete — has products' : 'Delete'}
                        >
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-primary uppercase tracking-widest text-sm">
                {editCat ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Category Image</label>
                <ImageDropzone
                  onChange={(files) => setImageFiles(files)}
                  maxFiles={1}
                  existingImages={form.image ? [form.image] : []}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Clothing"
                  className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 mb-1.5">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  placeholder="e.g. clothing"
                  className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-accent font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">Used in URL: /products?category={form.slug || 'your-slug'}</p>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="flex-1 border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-primary text-accent py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-primary-light disabled:opacity-60">
                  {submitting ? 'Saving...' : editCat ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-sm w-full">
            <h3 className="font-bold text-primary text-lg">Delete "{deleteConfirm.name}"?</h3>
            <p className="text-gray-500 text-sm mt-2">This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id || deleteConfirm._id)} className="flex-1 bg-red-500 text-white py-2.5 text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../api/axios.js'
import ProductCard from '../components/ProductCard.jsx'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const limit = 12

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategories, setSelectedCategories] = useState(searchParams.get('category') ? [searchParams.get('category')] : [])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    setPage(1)
    fetchProducts(1)
  }, [selectedCategories, selectedSizes, priceMin, priceMax, sort, search])

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/products/categories')
      setCategories(data.categories || [])
    } catch { setCategories([]) }
  }

  const fetchProducts = useCallback(async (p = page) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', p)
      params.set('limit', limit)
      params.set('sort', sort)
      if (search) params.set('search', search)
      if (selectedCategories.length) params.set('category', selectedCategories.join(','))
      if (selectedSizes.length) params.set('sizes', selectedSizes.join(','))
      if (priceMin) params.set('minPrice', priceMin)
      if (priceMax) params.set('maxPrice', priceMax)

      const { data } = await api.get(`/products?${params}`)
      setProducts(data.products || [])
      setTotal(data.total || 0)
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [page, sort, search, selectedCategories, selectedSizes, priceMin, priceMax])

  const handlePageChange = (p) => {
    setPage(p)
    fetchProducts(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleCategory = (slug) => {
    setSelectedCategories(prev =>
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    )
  }

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedSizes([])
    setPriceMin('')
    setPriceMax('')
    setSearch('')
    setSort('newest')
  }

  const hasFilters = selectedCategories.length || selectedSizes.length || priceMin || priceMax

  const totalPages = Math.ceil(total / limit)

  const Sidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat.id || cat._id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                className="accent-accent w-4 h-4"
              />
              <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Price Range (₹)</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 text-xs font-semibold border transition-all duration-200
                ${selectedSizes.includes(size)
                  ? 'bg-primary text-accent border-primary'
                  : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full border border-gray-200 text-gray-600 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <X size={14} /> Clear Filters
        </button>
      )}
    </div>
  )

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-primary tracking-tight">All Products</h1>
          <p className="text-gray-500 text-sm mt-1">{total} products found</p>
        </div>

        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-56 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="border border-gray-200 px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent appearance-none pr-8 bg-white"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            <SlidersHorizontal size={16} /> Filters
            {hasFilters && <span className="bg-accent text-primary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{selectedCategories.length + selectedSizes.length}</span>}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <Sidebar />
          </aside>

          {/* Mobile Sidebar Drawer */}
          {sidebarOpen && (
            <>
              <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
              <div className="fixed top-0 left-0 h-full w-72 bg-white z-50 p-6 overflow-y-auto lg:hidden">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-primary uppercase tracking-widest text-sm">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
                </div>
                <Sidebar />
              </div>
            </>
          )}

          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array(limit).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-[3/4]" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-xl font-bold text-primary">No products found</h3>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="mt-6 bg-primary text-accent px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-primary-light transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(product => (
                    <ProductCard key={product.id || product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-200 text-sm disabled:opacity-40 hover:border-primary transition-colors"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .map((p, idx, arr) => (
                        <span key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2 text-gray-400">…</span>}
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`w-9 h-9 text-sm font-medium transition-colors ${p === page ? 'bg-primary text-accent' : 'border border-gray-200 hover:border-primary'}`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-200 text-sm disabled:opacity-40 hover:border-primary transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

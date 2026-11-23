import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight } from 'lucide-react'
import api from '../api/axios.js'
import ProductCard from '../components/ProductCard.jsx'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=8&sort=newest').catch(() => ({ data: {} })),
          api.get('/products/categories').catch(() => ({ data: {} })),
        ])
        setFeaturedProducts(prodRes.data.products || [])
        const rawCats = catRes.data.categories || catRes.data || []
        setCategories(Array.isArray(rawCats) ? rawCats : [])
      } catch {
        setFeaturedProducts([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchHomeData()
  }, [])

  return (
    <div className="pt-[88px]">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] bg-primary flex items-center overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c8a97e 0, #c8a97e 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-accent text-xs font-semibold tracking-[0.4em] uppercase mb-6 border border-accent/30 px-4 py-2">
              New Collection 2024
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
              Redefine<br />
              <span className="text-accent">Your Style</span>
            </h1>
            <p className="text-white/60 text-lg mt-6 max-w-md leading-relaxed">
              Discover fashion-forward clothing, shoes, and accessories crafted for the modern individual.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-accent text-primary px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-accent-dark transition-colors duration-300"
              >
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link
                to="/products?category=new"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 font-semibold uppercase tracking-widest text-sm hover:border-accent hover:text-accent transition-colors duration-300"
              >
                New Arrivals
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-10 mt-14 pt-10 border-t border-white/10">
              {[['10K+', 'Products'], ['50K+', 'Customers'], ['4.9★', 'Rating']].map(([num, label]) => (
                <div key={label}>
                  <div className="text-accent font-black text-2xl">{num}</div>
                  <div className="text-white/50 text-xs uppercase tracking-wider mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden lg:block relative">
            <div className="relative w-full aspect-square max-w-lg ml-auto">
              <div className="absolute inset-0 bg-accent/10 rounded-full blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4 h-full">
                <div className="space-y-4 pt-8">
                  <div className="bg-white/10 rounded-sm h-56 flex items-center justify-center text-6xl">👗</div>
                  <div className="bg-white/10 rounded-sm h-40 flex items-center justify-center text-5xl">💍</div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-sm h-40 flex items-center justify-center text-5xl">👟</div>
                  <div className="bg-accent/20 rounded-sm h-56 flex items-center justify-center text-6xl">👜</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-accent text-xs font-semibold tracking-[0.3em] uppercase">Browse</span>
            <h2 className="section-title mt-1">Shop by Category</h2>
          </div>
          <Link to="/products" className="text-sm font-medium text-primary hover:text-accent transition-colors flex items-center gap-1">
            All Categories <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id || cat.slug}
              to={`/products?category=${cat.slug}`}
              className="group relative bg-primary overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/60" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="relative z-10 text-center w-full">
                <h3 className="text-white font-bold text-lg uppercase tracking-wider">{cat.name}</h3>
                <div className="mt-2 flex items-center justify-center gap-1 text-accent text-xs font-semibold uppercase tracking-widest opacity-90 group-hover:translate-x-1 transition-all">
                  Shop Now <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-accent text-xs font-semibold tracking-[0.3em] uppercase">Handpicked</span>
              <h2 className="section-title mt-1">Featured Products</h2>
            </div>
            <Link to="/products" className="text-sm font-medium text-primary hover:text-accent transition-colors flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary text-accent px-10 py-4 font-semibold uppercase tracking-widest text-sm hover:bg-primary-light transition-colors duration-300"
            >
              Explore All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <span className="text-accent text-xs font-semibold tracking-[0.3em] uppercase">Stay Updated</span>
          <h2 className="text-4xl font-black text-white mt-2">Get Exclusive Offers</h2>
          <p className="text-white/50 mt-4 text-sm leading-relaxed">
            Subscribe to our newsletter and be the first to know about new arrivals, exclusive deals, and fashion tips.
          </p>
          <form className="flex mt-8 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-4 bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="bg-accent text-primary px-7 py-4 font-bold text-sm uppercase tracking-widest hover:bg-accent-dark transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-white/30 text-xs mt-4">No spam, unsubscribe at any time.</p>
        </div>
      </section>
    </div>
  )
}

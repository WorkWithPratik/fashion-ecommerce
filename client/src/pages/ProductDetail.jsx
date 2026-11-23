import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, ChevronLeft, ChevronRight, Minus, Plus, Check, Play } from 'lucide-react'
import api from '../api/axios.js'
import { useCart } from '../context/CartContext.jsx'

const isVideoUrl = (url = '') => {
  return /\.(mp4|webm|mov)(\?.*)?$/i.test(url) || url.includes('/video/upload/')
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mainImage, setMainImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [wishlist, setWishlist] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/products/${id}`)
        setProduct(data.product || data)
        if (data.product?.sizes?.length || data.sizes?.length) {
          const sizes = data.product?.sizes || data.sizes
          setSelectedSize(sizes[0])
        }
        if (data.product?.colors?.length || data.colors?.length) {
          const colors = data.product?.colors || data.colors
          setSelectedColor(colors[0])
        }
      } catch {
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!selectedSize && product?.sizes?.length > 0) {
      return
    }
    setAdding(true)
    await addToCart(product.id || product._id, quantity, selectedSize, selectedColor)
    setAdding(false)
  }

  const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`

  if (loading) {
    return (
      <div className="pt-[88px] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
            <div className="space-y-3">
              <div className="bg-gray-200 aspect-[4/5]" />
              <div className="flex gap-2">
                {Array(4).fill(0).map((_, i) => <div key={i} className="bg-gray-200 w-20 h-24" />)}
              </div>
            </div>
            <div className="space-y-4 py-6">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const images = product.images?.length ? product.images : ['https://via.placeholder.com/600x750?text=No+Image']
  const isOutOfStock = product.stock === 0

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-8"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image / Video Gallery with Touch Swipe */}
          <div className="space-y-3">
            <div
              className="relative overflow-hidden bg-gray-100 aspect-[4/5] select-none group"
              onTouchStart={(e) => {
                setTouchEnd(null)
                setTouchStart(e.targetTouches[0].clientX)
              }}
              onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
              onTouchEnd={() => {
                if (!touchStart || !touchEnd) return
                const dist = touchStart - touchEnd
                if (dist > 50) setMainImage(p => (p + 1) % images.length)
                else if (dist < -50) setMainImage(p => (p - 1 + images.length) % images.length)
              }}
            >
              {isVideoUrl(images[mainImage]) ? (
                <video
                  src={images[mainImage]}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={images[mainImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              )}

              {/* Prev / Next Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setMainImage(p => (p - 1 + images.length) % images.length)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMainImage(p => (p + 1) % images.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Mobile Dots Indicator */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMainImage(i)}
                      className={`h-2 rounded-full transition-all ${mainImage === i ? 'w-5 bg-accent' : 'w-2 bg-white/60'}`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                  <span className="bg-white text-primary font-bold text-lg uppercase tracking-widest px-6 py-3">Sold Out</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => {
                  const isVid = isVideoUrl(img)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMainImage(i)}
                      className={`relative flex-shrink-0 w-20 h-24 overflow-hidden border-2 transition-all duration-200 bg-gray-100
                        ${mainImage === i ? 'border-accent shadow-md' : 'border-transparent hover:border-gray-300'}`}
                    >
                      {isVid ? (
                        <div className="w-full h-full relative bg-black flex items-center justify-center">
                          <video src={img} className="w-full h-full object-cover opacity-70" muted playsInline />
                          <Play size={16} className="absolute text-white" fill="white" />
                        </div>
                      ) : (
                        <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="py-2 space-y-6">
            {/* Category */}
            {product.category && (
              <span className="text-accent text-xs font-semibold uppercase tracking-widest">
                {typeof product.category === 'object' ? product.category.name : product.category}
              </span>
            )}

            {/* Name */}
            <h1 className="text-3xl font-black text-primary leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-accent text-primary text-sm font-bold px-2 py-0.5">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : product.stock < 10 ? 'bg-amber-500' : 'bg-green-500'}`} />
              <span className="text-sm text-gray-600">
                {isOutOfStock ? 'Out of stock' : product.stock < 10 ? `Only ${product.stock} left` : 'In stock'}
              </span>
            </div>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Size</h3>
                  <button className="text-xs text-accent underline underline-offset-2">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm font-semibold border-2 transition-all duration-200
                        ${selectedSize === size
                          ? 'bg-primary text-accent border-primary'
                          : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-red-500 text-xs mt-2">Please select a size</p>
                )}
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
                  Color: <span className="font-normal text-gray-600">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200
                        ${selectedColor === color ? 'border-primary scale-110' : 'border-transparent hover:border-gray-300'}`}
                      style={{ backgroundColor: color.toLowerCase() }}
                    >
                      {selectedColor === color && (
                        <Check size={12} className="absolute inset-0 m-auto text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Quantity</h3>
              <div className="inline-flex items-center border border-gray-200">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="px-5 py-3 font-semibold text-sm min-w-[48px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding || (!selectedSize && product.sizes?.length > 0)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 font-bold text-sm uppercase tracking-widest transition-all duration-300
                  ${isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-accent hover:bg-primary-light hover:shadow-lg'
                  }`}
              >
                <ShoppingBag size={18} />
                {adding ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={() => setWishlist(w => !w)}
                className={`px-5 border-2 transition-all duration-300
                  ${wishlist ? 'border-red-400 text-red-400 bg-red-50' : 'border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-400'}`}
              >
                <Heart size={20} fill={wishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Delivery info */}
            <div className="border border-gray-100 p-4 space-y-2">
              {[
                ['🚚', 'Free delivery on orders over ₹999'],
                ['↩️', 'Easy 7-day returns & exchanges'],
                ['🔒', '100% secure payment'],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{icon}</span> <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

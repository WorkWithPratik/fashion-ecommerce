import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Star } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [hovered, setHovered] = useState(false)
  const [adding, setAdding] = useState(false)

  if (!product) return null

  const { _id, id, name, price, images = [], category, originalPrice, stock } = product
  const productId = _id || id
  const image = images[0] || 'https://via.placeholder.com/400x500?text=No+Image'
  const image2 = images[1] || image
  const isDiscounted = originalPrice && originalPrice > price
  const discountPct = isDiscounted ? Math.round((1 - price / originalPrice) * 100) : 0
  const isOutOfStock = stock === 0

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock || adding) return
    setAdding(true)
    await addToCart(productId, 1)
    setAdding(false)
  }

  const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`

  return (
    <div
      className="group relative bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/products/${productId}`}>
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
          <img
            src={hovered && image2 !== image ? image2 : image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isDiscounted && (
              <span className="bg-accent text-primary text-xs font-bold px-2.5 py-1 uppercase tracking-wider">
                -{discountPct}%
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-800 text-white text-xs font-bold px-2.5 py-1 uppercase tracking-wider">
                Sold Out
              </span>
            )}
          </div>

          {/* Quick Add overlay */}
          <div className={`absolute inset-x-0 bottom-0 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className={`w-full py-3 text-sm font-semibold uppercase tracking-widest transition-colors duration-300 flex items-center justify-center gap-2
                ${isOutOfStock
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-primary text-accent hover:bg-primary-light'
                }`}
            >
              <ShoppingBag size={15} />
              {adding ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Quick Add'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {category && (
            <span className="text-xs text-accent font-medium uppercase tracking-widest">
              {typeof category === 'object' ? category.name : category}
            </span>
          )}
          <h3 className="text-primary font-medium text-sm mt-1 line-clamp-2 leading-snug group-hover:text-accent transition-colors duration-300">
            {name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-primary">{formatPrice(price)}</span>
            {isDiscounted && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

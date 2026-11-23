import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios.js'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    if (isLoggedIn) fetchCart()
    else setCartItems([])
  }, [isLoggedIn])

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart')
      setCartItems(data.items || [])
    } catch {
      setCartItems([])
    }
  }

  const addToCart = async (productId, quantity = 1, size = null, color = null) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items')
      return
    }
    try {
      await api.post('/cart/add', { productId, quantity, size, color })
      await fetchCart()
      toast.success('Added to cart')
      setCartOpen(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    }
  }

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      if (quantity < 1) {
        await removeFromCart(cartItemId)
        return
      }
      await api.put(`/cart/${cartItemId}`, { quantity })
      await fetchCart()
    } catch {
      toast.error('Failed to update quantity')
    }
  }

  const removeFromCart = async (cartItemId) => {
    try {
      await api.delete(`/cart/${cartItemId}`)
      await fetchCart()
      toast.success('Removed from cart')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const clearCart = async () => {
    try {
      await api.delete('/cart')
      setCartItems([])
    } catch {
      toast.error('Failed to clear cart')
    }
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      cartOpen,
      setCartOpen,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

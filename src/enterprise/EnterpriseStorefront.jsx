import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'

const EnterpriseStorefront = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/products/public')
      setProducts(response.data || [])
    } catch (error) {
      console.error('Error loading storefront products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === (product._id || product.id))
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [
        ...prev,
        {
          id: product._id || product.id,
          name: product.name,
          price: Number(product.price) || 0,
          imageUrl: product.imageUrl,
          quantity: 1,
        },
      ]
    })
  }

  const handleRemoveFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  )

  const handleCheckout = async () => {
    if (cartItems.length === 0) return
    setCheckingOut(true)
    setOrderSuccess(false)
    setOrderNumber('')

    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: cartTotal,
      }
      const response = await apiClient.post('/orders', payload)
      setOrderNumber(response.data?.orderNumber || '')
      setOrderSuccess(true)
      setCartItems([])
    } catch (error) {
      console.error('Error creating order:', error)
    } finally {
      setCheckingOut(false)
    }
  }

  const handleIncreaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  const handleDecreaseQty = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
    )
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const price = Number(p.price) || 0
      const minOk = minPrice ? price >= Number(minPrice) : true
      const maxOk = maxPrice ? price <= Number(maxPrice) : true
      return nameMatch && minOk && maxOk
    })
  }, [products, searchTerm, minPrice, maxPrice])

  const bestSellers = useMemo(() => {
    if (!products || products.length === 0) return []
    const tagged = products.filter((p) => p.tags?.includes('bestseller'))
    if (tagged.length > 0) return tagged
    // fallback: top by price if no explicit bestsellers
    const sorted = [...products].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    return sorted.slice(0, 3)
  }, [products])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar with AI For Her theme */}
      <header className="w-full bg-pink-300/95 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="group flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 group-hover:text-pink-700 transition-colors logo-pratibhara">
              Pratibhara
            </h1>
            <p className="text-sm text-gray-800">Discover products from women entrepreneurs</p>
          </Link>
          <button
            type="button"
            onClick={() => setShowCheckout(true)}
            className="relative px-4 py-2 text-sm font-medium rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors"
          >
            <span className="inline-flex items-center gap-1">
              <ShoppingCartIcon className="w-4 h-4" />
              
            </span>
            {cartItems.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white text-pink-600 font-semibold">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="mb-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Search Products</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
            />
          </div>
          <div className="flex gap-3 mt-3 md:mt-0">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Price</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Price</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Best Sellers */}
        {!loading && bestSellers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Best Sellers</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {bestSellers.map((p) => (
                <div
                  key={`best-${p._id || p.id}`}
                  className="min-w-[220px] bg-white border border-pink-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100" />
                  )}
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{p.description}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-pink-600 font-bold text-sm">₹{p.price}</span>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p)}
                        className="px-2 py-1 text-[11px] font-medium rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No products available yet.</p>
            <p className="text-sm mt-2">Check back soon as entrepreneurs start listing their products.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((p) => (
              <div
                key={p._id || p.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
              >
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100" />
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 flex items-center gap-2">
                    <span>{p.name}</span>
                    <div className="flex gap-1">
                      {p.tags?.includes('new') && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700">New</span>
                      )}
                      {p.tags?.includes('bestseller') && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-yellow-100 text-yellow-700">Best Seller</span>
                      )}
                    </div>
                  </h2>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-pink-600 font-bold text-lg">₹{p.price}</span>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(p)}
                      className="px-3 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Checkout / Cart Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Cart</h2>
              <button
                type="button"
                onClick={() => {
                  setShowCheckout(false)
                  setOrderSuccess(false)
                }}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Close
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-sm mb-4">Your cart is empty. Add products to get started.</p>
            ) : (
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-gray-100 pb-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        ₹{item.price} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDecreaseQty(item.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-xs text-gray-700 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="text-sm text-gray-800 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleIncreaseQty(item.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-xs text-gray-700 hover:bg-gray-100"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-xs text-red-500 hover:text-red-600 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-lg font-bold text-pink-600">₹{cartTotal}</span>
            </div>

            {orderSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                Payment successful! Thank you for your order.
                {orderNumber && (
                  <span className="block mt-1 text-xs text-green-800">Order ID: {orderNumber}</span>
                )}
              </div>
            )}

            <button
              type="button"
              disabled={cartItems.length === 0 || checkingOut}
              onClick={handleCheckout}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 disabled:opacity-50 hover:from-pink-600 hover:to-purple-600 transition-colors"
            >
              {checkingOut ? 'Processing Payment...' : 'Buy Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnterpriseStorefront

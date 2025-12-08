import { useEffect, useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api'
import { ShoppingCartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import heroFactoryWorkers from '../../Factory-workers.jpg'
import heroWomenAtWork from '../../womenatwork.jpeg'
import heroWomenAtWork1 from '../../w.jpg'

const categoriesList = [
  'Clothing',
  'Accessories',
  'Home & Living',
  'Food & Beverages',
  'Beauty & Wellness',
  'Services',
  'Other',
];

const EnterpriseStorefront = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState('cart')
  const [customerDetails, setCustomerDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardHolder: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  })
  const [checkingOut, setCheckingOut] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  // Removed [minPrice, setMinPrice] and [maxPrice, setMaxPrice] states
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [showSearchInput, setShowSearchInput] = useState(false) 

  // Refs for scrolling
  const bestSellersRef = useRef(null)
  const newArrivalsRef = useRef(null)
  const searchInputRef = useRef(null) 

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
  
  // Effect to focus on the search input when it becomes visible
  useEffect(() => {
    if (showSearchInput && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchInput]);

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
    if (
      !customerDetails.firstName ||
      !customerDetails.lastName ||
      !customerDetails.email ||
      !customerDetails.phone ||
      !customerDetails.addressLine1 ||
      !customerDetails.city
    ) {
      return
    }
    setCheckingOut(true)
    setOrderSuccess(false)
    setOrderNumber('')

    try {
      const fullName = `${customerDetails.firstName} ${customerDetails.lastName}`.trim()

      const payload = {
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: cartTotal,
        customer: {
          fullName,
          firstName: customerDetails.firstName,
          lastName: customerDetails.lastName,
          email: customerDetails.email,
          phone: customerDetails.phone,
          addressLine1: customerDetails.addressLine1,
          addressLine2: customerDetails.addressLine2,
          city: customerDetails.city,
          state: customerDetails.state,
          postalCode: customerDetails.postalCode,
        },
        payment: {
          method: paymentMethod,
        },
      }
      const response = await apiClient.post('/orders', payload)
      setOrderNumber(response.data?.orderNumber || '')
      setOrderSuccess(true)
      setCartItems([])
      setCheckoutStep('success')
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

  // Categories derived from products
  const productCategories = useMemo(() => {
    const set = new Set()
    products.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set)
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      // Price filtering logic removed as requested
      const categoryOk =
        selectedCategory === 'all' || !selectedCategory
          ? true
          : p.category === selectedCategory
      return nameMatch && categoryOk // Filter only by name and category
    })
  }, [products, searchTerm, selectedCategory])

  const bestSellers = useMemo(() => {
    if (!products || products.length === 0) return []
    const tagged = products.filter((p) => p.tags?.includes('bestseller'))
    if (tagged.length > 0) return tagged
    const sorted = [...products].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    return sorted.slice(0, 3)
  }, [products])

  const newArrivals = useMemo(() => {
      if (!products || products.length === 0) return []
      const tagged = products.filter((p) => p.tags?.includes('new'))
      if (tagged.length > 0) return tagged
      const sorted = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return sorted.slice(0, 3);
  }, [products]);

  // Static hero images for the top carousel (using provided local images)
  const heroImages = [
    heroFactoryWorkers,
    heroWomenAtWork,
    heroWomenAtWork1
     // repeat to keep three slides; replace with a third image if desired
  ]
  
  // Scroll handlers
  // Adjusted offset for the taller header (h-20 is 80px)
  const scrollToSection = (ref) => {
      if (ref.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'start', offset: -80 }); 
      }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Updated Header/Navbar Section (Increased height: h-20) --- */}
      <header className="w-full bg-pink-300 shadow-md fixed top-0 z-40">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20"> {/* Increased height */}
            
            {/* Logo: Pratibhara */}
            <Link to="/" className="flex items-center space-x-2">
                {/* <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-pink-600 font-bold text-2xl border border-pink-400">
                    P
                </div> */}
                <h1 className="text-3xl font-bold text-gray-900 logo-pratibhara">
                    Pratibhara
                </h1>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-10 items-center">
              <Link to="/" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors py-2">
                Home
              </Link>
              
              {/* Category Dropdown */}
              <div className="relative group">
                <span className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors py-2 cursor-pointer">
                    Shop By Category
                </span>
                <div className="absolute left-0 mt-2 hidden group-hover:block w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                        <span 
                            onClick={() => {setSelectedCategory('all'); document.getElementById('shop-by-category').scrollIntoView({ behavior: 'smooth', block: 'start', offset: -80 });}} 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 cursor-pointer"
                        >
                            All Products
                        </span>
                        {categoriesList.map(cat => (
                            <span 
                                key={cat}
                                onClick={() => {setSelectedCategory(cat); document.getElementById('shop-by-category').scrollIntoView({ behavior: 'smooth', block: 'start', offset: -80 });}} 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 cursor-pointer"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>
              </div>

              <button
                onClick={() => scrollToSection(newArrivalsRef)}
                className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors py-2"
              >
                New Arrivals
              </button>
              <button
                onClick={() => scrollToSection(bestSellersRef)}
                className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors py-2"
              >
                Bestsellers
              </button>
              {/* <Link to="/reviews" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors py-2">
                Reviews
              </Link> */}
            </nav>

            {/* Icons: Search & Cart */}
            <div className="flex items-center space-x-4">
              {/* Search Icon (Toggle Input Visibility) */}
              <button
                type="button"
                onClick={() => setShowSearchInput(prev => !prev)}
                className="text-gray-700 hover:text-pink-600 transition-colors p-2 rounded-full hover:bg-pink-100"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="w-6 h-6" /> {/* Increased size */}
              </button>

              {/* Cart Icon */}
              <button
                type="button"
                onClick={() => {
                  setShowCheckout(true)
                  setCheckoutStep('cart')
                }}
                className="relative p-3 text-white bg-pink-500 hover:bg-pink-600 transition-colors rounded-full"
                aria-label="Shopping Cart"
              >
                <ShoppingCartIcon className="w-6 h-6" /> {/* Increased size */}
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] rounded-full bg-red-600 text-white font-bold leading-none">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Container: Adjusted padding for taller header (h-20 is pt-20) */}
      <div className="pt-20"> 
        
        {/* --- Hero Carousel Section (Full Width) using 3 static images --- */}
        {heroImages.length > 0 && (
          <section className="mb-10 relative w-full overflow-hidden shadow-xl">
            <div className="relative w-full h-[600px]"> {/* Increased height */}
              <img
                src={heroImages[carouselIndex]}
                alt={`Pratibhara hero ${carouselIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 bg-black/20"></div> 

              {/* Left arrow */}
              <button
                type="button"
                onClick={() =>
                  setCarouselIndex((prev) =>
                    prev === 0 ? heroImages.length - 1 : prev - 1
                  )
                }
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/70 flex items-center justify-center text-gray-900 shadow-lg hover:bg-white transition-opacity text-xl font-bold"
              >
                ‹
              </button>

              {/* Right arrow */}
              <button
                type="button"
                onClick={() =>
                  setCarouselIndex((prev) =>
                    prev === heroImages.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/70 flex items-center justify-center text-gray-900 shadow-lg hover:bg-white transition-opacity text-xl font-bold"
              >
                ›
              </button>

              {/* Dots */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCarouselIndex(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === carouselIndex
                        ? 'w-7 bg-pink-500'
                        : 'w-2.5 bg-white/70 hover:bg-pink-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* --- Search Input Bar (Shown when icon is clicked) --- */}
        {showSearchInput && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <div className="flex items-center p-3 bg-white rounded-xl shadow-lg border border-pink-200">
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Type to search products..."
                        className="flex-1 px-2 py-2 border-none focus:outline-none text-base"
                    />
                    <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="text-gray-400 hover:text-pink-600 ml-2"
                    >
                        Clear
                    </button>
                </div>
            </div>
        )}

        {/* --- Main Content area with max-width --- */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

            {/* --- Shop By Category (Filter buttons using product categories) --- */}
            {productCategories.length > 0 && (
            <section id="shop-by-category" className="mb-8 pt-4"> 
                <h2 className="text-xl font-bold text-gray-900 mb-4">Shop By Category</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                        ? 'bg-pink-500 text-white border-pink-500 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-pink-50'
                    }`}
                >
                    All Products
                </button>
                {productCategories.map((cat) => (
                    <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                        ? 'bg-pink-500 text-white border-pink-500 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-pink-50'
                    }`}
                    >
                    {cat}
                    </button>
                ))}
                </div>
            </section>
            )}

            {/* Filter by Price section has been removed here. */}

            {/* --- New Arrivals Section --- */}
            {!loading && newArrivals.length > 0 && (
            <section ref={newArrivalsRef} className="mb-10 pt-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">✨ New Arrivals</h2>
                <div className="flex gap-5 overflow-x-auto pb-2">
                {newArrivals.map((p) => (
                    <div
                    key={`new-${p._id || p.id}`}
                    className="min-w-[280px] w-72 bg-white border border-pink-200 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
                    >
                    {p.imageUrl ? (
                        <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-40 object-cover"
                        />
                    ) : (
                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{p.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>
                        <div className="mt-auto flex items-center justify-between">
                        <span className="text-pink-600 font-bold text-lg">₹{p.price}</span>
                        <button
                            type="button"
                            onClick={() => handleAddToCart(p)}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors shadow-md"
                        >
                            Add to Cart
                        </button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </section>
            )}

            {/* --- Best Sellers Section --- */}
            {!loading && bestSellers.length > 0 && (
            <section ref={bestSellersRef} className="mb-10 pt-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">⭐ Bestsellers</h2>
                <div className="flex gap-5 overflow-x-auto pb-2">
                {bestSellers.map((p) => (
                    <div
                    key={`best-${p._id || p.id}`}
                    className="min-w-[280px] w-72 bg-white border border-pink-200 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
                    >
                    {p.imageUrl ? (
                        <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-40 object-cover"
                        />
                    ) : (
                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{p.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>
                        <div className="mt-auto flex items-center justify-between">
                        <span className="text-pink-600 font-bold text-lg">₹{p.price}</span>
                        <button
                            type="button"
                            onClick={() => handleAddToCart(p)}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors shadow-md"
                        >
                            Add to Cart
                        </button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </section>
            )}


            {/* --- All Products Grid --- */}
            <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">All Products</h2>
                {loading ? (
                <div className="text-center py-12 text-gray-500">Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium">No products available yet.</p>
                    <p className="text-sm mt-2">Check back soon or try adjusting your filters.</p>
                </div>
                ) : (
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((p) => (
                    <div
                        key={p._id || p.id}
                        className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300"
                    >
                        {p.imageUrl ? (
                        <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-56 object-cover"
                        />
                        ) : (
                        <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                        )}
                        <div className="p-4 flex-1 flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 flex items-center justify-between gap-2">
                            <span>{p.name}</span>
                            <div className="flex gap-1">
                            {p.tags?.includes('new') && (
                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700 font-medium">New</span>
                            )}
                            {p.tags?.includes('bestseller') && (
                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-yellow-100 text-yellow-700 font-medium">Best Seller</span>
                            )}
                            </div>
                        </h2>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>
                        <div className="mt-auto flex items-center justify-between">
                            <span className="text-pink-600 font-bold text-xl">₹{p.price}</span>
                            <button
                            type="button"
                            onClick={() => handleAddToCart(p)}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors shadow-md"
                            >
                            Add to Cart
                            </button>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </section>
        </main>
      </div>

      {/* Checkout / Cart Drawer (Kept existing functionality) */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="flex-1 bg-black/40"
            onClick={() => {
              setShowCheckout(false)
              setOrderSuccess(false)
              setCheckoutStep('cart')
            }}
          />

          <div className="w-full max-w-md h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {checkoutStep === 'cart' && 'Your Cart'}
                {checkoutStep === 'details' && 'Customer Details'}
                {checkoutStep === 'payment' && 'Payment'}
                {checkoutStep === 'success' && 'Order Successful'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowCheckout(false)
                  setOrderSuccess(false)
                  setCheckoutStep('cart')
                }}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-pink-50/60 via-white to-white">
              {checkoutStep === 'cart' && (
                <>
                  {cartItems.length === 0 ? (
                    <p className="text-gray-500 text-sm mb-4">Your cart is empty. Add products to get started.</p>
                  ) : (
                    <div className="space-y-3 mb-4">
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

                  <button
                    type="button"
                    disabled={cartItems.length === 0}
                    onClick={() => setCheckoutStep('details')}
                    className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white bg-pink-500 disabled:opacity-50 hover:bg-pink-600 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </>
              )}

              {checkoutStep === 'details' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={customerDetails.firstName}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={customerDetails.lastName}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address Line 1</label>
                    <textarea
                      rows={2}
                      value={customerDetails.addressLine1}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, addressLine1: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address Line 2 (optional)</label>
                    <input
                      type="text"
                      value={customerDetails.addressLine2}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, addressLine2: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={customerDetails.city}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={customerDetails.state}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={customerDetails.postalCode}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, postalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                    />
                  </div>
                </div>
              )}

              {checkoutStep === 'payment' && (
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <p className="font-medium mb-2">Choose Payment Method</p>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`px-3 py-2 rounded-lg border flex-1 text-center ${
                          paymentMethod === 'upi'
                            ? 'bg-pink-500 text-white border-pink-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        UPI
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`px-3 py-2 rounded-lg border flex-1 text-center ${
                          paymentMethod === 'card'
                            ? 'bg-pink-500 text-white border-pink-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Card
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white px-3 py-3 space-y-3">
                    <p className="text-xs font-medium text-gray-700 flex items-center justify-between">
                      <span>Payable Amount</span>
                      <span className="text-pink-600 text-sm font-semibold">₹{cartTotal}</span>
                    </p>

                    {paymentMethod === 'upi' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">UPI ID</label>
                        <input
                          type="text"
                          placeholder="yourname@upi"
                          value={paymentDetails.upiId}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                        />
                        <p className="text-[11px] text-gray-500">You will see a payment request in your UPI app in a real integration.</p>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name on Card</label>
                          <input
                            type="text"
                            value={paymentDetails.cardHolder}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardHolder: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Card Number</label>
                          <input
                            type="text"
                            maxLength={19}
                            value={paymentDetails.cardNumber}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              maxLength={5}
                              value={paymentDetails.cardExpiry}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">CVV</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={paymentDetails.cardCvv}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500">Card details are for demo only and are not processed.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="space-y-3 text-sm">
                  <div className="p-3 rounded-lg bg-green-50 text-green-700">
                    <p className="font-medium">Payment successful! Thank you for your order.</p>
                    {orderNumber && (
                      <p className="text-xs text-green-800 mt-1">Order ID: {orderNumber}</p>
                    )}
                  </div>
                  {(customerDetails.firstName || customerDetails.lastName) && (
                    <p className="text-xs text-gray-600">
                      Placed by {`${customerDetails.firstName} ${customerDetails.lastName}`.trim()}
                      {customerDetails.city ? ` from ${customerDetails.city}` : ''}.
                    </p>
                  )}
                </div>
              )}
            </div>

            {checkoutStep === 'details' && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back to Cart
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !customerDetails.firstName ||
                      !customerDetails.lastName ||
                      !customerDetails.email ||
                      !customerDetails.phone ||
                      !customerDetails.addressLine1 ||
                      !customerDetails.city
                    ) {
                      return
                    }
                    setCheckoutStep('payment')
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {checkoutStep === 'payment' && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('details')}
                  className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={checkingOut}
                  onClick={handleCheckout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-pink-500 disabled:opacity-50 hover:bg-pink-600 transition-colors"
                >
                  {checkingOut ? 'Processing Payment...' : 'Complete Payment'}
                </button>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckout(false)
                    setOrderSuccess(false)
                    setCheckoutStep('cart')
                    setCustomerDetails({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      addressLine1: '',
                      addressLine2: '',
                      city: '',
                      state: '',
                      postalCode: '',
                    })
                    setPaymentDetails({
                      upiId: '',
                      cardHolder: '',
                      cardNumber: '',
                      cardExpiry: '',
                      cardCvv: '',
                    })
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

export default EnterpriseStorefront
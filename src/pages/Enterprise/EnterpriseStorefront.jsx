import { useEffect, useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ShoppingCartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

import heroFactoryWorkers from '../../assets/storefront/real-store-hero-1.png'
import heroWomenAtWork from '../../assets/storefront/real-store-hero-2.png'
import heroWomenAtWork1 from '../../assets/storefront/real-store-hero-3.png'

// Updated Logos
import logo from '../../assets/bg.png'
import wordmark from '../../assets/text.png'

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
  const [customerErrors, setCustomerErrors] = useState({})
  const [paymentErrors, setPaymentErrors] = useState({})
  const [checkingOut, setCheckingOut] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [showSearchInput, setShowSearchInput] = useState(false) 

  const bestSellersRef = useRef(null)
  const newArrivalsRef = useRef(null)
  const searchInputRef = useRef(null) 

  const loadProducts = async () => {
    setLoading(true)
    try {
      const productsQuery = query(collection(db, 'products'), where('isPublic', '==', true));
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
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

  const validateCustomerDetails = () => {
    const errors = {}

    if (!customerDetails.firstName?.trim()) errors.firstName = 'First name is required'
    if (!customerDetails.lastName?.trim()) errors.lastName = 'Last name is required'
    if (!customerDetails.email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      errors.email = 'Enter a valid email address'
    }

    if (!customerDetails.phone?.trim()) {
      errors.phone = 'Mobile number is required'
    } else if (!/^\d{10}$/.test(customerDetails.phone.replace(/\D/g, ''))) {
      errors.phone = 'Enter a valid 10-digit mobile number'
    }

    if (!customerDetails.addressLine1?.trim()) errors.addressLine1 = 'Address Line 1 is required'
    if (!customerDetails.city?.trim()) errors.city = 'City is required'
    if (!customerDetails.state?.trim()) errors.state = 'State is required'
    if (!customerDetails.postalCode?.trim()) {
      errors.postalCode = 'PIN code is required'
    } else if (!/^\d{4,6}$/.test(customerDetails.postalCode.replace(/\D/g, ''))) {
      errors.postalCode = 'Enter a valid PIN code'
    }

    setCustomerErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePaymentDetails = () => {
    const errors = {}

    if (paymentMethod === 'upi') {
      if (!paymentDetails.upiId?.trim()) {
        errors.upiId = 'UPI ID is required'
      }
    }

    if (paymentMethod === 'card') {
      if (!paymentDetails.cardHolder?.trim()) errors.cardHolder = 'Name on card is required'

      const number = paymentDetails.cardNumber?.replace(/\s+/g, '') || ''
      if (!number) {
        errors.cardNumber = 'Card number is required'
      } else if (!/^\d{12,19}$/.test(number)) {
        errors.cardNumber = 'Enter a valid card number'
      }

      if (!paymentDetails.cardExpiry?.trim()) {
        errors.cardExpiry = 'Expiry is required'
      } else if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(paymentDetails.cardExpiry)) {
        errors.cardExpiry = 'Use MM/YY format'
      }

      const cvv = paymentDetails.cardCvv?.trim() || ''
      if (!cvv) {
        errors.cardCvv = 'CVV is required'
      } else if (!/^\d{3,4}$/.test(cvv)) {
        errors.cardCvv = 'Enter a valid CVV'
      }
    }

    setPaymentErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    const customerOk = validateCustomerDetails()
    const paymentOk = validatePaymentDetails()
    if (!customerOk || !paymentOk) {
      return
    }
    setCheckingOut(true)
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
      
      const productIds = cartItems.map(item => item.id);
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('__name__', 'in', productIds));
      const productSnapshots = await getDocs(q);
      const ownerIds = new Set();
      productSnapshots.forEach(doc => {
        ownerIds.add(doc.data().userId);
      });

      payload.owners = Array.from(ownerIds);

      const docRef = await addDoc(collection(db, 'orders'), payload);
      setOrderNumber(docRef.id);
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

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const categoryOk =
        selectedCategory === 'all' || !selectedCategory
          ? true
          : p.category === selectedCategory
      return nameMatch && categoryOk
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

  const heroImages = [
    heroFactoryWorkers,
    heroWomenAtWork,
    heroWomenAtWork1
  ]
 
  useEffect(() => {
    if (!heroImages.length) return;
    const intervalId = setInterval(() => {
      setCarouselIndex((prev) =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      )
    }, 6000)
    return () => clearInterval(intervalId)
  }, [heroImages.length])
  
  const scrollToSection = (ref) => {
      if (ref.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'start', offset: -80 }); 
      }
  };

  return (
    <div className="min-h-screen bg-[#fffdf9] font-sans">
      {/* --- Themed Header --- */}
      <header className="w-full bg-[#fffdf9]/95 backdrop-blur-md border-b border-[#e8dcc4] shadow-sm fixed top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            
            {/* Themed Logo */}
            <Link to="/" className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
              <img src={logo} alt="Pratibhara emblem" className="h-12 w-auto object-contain" />
              <img src={wordmark} alt="Pratibhara" className="h-9 w-auto object-contain" />
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8 items-center">
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-sm font-bold uppercase tracking-widest text-[#3b1f16] hover:text-[#efb84a] transition-colors py-2"
              >
                Home
              </Link>
              
              {/* Category Dropdown */}
              <div className="relative group">
                <span className="text-sm font-bold uppercase tracking-widest text-[#3b1f16] hover:text-[#efb84a] transition-colors py-2 cursor-pointer">
                    Shop By Category
                </span>
                <div className="absolute left-0 mt-2 hidden group-hover:block w-56 rounded-xl shadow-[0_10px_40px_rgba(59,31,22,0.1)] bg-white border border-[#e8dcc4] z-50 overflow-hidden">
                    <div className="py-2">
                        <span 
                            onClick={() => {setSelectedCategory('all'); document.getElementById('shop-by-category').scrollIntoView({ behavior: 'smooth', block: 'start', offset: -80 });}} 
                            className="block px-5 py-2.5 text-sm font-medium text-[#3b1f16] hover:bg-[#efb84a]/10 hover:text-[#d99a2b] cursor-pointer transition-colors"
                        >
                            All Products
                        </span>
                        {categoriesList.map(cat => (
                            <span 
                                key={cat}
                                onClick={() => {setSelectedCategory(cat); document.getElementById('shop-by-category').scrollIntoView({ behavior: 'smooth', block: 'start', offset: -80 });}} 
                                className="block px-5 py-2.5 text-sm font-medium text-[#3b1f16] hover:bg-[#efb84a]/10 hover:text-[#d99a2b] cursor-pointer transition-colors"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                </div>
              </div>

              <button
                onClick={() => scrollToSection(newArrivalsRef)}
                className="text-sm font-bold uppercase tracking-widest text-[#3b1f16] hover:text-[#efb84a] transition-colors py-2"
              >
                New Arrivals
              </button>
              <button
                onClick={() => scrollToSection(bestSellersRef)}
                className="text-sm font-bold uppercase tracking-widest text-[#3b1f16] hover:text-[#efb84a] transition-colors py-2"
              >
                Bestsellers
              </button>
            </nav>

            {/* Icons: Search & Cart */}
            <div className="flex items-center space-x-6">
              <button
                type="button"
                onClick={() => setShowSearchInput(prev => !prev)}
                className="text-[#3b1f16] hover:text-[#d99a2b] transition-colors p-2"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="w-6 h-6 stroke-2" /> 
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCheckout(true)
                  setCheckoutStep('cart')
                }}
                className="relative p-2 text-[#3b1f16] hover:text-[#d99a2b] transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingCartIcon className="w-7 h-7 stroke-2" /> 
                {cartItems.length > 0 && (
                  <span className="absolute top-0 -right-1 w-5 h-5 flex items-center justify-center text-[10px] rounded-full bg-[#6f1d1b] text-white font-bold shadow-sm">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Container */}
      <div className="pt-20"> 
        
        {/* --- Hero Carousel --- */}
        {heroImages.length > 0 && (
          <section className="mb-0 relative w-full overflow-hidden">
            <div className="relative w-full h-[84vh] min-h-[590px] max-h-[840px]"> 
              <img
                key={carouselIndex}
                src={heroImages[carouselIndex]}
                alt={`Pratibhara hero ${carouselIndex + 1}`}
                className="w-full h-full object-cover hero-image-transition"
              />
              
              {/* Warm Themed Overlay */}
              <div className="absolute inset-0 bg-gradient-to-l from-[#3b1f16]/80 via-[#3b1f16]/40 to-transparent"></div> 

              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
                  <div key={carouselIndex} className="max-w-5xl ml-auto text-right text-[#fdf9f1] hero-slide-in">
                    <p className="text-xs md:text-sm uppercase font-bold tracking-[0.25em] text-[#efb84a] mb-4">
                      Pratibhara Storefront
                    </p>
                    <h1 className="max-w-5xl text-balance text-4xl md:text-6xl font-normal italic font-playfair mb-6 leading-tight tracking-tight drop-shadow-md">
                      Support women-led businesses with every purchase.
                    </h1>
                    <p className="text-lg md:text-xl text-[#e8dcc4] mb-8 max-w-lg ml-auto leading-relaxed">
                      Discover hand-crafted products, wellness essentials, and curated goods from women entrepreneurs across India.
                    </p>
                    <button
                      type="button"
                      onClick={() => bestSellersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start', offset: -100 })}
                      className="border-4 border-[#3b1f16] bg-gradient-to-b from-[#efb84a] to-[#d99a2b] text-[#3b1f16] px-8 py-3 rounded-full font-bold uppercase tracking-[0.12em] shadow-[0_5px_0_#3b1f16] transition-all hover:from-[#f6c967] hover:to-[#efb84a] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#3b1f16] active:translate-y-1 active:shadow-[0_1px_0_#3b1f16]"
                    >
                      Shop Bestsellers
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCarouselIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === carouselIndex
                        ? 'w-10 bg-[#efb84a]'
                        : 'w-2 bg-[#fdf9f1]/50 hover:bg-[#efb84a]/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Themed Marquee Ticker */}
        <section className="bg-[#3b1f16] text-[#e8dcc4] py-3 text-sm tracking-[0.2em] uppercase font-bold overflow-hidden shadow-inner">
          <div className="marquee-track">
            <div className="marquee-group">
              <span>Hand-crafted by women-led enterprises</span>
              <span className="text-[#efb84a]">✦</span>
              <span>Quality curated goods</span>
              <span className="text-[#efb84a]">✦</span>
              <span>Every purchase supports livelihoods</span>
              <span className="text-[#efb84a]">✦</span>
            </div>
            <div className="marquee-group" aria-hidden="true">
              <span>Hand-crafted by women-led enterprises</span>
              <span className="text-[#efb84a]">✦</span>
              <span>Quality curated goods</span>
              <span className="text-[#efb84a]">✦</span>
              <span>Every purchase supports livelihoods</span>
              <span className="text-[#efb84a]">✦</span>
            </div>
          </div>
        </section>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-16">

          {/* Search Input Bar */}
          {showSearchInput && (
              <div className="mb-6 transform transition-all">
                  <div className="flex items-center p-2 bg-white rounded-2xl shadow-[0_8px_30px_rgba(59,31,22,0.08)] border border-[#e8dcc4]">
                      <MagnifyingGlassIcon className="w-5 h-5 text-[#3b1f16] ml-3 opacity-50" />
                      <input
                          ref={searchInputRef}
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search for products..."
                          className="flex-1 px-4 py-3 border-none focus:outline-none text-[#3b1f16] bg-transparent font-medium"
                      />
                      <button
                          type="button"
                          onClick={() => {setSearchTerm(''); setShowSearchInput(false);}}
                          className="px-4 py-2 text-sm font-bold text-[#6f1d1b] hover:bg-[#6f1d1b]/10 rounded-xl transition-colors"
                      >
                          Close
                      </button>
                  </div>
              </div>
          )}

          {/* New Arrivals Section */}
          {!loading && newArrivals.length > 0 && (
          <section ref={newArrivalsRef}>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl md:text-4xl font-normal italic font-playfair text-[#6f1d1b] tracking-tight">New Arrivals</h2>
                <div className="h-px bg-[#e8dcc4] flex-grow"></div>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-6 snap-x">
              {newArrivals.map((p) => (
                  <div
                  key={`new-${p._id || p.id}`}
                  className="snap-start min-w-[300px] w-80 bg-white border border-[#e8dcc4] rounded-3xl shadow-[0_8px_24px_rgba(59,31,22,0.04)] overflow-hidden flex flex-col hover:shadow-[0_12px_40px_rgba(59,31,22,0.1)] hover:-translate-y-1 transition-all duration-300"
                  >
                  <div className="relative h-56 bg-[#fdf9f1] p-4">
                    {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                        <div className="w-full h-full rounded-xl bg-[#e8dcc4]/30 flex items-center justify-center text-[#3b1f16]/40 font-medium">No Image</div>
                    )}
                    <span className="absolute top-6 left-6 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-white text-[#3b1f16] shadow-sm">New</span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-[#6f1d1b] mb-2 line-clamp-1">{p.name}</h3>
                      <p className="text-sm text-[#3b1f16]/70 mb-6 line-clamp-2 leading-relaxed">{p.description}</p>
                      <div className="mt-auto flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#3b1f16]">₹{p.price}</span>
                      <button
                          type="button"
                          onClick={() => handleAddToCart(p)}
                          className="px-5 py-2 text-sm font-bold uppercase tracking-wider rounded-full border-2 border-[#3b1f16] bg-gradient-to-b from-[#efb84a] to-[#d99a2b] text-[#3b1f16] shadow-[0_3px_0_#3b1f16] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#3b1f16] active:translate-y-1 active:shadow-none transition-all"
                      >
                          Add +
                      </button>
                      </div>
                  </div>
                  </div>
              ))}
              </div>
          </section>
          )}

          {/* Best Sellers Section */}
          {!loading && bestSellers.length > 0 && (
          <section ref={bestSellersRef}>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl md:text-4xl font-normal italic font-playfair text-[#6f1d1b] tracking-tight">Bestsellers</h2>
                <div className="h-px bg-[#e8dcc4] flex-grow"></div>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-6 snap-x">
              {bestSellers.map((p) => (
                  <div
                  key={`best-${p._id || p.id}`}
                  className="snap-start min-w-[300px] w-80 bg-white border border-[#e8dcc4] rounded-3xl shadow-[0_8px_24px_rgba(59,31,22,0.04)] overflow-hidden flex flex-col hover:shadow-[0_12px_40px_rgba(59,31,22,0.1)] hover:-translate-y-1 transition-all duration-300"
                  >
                  <div className="relative h-56 bg-[#fdf9f1] p-4">
                    {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                        <div className="w-full h-full rounded-xl bg-[#e8dcc4]/30 flex items-center justify-center text-[#3b1f16]/40 font-medium">No Image</div>
                    )}
                    <span className="absolute top-6 left-6 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-[#3b1f16] text-[#efb84a] shadow-sm">Popular</span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-[#6f1d1b] mb-2 line-clamp-1">{p.name}</h3>
                      <p className="text-sm text-[#3b1f16]/70 mb-6 line-clamp-2 leading-relaxed">{p.description}</p>
                      <div className="mt-auto flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#3b1f16]">₹{p.price}</span>
                      <button
                          type="button"
                          onClick={() => handleAddToCart(p)}
                          className="px-5 py-2 text-sm font-bold uppercase tracking-wider rounded-full border-2 border-[#3b1f16] bg-gradient-to-b from-[#efb84a] to-[#d99a2b] text-[#3b1f16] shadow-[0_3px_0_#3b1f16] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#3b1f16] active:translate-y-1 active:shadow-none transition-all"
                      >
                          Add +
                      </button>
                      </div>
                  </div>
                  </div>
              ))}
              </div>
          </section>
          )}

          {/* All Products Grid */}
          <section id="shop-by-category">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-3xl md:text-4xl font-normal italic font-playfair text-[#6f1d1b] tracking-tight">The Collection</h2>
                <div className="h-px bg-[#e8dcc4] flex-grow"></div>
              </div>

              {selectedCategory && selectedCategory !== 'all' && !loading && (
                <p className="mb-8 text-sm text-[#3b1f16] font-medium">
                  Showing results for <span className="text-[#6f1d1b] font-bold">"{selectedCategory}"</span>
                  <span className="opacity-60 ml-2">({filteredProducts.length} items)</span>
                </p>
              )}
              
              {loading ? (
              <div className="text-center py-20 text-[#3b1f16]/50 font-bold uppercase tracking-widest">Curating products...</div>
              ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-[#3b1f16]">
                  <p className="text-xl font-bold font-playfair italic text-[#6f1d1b] mb-2">No products found.</p>
                  <p className="opacity-70">Try adjusting your category or search terms.</p>
              </div>
              ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((p) => (
                  <div
                      key={p._id || p.id}
                      className="bg-white border border-[#e8dcc4] rounded-3xl shadow-[0_4px_20px_rgba(59,31,22,0.03)] overflow-hidden flex flex-col hover:shadow-[0_12px_40px_rgba(59,31,22,0.08)] hover:-translate-y-1 transition-all duration-300 group"
                  >
                      <div className="relative h-60 bg-[#fdf9f1] p-4 overflow-hidden">
                        {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full rounded-2xl bg-[#e8dcc4]/30 flex items-center justify-center text-[#3b1f16]/40 font-medium">No Image</div>
                        )}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                          {p.tags?.includes('new') && (
                              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white text-[#3b1f16] shadow-sm">New</span>
                          )}
                          {p.tags?.includes('bestseller') && (
                              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#3b1f16] text-[#efb84a] shadow-sm">Hot</span>
                          )}
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                      <h2 className="text-lg font-bold text-[#6f1d1b] mb-2 line-clamp-1">
                          {p.name}
                      </h2>
                      <p className="text-sm text-[#3b1f16]/70 mb-6 line-clamp-2 leading-relaxed">{p.description}</p>
                      
                      <div className="mt-auto flex items-center justify-between">
                          <span className="text-xl font-bold text-[#3b1f16]">₹{p.price}</span>
                          <button
                          type="button"
                          onClick={() => handleAddToCart(p)}
                          className="px-5 py-2 text-sm font-bold uppercase tracking-wider rounded-full border-2 border-[#3b1f16] bg-gradient-to-b from-[#efb84a] to-[#d99a2b] text-[#3b1f16] shadow-[0_3px_0_#3b1f16] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#3b1f16] active:translate-y-1 active:shadow-none transition-all"
                          >
                          Add +
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

      {/* --- Themed Checkout / Cart Drawer --- */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="flex-1 bg-[#3b1f16]/40 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setShowCheckout(false)
              setCheckoutStep('cart')
            }}
          />

          <div className="w-full max-w-md h-full bg-[#fffdf9] shadow-2xl border-l border-[#e8dcc4] flex flex-col animate-slide-in-right">
            
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-[#e8dcc4] bg-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-playfair italic text-[#6f1d1b]">
                  {checkoutStep === 'cart' && `Your Cart (${cartItems.length})`}
                  {checkoutStep === 'details' && 'Shipping Details'}
                  {checkoutStep === 'payment' && 'Secure Payment'}
                  {checkoutStep === 'success' && 'Order Confirmed'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCheckout(false)
                  setCheckoutStep('cart')
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#fdf9f1] text-[#3b1f16] hover:bg-[#e8dcc4] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-[#fffdf9]">
              {checkoutStep === 'cart' && (
                <>
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#3b1f16]/60">
                      <ShoppingCartIcon className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">Your cart is empty.</p>
                      <p className="text-sm mt-2">Discover unique products in our store.</p>
                    </div>
                  ) : (
                    <div className="space-y-5 mb-8">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#e8dcc4] shadow-sm"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#fdf9f1] shrink-0 border border-[#e8dcc4]/50">
                            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-base font-bold text-[#6f1d1b] line-clamp-1">{item.name}</p>
                            <p className="text-sm text-[#3b1f16]/70 font-medium mt-1">₹{item.price}</p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-3 bg-[#fdf9f1] rounded-full border border-[#e8dcc4] px-1 py-1">
                              <button
                                type="button"
                                onClick={() => handleDecreaseQty(item.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-full text-[#3b1f16] hover:bg-white hover:shadow-sm transition-all"
                              >
                                -
                              </button>
                              <span className="text-sm font-bold text-[#3b1f16] w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleIncreaseQty(item.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-full text-[#3b1f16] hover:bg-white hover:shadow-sm transition-all"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider mr-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {cartItems.length > 0 && (
                    <div className="mt-auto pt-6 border-t border-[#e8dcc4]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-base font-bold text-[#3b1f16]">Subtotal</span>
                        <span className="text-2xl font-bold text-[#6f1d1b]">₹{cartTotal}</span>
                      </div>
                      <p className="text-xs text-[#3b1f16]/60 mb-6 font-medium">Taxes and shipping calculated at checkout.</p>

                      <button
                        type="button"
                        onClick={() => setCheckoutStep('details')}
                        className="w-full border-4 border-[#3b1f16] bg-gradient-to-b from-[#efb84a] to-[#d99a2b] text-[#3b1f16] px-8 py-4 rounded-full font-bold uppercase tracking-[0.12em] shadow-[0_5px_0_#3b1f16] transition-all hover:from-[#f6c967] hover:to-[#efb84a] hover:-translate-y-0.5 hover:shadow-[0_7px_0_#3b1f16] active:translate-y-1 active:shadow-[0_1px_0_#3b1f16]"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* DETAILS STEP */}
              {checkoutStep === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1.5">First Name</label>
                      <input
                        type="text"
                        value={customerDetails.firstName}
                        onChange={(e) => {
                          setCustomerDetails({ ...customerDetails, firstName: e.target.value })
                          if (customerErrors.firstName) setCustomerErrors({ ...customerErrors, firstName: undefined })
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                      />
                      {customerErrors.firstName && <p className="mt-1 text-xs text-red-500 font-bold">{customerErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={customerDetails.lastName}
                        onChange={(e) => {
                          setCustomerDetails({ ...customerDetails, lastName: e.target.value })
                          if (customerErrors.lastName) setCustomerErrors({ ...customerErrors, lastName: undefined })
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                      />
                      {customerErrors.lastName && <p className="mt-1 text-xs text-red-500 font-bold">{customerErrors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1.5">Email</label>
                    <input
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => {
                        setCustomerDetails({ ...customerDetails, email: e.target.value })
                        if (customerErrors.email) setCustomerErrors({ ...customerErrors, email: undefined })
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                    />
                    {customerErrors.email && <p className="mt-1 text-xs text-red-500 font-bold">{customerErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1.5">Mobile Number</label>
                    <input
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => {
                        setCustomerDetails({ ...customerDetails, phone: e.target.value })
                        if (customerErrors.phone) setCustomerErrors({ ...customerErrors, phone: undefined })
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                    />
                    {customerErrors.phone && <p className="mt-1 text-xs text-red-500 font-bold">{customerErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1.5">Address Line 1</label>
                    <textarea
                      rows={2}
                      value={customerDetails.addressLine1}
                      onChange={(e) => {
                        setCustomerDetails({ ...customerDetails, addressLine1: e.target.value })
                        if (customerErrors.addressLine1) setCustomerErrors({ ...customerErrors, addressLine1: undefined })
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                    />
                    {customerErrors.addressLine1 && <p className="mt-1 text-xs text-red-500 font-bold">{customerErrors.addressLine1}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1.5">Address Line 2 (optional)</label>
                    <input
                      type="text"
                      value={customerDetails.addressLine2}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, addressLine2: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1.5">City</label>
                      <input
                        type="text"
                        value={customerDetails.city}
                        onChange={(e) => {
                          setCustomerDetails({ ...customerDetails, city: e.target.value })
                          if (customerErrors.city) setCustomerErrors({ ...customerErrors, city: undefined })
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                      />
                      {customerErrors.city && <p className="mt-1 text-xs text-red-500 font-bold">{customerErrors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1.5">State</label>
                      <input
                        type="text"
                        value={customerDetails.state}
                        onChange={(e) => {
                          setCustomerDetails({ ...customerDetails, state: e.target.value })
                          if (customerErrors.state) setCustomerErrors({ ...customerErrors, state: undefined })
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                      />
                      {customerErrors.state && <p className="mt-1 text-xs text-red-500 font-bold">{customerErrors.state}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      value={customerDetails.postalCode}
                      onChange={(e) => {
                        setCustomerDetails({ ...customerDetails, postalCode: e.target.value })
                        if (customerErrors.postalCode) setCustomerErrors({ ...customerErrors, postalCode: undefined })
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                    />
                    {customerErrors.postalCode && <p className="mt-1 text-xs text-red-500 font-bold">{customerErrors.postalCode}</p>}
                  </div>
                </div>
              )}

              {/* PAYMENT STEP */}
              {checkoutStep === 'payment' && (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold text-[#3b1f16] uppercase tracking-wide mb-3">Payment Method</p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 ${
                          paymentMethod === 'upi'
                            ? 'border-[#3b1f16] bg-[#efb84a] text-[#3b1f16] shadow-[0_3px_0_#3b1f16]'
                            : 'border-[#e8dcc4] bg-white text-[#3b1f16] hover:bg-[#fdf9f1]'
                        }`}
                      >
                        UPI
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 ${
                          paymentMethod === 'card'
                            ? 'border-[#3b1f16] bg-[#efb84a] text-[#3b1f16] shadow-[0_3px_0_#3b1f16]'
                            : 'border-[#e8dcc4] bg-white text-[#3b1f16] hover:bg-[#fdf9f1]'
                        }`}
                      >
                        Card
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#e8dcc4] bg-white p-5 space-y-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#e8dcc4] pb-4">
                      <span className="text-sm font-bold text-[#3b1f16] uppercase tracking-wide">Total Amount</span>
                      <span className="text-2xl font-bold text-[#6f1d1b]">₹{cartTotal}</span>
                    </div>

                    {paymentMethod === 'upi' && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1">UPI ID</label>
                        <input
                          type="text"
                          placeholder="yourname@upi"
                          value={paymentDetails.upiId}
                          onChange={(e) => {
                            setPaymentDetails({ ...paymentDetails, upiId: e.target.value })
                            if (paymentErrors.upiId) setPaymentErrors({ ...paymentErrors, upiId: undefined })
                          }}
                          className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                        />
                        {paymentErrors.upiId && <p className="mt-1 text-xs text-red-500 font-bold">{paymentErrors.upiId}</p>}
                        <p className="text-xs text-[#3b1f16]/60 font-medium pt-2">A payment request will be sent to your UPI app.</p>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1.5">Name on Card</label>
                          <input
                            type="text"
                            value={paymentDetails.cardHolder}
                            onChange={(e) => {
                              setPaymentDetails({ ...paymentDetails, cardHolder: e.target.value })
                              if (paymentErrors.cardHolder) setPaymentErrors({ ...paymentErrors, cardHolder: undefined })
                            }}
                            className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                          />
                          {paymentErrors.cardHolder && <p className="mt-1 text-xs text-red-500 font-bold">{paymentErrors.cardHolder}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1.5">Card Number</label>
                          <input
                            type="text"
                            maxLength={19}
                            value={paymentDetails.cardNumber}
                            onChange={(e) => {
                              setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })
                              if (paymentErrors.cardNumber) setPaymentErrors({ ...paymentErrors, cardNumber: undefined })
                            }}
                            className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                          />
                          {paymentErrors.cardNumber && <p className="mt-1 text-xs text-red-500 font-bold">{paymentErrors.cardNumber}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1.5">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              maxLength={5}
                              value={paymentDetails.cardExpiry}
                              onChange={(e) => {
                                setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })
                                if (paymentErrors.cardExpiry) setPaymentErrors({ ...paymentErrors, cardExpiry: undefined })
                              }}
                              className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                            />
                            {paymentErrors.cardExpiry && <p className="mt-1 text-xs text-red-500 font-bold">{paymentErrors.cardExpiry}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#3b1f16] uppercase tracking-wide mb-1.5">CVV</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={paymentDetails.cardCvv}
                              onChange={(e) => {
                                setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })
                                if (paymentErrors.cardCvv) setPaymentErrors({ ...paymentErrors, cardCvv: undefined })
                              }}
                              className="w-full px-4 py-2.5 bg-white border border-[#e8dcc4] rounded-xl text-[#3b1f16] focus:outline-none focus:ring-2 focus:ring-[#efb84a] focus:border-[#efb84a] transition-all text-sm font-medium shadow-sm"
                            />
                            {paymentErrors.cardCvv && <p className="mt-1 text-xs text-red-500 font-bold">{paymentErrors.cardCvv}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUCCESS STEP */}
              {checkoutStep === 'success' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center border-4 border-green-200">
                    <span className="text-4xl text-green-600">✓</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-playfair italic text-[#6f1d1b] mb-2">Order Confirmed!</h3>
                    <p className="text-[#3b1f16] font-medium">Thank you for supporting women entrepreneurs.</p>
                  </div>
                  
                  <div className="w-full bg-white border border-[#e8dcc4] rounded-2xl p-5 text-left shadow-sm">
                    {orderNumber && (
                      <div className="mb-3">
                        <p className="text-xs font-bold text-[#3b1f16]/60 uppercase tracking-wide">Order ID</p>
                        <p className="text-[#3b1f16] font-mono font-bold text-lg">{orderNumber}</p>
                      </div>
                    )}
                    {(customerDetails.firstName || customerDetails.lastName) && (
                      <div>
                        <p className="text-xs font-bold text-[#3b1f16]/60 uppercase tracking-wide">Shipping To</p>
                        <p className="text-[#3b1f16] font-medium">
                          {`${customerDetails.firstName} ${customerDetails.lastName}`.trim()}
                          <br/>{customerDetails.city}, {customerDetails.state} {customerDetails.postalCode}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footers for Checkout Steps */}
            {checkoutStep === 'details' && (
              <div className="px-6 py-4 bg-white border-t border-[#e8dcc4] flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="px-6 py-3 rounded-full font-bold text-[#6f1d1b] hover:bg-[#fdf9f1] transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ok = validateCustomerDetails()
                    if (!ok) return
                    setCheckoutStep('payment')
                  }}
                  className="flex-1 border-4 border-[#3b1f16] bg-gradient-to-b from-[#efb84a] to-[#d99a2b] text-[#3b1f16] px-6 py-3 rounded-full font-bold uppercase tracking-wider shadow-[0_4px_0_#3b1f16] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_0_#3b1f16] active:translate-y-1 active:shadow-none"
                >
                  Next Step
                </button>
              </div>
            )}

            {checkoutStep === 'payment' && (
              <div className="px-6 py-4 bg-white border-t border-[#e8dcc4] flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentErrors({})
                    setCheckoutStep('details')
                  }}
                  className="px-6 py-3 rounded-full font-bold text-[#6f1d1b] hover:bg-[#fdf9f1] transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={checkingOut}
                  onClick={handleCheckout}
                  className="flex-1 border-4 border-[#3b1f16] bg-gradient-to-b from-[#efb84a] to-[#d99a2b] text-[#3b1f16] px-6 py-3 rounded-full font-bold uppercase tracking-wider shadow-[0_4px_0_#3b1f16] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_0_#3b1f16] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingOut ? 'Processing...' : `Pay ₹${cartTotal}`}
                </button>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="px-6 py-4 bg-white border-t border-[#e8dcc4] flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckout(false)
                    setCheckoutStep('cart')
                    setCustomerDetails({
                      firstName: '', lastName: '', email: '', phone: '',
                      addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '',
                    })
                    setPaymentDetails({ upiId: '', cardHolder: '', cardNumber: '', cardExpiry: '', cardCvv: '' })
                  }}
                  className="w-full border-4 border-[#3b1f16] bg-[#fdf9f1] text-[#3b1f16] px-6 py-3 rounded-full font-bold uppercase tracking-wider shadow-[0_4px_0_#3b1f16] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_0_#3b1f16] active:translate-y-1 active:shadow-none"
                >
                  Continue Shopping
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
import { useEffect, useState, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import DashboardLayout from '../../components/DashboardLayout'
import EntrepreneurSidebar from '../../components/EntrepreneurSidebar'
import { useAuth } from '../../hooks/useAuth'

const toastVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};
const pinkGradient = 'bg-gradient-to-r from-pink-400 to-pink-500';
  const pinkGradientHover = 'hover:from-pink-500 hover:to-pink-600';
  const primaryButtonClass = `text-white ${pinkGradient} ${pinkGradientHover} font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const EnterpriseProducts = () => {
  const { currentUser } = useAuth()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'orders'
  const [editingProductId, setEditingProductId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    tags: [],
  })
  const [uploadMethod, setUploadMethod] = useState('url') // 'url' | 'file'
  const [uploading, setUploading] = useState(false)

  const loadProducts = useCallback(() => {
    if (!currentUser?.uid) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('userId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsList);
      setLoading(false);
    }, (error) => {
      console.error('Error loading products:', error);
      setProducts([]);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const loadOrders = useCallback(() => {
    if (!currentUser?.uid) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('owners', 'array-contains', currentUser.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersList);
      setOrdersLoading(false);
    }, (error) => {
      console.error('Error loading orders:', error);
      setOrders([]);
      setOrdersLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    const unsubscribeProducts = loadProducts();
    const unsubscribeOrders = loadOrders();

    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [loadProducts, loadOrders]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentUser?.uid) return

    try {
      const payload = {
        userId: currentUser.uid,
        name: form.name,
        description: form.description,
        price: Number(form.price) || 0,
        category: form.category,
        imageUrl: form.imageUrl,
        tags: form.tags,
        isPublic: true,
      };

      if (editingProductId) {
        const productRef = doc(db, 'products', editingProductId);
        await updateDoc(productRef, payload);
        setMessage('Product updated successfully!');
      } else {
        await addDoc(collection(db, 'products'), payload);
        setMessage('Product added successfully!');
      }
      
      setTimeout(() => setMessage(''), 3000);

      setForm({ name: '', description: '', price: '', category: '', imageUrl: '', tags: [] })
      setEditingProductId(null)
      await loadProducts()
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage('Failed to save product. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setMessage('Product deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      await loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage('Failed to delete product. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    }
  }

  const handleEdit = (product) => {
    setEditingProductId(product._id)
    setActiveTab('products')
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price != null ? String(product.price) : '',
      category: product.category || '',
      imageUrl: product.imageUrl || '',
      tags: product.tags || [],
    })
  }

  const uploadToCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      alert('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.')
      return null
    }

    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
    })

    if (!res.ok) {
      throw new Error('Image upload failed')
    }

    const json = await res.json()
    return json.secure_url
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const url = await uploadToCloudinary(file)
      if (url) {
        setForm((prev) => ({ ...prev, imageUrl: url }))
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <DashboardLayout sidebar={<EntrepreneurSidebar />}>
        <div className="max-w-5xl mx-auto py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Store</h1>
          <p className="text-gray-600 mb-4">Add products and view storefront orders.</p>

        <div className="mb-6 flex gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              activeTab === 'products'
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Product Management
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              activeTab === 'orders'
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Orders
          </button>
        </div>

        {activeTab === 'products' ? (
          <div className="grid md:grid-cols-2 gap-6">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
              >
                <option value="">Select a category</option>
                <option value="Clothing">Clothing</option>
                <option value="Accessories">Accessories</option>
                <option value="Home & Living">Home & Living</option>
                <option value="Food & Beverages">Food & Beverages</option>
                <option value="Beauty & Wellness">Beauty & Wellness</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <div className="flex items-center gap-3 mb-2 text-xs">
                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  className={`px-3 py-1 rounded-lg border ${
                    uploadMethod === 'url'
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  Use URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  className={`px-3 py-1 rounded-lg border ${
                    uploadMethod === 'file'
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  Upload File
                </button>
              </div>

              {uploadMethod === 'url' ? (
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="https://..."
                />
              ) : (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs"
                  />
                  {uploading && (
                    <p className="text-xs text-pink-600">Uploading image...</p>
                  )}
                  {form.imageUrl && !uploading && (
                    <p className="text-xs text-gray-600 break-all">Uploaded URL: {form.imageUrl}</p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
              <div className="flex gap-4 text-xs text-gray-700">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.tags.includes('new')}
                    onChange={(e) => {
                      setForm((prev) => {
                        const tags = new Set(prev.tags || [])
                        if (e.target.checked) tags.add('new'); else tags.delete('new')
                        return { ...prev, tags: Array.from(tags) }
                      })
                    }}
                  />
                  <span>New</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.tags.includes('bestseller')}
                    onChange={(e) => {
                      setForm((prev) => {
                        const tags = new Set(prev.tags || [])
                        if (e.target.checked) tags.add('bestseller'); else tags.delete('bestseller')
                        return { ...prev, tags: Array.from(tags) }
                      })
                    }}
                  />
                  <span>Best Seller</span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              className={`w-full px-4 py-2 ${primaryButtonClass}`}
            >
              {editingProductId ? 'Update Product' : 'Add Product'}
            </button>
          </form>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            {loading ? (
              <p className="text-gray-500">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="text-gray-500">No products yet. Add your first product.</p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-b-0"
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        <span>{p.name}</span>
                        <div className="flex gap-1">
                          {p.tags?.includes('new') && (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700">New</span>
                          )}
                          {p.tags?.includes('bestseller') && (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-yellow-100 text-yellow-700">Best Seller</span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-2">{p.description}</div>
                      <div className="text-sm font-medium text-pink-600 mt-1">₹{p.price}</div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Orders</h2>
            {ordersLoading ? (
              <p className="text-gray-500 text-sm">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500 text-sm">No orders have been placed yet.</p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto text-sm">
                {orders.map((order) => {
                  const customerName =
                    order.customer?.fullName ||
                    (order.customer?.firstName || order.customer?.lastName
                      ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
                      : order.customer?.name || order.customerName)
                  const customerCity = order.customer?.city || order.city

                  // Prefer an explicit order number, but fall back to a short ID if missing
                  const orderLabel = order.orderNumber || (order.id ? order.id.slice(-8) : 'Unknown');

                  return (
                    <div
                      key={order.id}
                      className="border border-gray-100 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">
                          Order #{orderLabel}
                        </span>
                        <span className="text-pink-600 font-bold">₹{order.totalAmount}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                      </p>
                      {customerName && (
                        <p className="text-xs text-gray-600 mb-1">
                          Customer: {customerName}
                          {customerCity ? ` · ${customerCity}` : ''}
                        </p>
                      )}
                      <p className="text-xs text-gray-600">
                        {order.items?.map((it) => `${it.name} (x${it.quantity})`).join(', ')}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>

    {/* Toast Notification */}
    <AnimatePresence>
      {message && (
        <motion.div
          key="product-toast"
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="fixed top-6 right-6 z-9999 w-full max-w-sm"
        >
          <div className={`p-4 rounded-lg shadow-xl text-sm font-medium border ${
            message.includes('success') 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  )
}

export default EnterpriseProducts

/**
 * Store Component - E-commerce Store with Inventory Management
 * 
 * Features:
 * - Product browsing with categories and search
 * - Shopping cart with real-time stock validation
 * - Address management (save/select shipping addresses)
 * - Payment processing with PaymentModal
 * - Automatic inventory reduction after successful orders
 * - Order tracking in store_orders table
 * - Transaction logging
 * 
 * @author Glyph Circle
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDb } from '../hooks/useDb';
import { supabase } from '../services/supabaseClient';
import { useTranslation } from '../hooks/useTranslation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import SmartBackButton from './shared/SmartBackButton';
import OptimizedImage from './shared/OptimizedImage';
import { StoreItemWithStock } from '../services/db';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import AddressFormModal, { AddressFormData } from './AddressFormModal';
import PaymentModal from './PaymentModal';

// Product categories configuration
const CATEGORIES = {
  crystals: { name: 'Crystals & Gemstones', icon: '💎', color: 'purple' },
  'spiritual-tools': { name: 'Spiritual Tools', icon: '🕉️', color: 'amber' },
  books: { name: 'Books & Learning', icon: '📚', color: 'blue' },
  remedies: { name: 'Remedies & Rituals', icon: '🔱', color: 'red' },
  meditation: { name: 'Meditation & Yoga', icon: '🧘', color: 'green' }
};

const ITEMS_PER_PAGE = 20;

const Store: React.FC = () => {
  // Hooks
  const navigate = useNavigate();
  const { db } = useDb();
  const { getRegionalPrice } = useTranslation();
  const { cart, cartCount, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();

  // Product browsing state
  const [items, setItems] = useState<StoreItemWithStock[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Checkout data
  const [existingAddresses, setExistingAddresses] = useState<any[]>([]);
  const [currentShippingAddress, setCurrentShippingAddress] = useState<any>(null);
  const [paymentService, setPaymentService] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Fetch items when category, search term, or page changes
   */
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('v_store_items_with_stock')
          .select('*', { count: 'exact' });

        // Apply category filter
        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        // Apply search filter
        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }

        // Execute query with pagination
        const { data, error } = await query
          .order('name')
          .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        console.error('Failed to fetch items:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [selectedCategory, searchTerm, page]);

  /**
   * Add item to shopping cart with stock validation
   */
  const handleAddToCart = (item: StoreItemWithStock) => {
    // Prevent adding out-of-stock items
    if (item.stock_status === 'out_of_stock') return;

    // Check if adding would exceed available stock
    const cartItem = cart.find(i => i.id === item.id);
    const currentQuantityInCart = cartItem?.quantity || 0;

    if (currentQuantityInCart >= item.available_stock) {
      alert(`Sorry! Only ${item.available_stock} units available in stock.`);
      return;
    }

    // Add to cart
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image_url,
      category: item.category,
      sku: item.sku,
      maxStock: item.available_stock
    });

    // Show success notification
    showToast(`✅ ${item.name} added to cart!`);
  };

  /**
   * Show toast notification
   */
  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 z-[100] bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl animate-slide-in-right';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  /**
   * Start checkout process - fetch addresses and open address modal
   */
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setIsProcessing(true);

    try {
      // Fetch user's shipping addresses
      const { data: addresses, error: fetchError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_shipping', true)
        .order('is_default', { ascending: false });

      if (fetchError) {
        console.error('Failed to load addresses:', fetchError);
        alert(`Failed to load addresses: ${fetchError.message}`);
        setIsProcessing(false);
        return;
      }

      setExistingAddresses(addresses || []);
      setIsAddressModalOpen(true);
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert('Checkout failed: ' + err.message);
      setIsProcessing(false);
    }
  };

  /**
   * Handle address submission - save new address or use existing one
   * Then validate stock and proceed to payment
   */
  const handleAddressSubmit = async (addressData: AddressFormData | any) => {
    setIsAddressModalOpen(false);
    setIsCartOpen(false);
    setIsProcessing(true);

    try {
      let selectedAddress = addressData;

      // If new address, save it to database
      if (!addressData.id) {
        // Unset other default addresses if this is set as default
        if (addressData.is_default) {
          await supabase
            .from('user_addresses')
            .update({ is_default: false })
            .eq('user_id', user?.id)
            .eq('is_shipping', true);
        }

        // Insert new address
        const insertData = {
          user_id: user?.id,
          label: addressData.label,
          full_name: addressData.full_name,
          phone: addressData.phone,
          address_line1: addressData.address_line1,
          address_line2: addressData.address_line2 || '',
          city: addressData.city,
          state: addressData.state,
          zip: addressData.zip,
          country: addressData.country,
          is_default: addressData.is_default,
          is_shipping: true,
          is_billing: false
        };

        const { data: newAddress, error: insertError } = await supabase
          .from('user_addresses')
          .insert(insertData)
          .select()
          .single();

        if (insertError) {
          console.error('Failed to save address:', insertError);
          alert(`Failed to save address: ${insertError.message}`);
          setIsProcessing(false);
          return;
        }

        selectedAddress = newAddress;
      }

      // Store selected address for order creation
      setCurrentShippingAddress(selectedAddress);

      // Validate stock availability before payment
      for (const item of cart) {
        const { data: stockData, error } = await supabase
          .from('v_store_items_with_stock')
          .select('available_stock, name')
          .eq('id', item.id)
          .single();

        if (error || !stockData || stockData.available_stock < item.quantity) {
          alert(
            `${item.name} doesn't have enough stock!\n\n` +
            `Available: ${stockData?.available_stock || 0}\n` +
            `Requested: ${item.quantity}`
          );
          setIsProcessing(false);
          return;
        }
      }

      // Open payment modal
      setPaymentService('Store Purchase');
      setPaymentAmount(totalPrice);
      setIsPaymentModalOpen(true);
      setIsProcessing(false);

    } catch (err: any) {
      console.error('Checkout error:', err);
      alert('Checkout failed: ' + err.message);
      setIsProcessing(false);
    }
  };

  /**
   * Handle successful payment - create order, reduce inventory, log transaction
   */
  /**
 * Handle successful payment - create order, reduce inventory, log transaction
 */
  const handlePaymentSuccess = async (paymentDetails: any) => {
    setIsPaymentModalOpen(false);
    setIsProcessing(true);

    try {
      if (!currentShippingAddress) {
        throw new Error('No shipping address found');
      }

      // Create order in database
      const orderToInsert = {
        user_id: user?.id,
        total: totalPrice,
        status: 'completed',
        payment_method: paymentDetails?.method || 'manual',
        payment_id: paymentDetails?.transactionId || `TXN-${Date.now()}`,
        razorpay_payment_id: paymentDetails?.transactionId || `TXN-${Date.now()}`,
        razorpay_order_id: paymentDetails?.orderId || `ORD-${Date.now()}`,
        shipping_address_id: currentShippingAddress.id,
        shipping_address_snapshot: {
          full_name: currentShippingAddress.full_name,
          phone: currentShippingAddress.phone,
          address_line1: currentShippingAddress.address_line1,
          address_line2: currentShippingAddress.address_line2,
          city: currentShippingAddress.city,
          state: currentShippingAddress.state,
          zip: currentShippingAddress.zip,
          country: currentShippingAddress.country
        },
        delivery_address: {
          full_name: currentShippingAddress.full_name,
          phone: currentShippingAddress.phone,
          address_line1: currentShippingAddress.address_line1,
          address_line2: currentShippingAddress.address_line2,
          city: currentShippingAddress.city,
          state: currentShippingAddress.state,
          zip: currentShippingAddress.zip,
          country: currentShippingAddress.country
        },
        item_ids: cart.map(item => item.id),
        order_items: cart.map(item => ({
          item_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          sku: item.sku || ''
        }))
      };

      const { data: orderData, error: orderError } = await supabase
        .from('store_orders')
        .insert(orderToInsert)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation failed:', orderError);
        throw orderError;
      }

      // Reduce inventory for each item using RPC function
      for (const item of cart) {
        const { data: rpcData, error: inventoryError } = await supabase.rpc(
          'reduce_inventory',
          {
            p_item_id: item.id,
            p_quantity: item.quantity
          }
        );

        if (inventoryError) {
          console.error(`Inventory reduction failed for ${item.name}:`, inventoryError);
        } else if (rpcData && !rpcData.success) {
          console.error(`Inventory reduction unsuccessful for ${item.name}:`, rpcData.error);
        }
      }

      // Record transaction for financial tracking
      await dbService.recordTransaction({
        user_id: user?.id,
        service_type: 'store_purchase',
        service_title: `Store Order #${orderData.id}`,
        amount: totalPrice,
        currency: 'INR',
        payment_method: paymentDetails?.method || 'manual',
        payment_provider: paymentDetails?.provider || 'manual',
        order_id: paymentDetails?.orderId || `ORD-${Date.now()}`,
        transaction_id: paymentDetails?.transactionId || `TXN-${Date.now()}`,
        status: 'success',
        metadata: {
          order_id: orderData.id,
          shipping_address: currentShippingAddress,
          items: cart.map(i => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity,
            price: i.price
          }))
        }
      });

      // Clear cart after successful order
      clearCart();

      // Refresh inventory display
      const { data: refreshed } = await supabase
        .from('v_store_items_with_stock')
        .select('*')
        .order('name');

      if (refreshed) {
        setItems(refreshed);
      }

      // Navigate to order confirmation page
      navigate(`/order-confirmation/${orderData.id}`, {
        state: {
          orderData,
          shippingAddress: currentShippingAddress
        }
      });

    } catch (err: any) {
      console.error('Order processing failed:', err);
      alert(
        '❌ Order failed: ' + err.message + '\n\n' +
        'Please contact support if payment was deducted.'
      );
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground p-6 transition-colors duration-500">
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed top-20 right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-2xl transition-all active:scale-95"
        aria-label="Open shopping cart"
      >
        <ShoppingCart size={24} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {cartCount}
          </span>
        )}
      </button>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <SmartBackButton className="mb-4" />
        <h1 className="text-4xl font-cinzel font-black text-foreground mb-2 uppercase tracking-widest">
          Mystic Bazaar
        </h1>
        <p className="text-foreground/70 text-sm font-lora italic">
          Authentic spiritual artifacts & tools for your journey.
        </p>
      </div>

      {/* Category Filters & Search Bar */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row gap-6 items-center">
        {/* Category Buttons */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar w-full md:w-auto">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setPage(0);
            }}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-card-foreground border-border hover:bg-muted'
              }`}
          >
            ✨ All Items
          </button>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedCategory(key);
                setPage(0);
              }}
              className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-card-foreground border-border hover:bg-muted'
                }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search artifacts..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="w-full bg-card border border-border rounded-full px-6 py-2 text-sm focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground italic font-lora">
          No items found in this category of the Bazaar.
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.02] flex flex-col h-full group"
            >
              {/* Product Image */}
              <div className="relative h-56 overflow-hidden">
                <OptimizedImage
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Stock Status Badge */}
                <div
                  className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl ${item.stock_status === 'out_of_stock'
                    ? 'bg-red-600 text-white'
                    : item.stock_status === 'low_stock'
                      ? 'bg-amber-500 text-black'
                      : 'bg-green-600 text-white'
                    }`}
                >
                  {item.stock_status === 'out_of_stock'
                    ? 'Out of Stock'
                    : item.stock_status === 'low_stock'
                      ? `Only ${item.available_stock} left!`
                      : 'In Stock'}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-4">
                  <div className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">
                    {(CATEGORIES as any)[item.category]?.name || item.category}
                  </div>
                  <h3 className="text-card-foreground font-cinzel font-bold text-lg mb-2 line-clamp-2 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-muted-foreground text-xs font-lora italic line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Price & Add to Cart */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-2xl font-black text-foreground font-mono">
                      {getRegionalPrice(item.price).display}
                    </span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock_status === 'out_of_stock'}
                      className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg ${item.stock_status === 'out_of_stock'
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        }`}
                    >
                      {item.stock_status === 'out_of_stock' ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>

                  {/* SKU & Authenticity Badge */}
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest pt-3 border-t border-border/50">
                    <span>SKU: {item.sku}</span>
                    <span className="text-primary/50">✦ AUTHENTIC</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shopping Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          ></div>

          <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-black border-2 border-purple-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Cart Header */}
            <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
              <div className="flex items-center gap-3">
                <ShoppingCart className="text-purple-400" size={28} />
                <h2 className="text-2xl font-bold text-white font-cinzel">
                  Your Cart ({cartCount})
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-purple-500/20 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="overflow-y-auto max-h-[50vh] p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="mx-auto text-purple-400/30" size={64} />
                  <p className="text-purple-300 mt-4 text-lg">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-black/40 rounded-xl border border-purple-500/20"
                    >
                      {/* Item Image */}
                      {item.image && (
                        <div className="w-20 h-20 flex-shrink-0">
                          <OptimizedImage
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                            containerClassName="w-full h-full"
                            showSkeleton={true}
                            fallbackSrc="https://via.placeholder.com/80x80?text=No+Image"
                          />
                        </div>
                      )}

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{item.name}</h3>
                        <p className="text-purple-300 text-sm">₹{item.price}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 bg-purple-600 hover:bg-purple-700 rounded"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} className="text-white" />
                          </button>
                          <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => {
                              const maxStock = (item as any).maxStock || 999;
                              if (item.quantity < maxStock) {
                                updateQuantity(item.id, item.quantity + 1);
                              } else {
                                alert(`Maximum stock available: ${maxStock}`);
                              }
                            }}
                            className="p-1 bg-purple-600 hover:bg-purple-700 rounded"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} className="text-white" />
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors self-start"
                        aria-label="Remove from cart"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer - Total & Actions */}
            {cart.length > 0 && (
              <div className="border-t border-purple-500/30 p-6 space-y-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-purple-300">Total:</span>
                  <span className="text-white">₹{totalPrice}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Checkout'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setIsProcessing(false);
        }}
        onSubmit={handleAddressSubmit}
        existingAddresses={existingAddresses}
      />

      {/* Payment Modal */}
      <PaymentModal
        isVisible={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setIsProcessing(false);
        }}
        onSuccess={handlePaymentSuccess}
        basePrice={paymentAmount}
        serviceName={paymentService}
      />
    </div>
  );
};

export default Store;

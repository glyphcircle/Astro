
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDb } from '../hooks/useDb';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { usePayment } from '../context/PaymentContext';
import Card from './shared/Card';
import Button from './shared/Button';
import Modal from './shared/Modal';
import { cloudManager } from '../services/cloudManager';
import OptimizedImage from './shared/OptimizedImage';
import { useNotifications } from './PushNotifications';

interface CartItem {
  id: number | string; // maps to store_item_id
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock?: number;
}

interface DeliveryDetails {
  fullName: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
}

const Store: React.FC = () => {
  const { db, toggleStatus, createEntry, updateEntry } = useDb();
  const { user } = useAuth();
  const { t, getRegionalPrice } = useTranslation();
  const { openPayment } = usePayment();
  const { sendNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sortOption, setSortOption] = useState('default');
  
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address'>('cart');
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
      fullName: user?.name || '', address: '', city: '', zip: '', phone: ''
  });
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isAdmin = user?.role === 'admin';

  const categories: string[] = ['All', ...Array.from(new Set((db.store_items || []).map((i: any) => i.category || 'General'))) as string[]];

  const filteredItems = useMemo(() => {
    let items = db.store_items || [];
    if (!isAdmin) items = items.filter((i: any) => i.status === 'active');
    if (searchQuery) items = items.filter((i: any) => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || (i.category || '').toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory !== 'All') items = items.filter((i: any) => i.category === selectedCategory);
    if (sortOption === 'price_asc') items = [...items].sort((a: any, b: any) => a.price - b.price);
    else if (sortOption === 'price_desc') items = [...items].sort((a: any, b: any) => b.price - a.price);
    return items;
  }, [db.store_items, isAdmin, searchQuery, selectedCategory, sortOption]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isAddressValid = useMemo(() => Object.values(deliveryDetails).every((val: any) => val.trim().length > 0), [deliveryDetails]);

  const addToCart = (item: any) => {
    const sId = item.store_item_id || item.id; // Correct ID mapping for new view
    setCart(prev => {
      const existing = prev.find(i => i.id === sId);
      
      if (existing && existing.quantity >= (item.stock || 999)) {
          setToastMessage(`Max stock reached for ${item.name}`);
          setTimeout(() => setToastMessage(null), 3000);
          return prev;
      }
      
      if (existing) return prev.map(i => i.id === sId ? { ...i, quantity: i.quantity + 1 } : i);
      
      const img = cloudManager.resolveImage(item.image_path || item.image_url);
      return [...prev, { 
        id: sId, 
        serviceId: item.id, 
        name: item.name, 
        price: item.store_price || item.price, 
        quantity: 1, 
        image: img, 
        stock: item.stock 
      }];
    });
    
    if (navigator.vibrate) navigator.vibrate(50);
    setToastMessage(`${item.name} added to cart ✨`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const removeFromCart = (itemId: number | string) => setCart(prev => prev.filter(i => i.id !== itemId));
  const updateQuantity = (itemId: number | string, delta: number) => setCart(prev => prev.map(i => {
      if (i.id !== itemId) return i;
      const newQty = i.quantity + delta;
      if (newQty > (i.stock || 999)) return i;
      return { ...i, quantity: Math.max(1, newQty) };
  }));
  
  const openCart = () => { setCheckoutStep('cart'); setIsCartOpen(true); };
  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { name, value } = e.target; setDeliveryDetails(prev => ({ ...prev, [name]: value })); };

  const handleCheckout = () => {
      if (!isAddressValid) return alert("Please fill in all delivery details.");
      const currentCart = [...cart];

      openPayment(async () => {
          const orderPayload = {
              user_id: user?.id || 'guest',
              item_ids: JSON.stringify(currentCart.map(c => ({ id: c.id, qty: c.quantity }))),
              total: cartTotal,
              description: `Store Order: ${currentCart.length} items`,
              delivery_address: JSON.stringify(deliveryDetails),
              status: 'paid'
          };
          await createEntry('store_orders', orderPayload);

          // Inventory sync using store_item_id
          for (const item of currentCart) {
              const dbItem = db.store_items.find((i:any) => (i.store_item_id || i.id) === item.id);
              if (dbItem) {
                  const newStock = Math.max(0, (dbItem.stock || 0) - item.quantity);
                  await updateEntry('store_items', dbItem.id, { stock: newStock });
                  
                  if (newStock < 5) {
                      sendNotification("⚠️ Low Stock Alert", `${item.name} is running low (${newStock} left).`);
                  }
              }
          }

          setCart([]);
          setIsCartOpen(false);
          setCheckoutStep('cart'); 
          alert("Payment Successful! Shipping to " + deliveryDetails.city);
      }, 'Vedic Store Order', cartTotal);
  };

  const getImageUrl = (item: any) => item.image_path || item.image_url || `https://images.unsplash.com/photo-1600609842388-3e4b489d71c6?auto=format&fit=crop&w=400&q=80`;

  return (
    <div className="min-h-screen pb-20 relative">
      <button onClick={() => navigate('/home')} className="fixed top-20 left-4 z-30 bg-black/60 backdrop-blur border border-amber-500/30 text-amber-200 p-2 rounded-full shadow-lg md:hidden" title="Back to Home"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
      {toastMessage && (<div className="fixed bottom-24 right-4 md:top-24 md:bottom-auto z-50 bg-green-900/90 text-white px-6 py-3 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] border border-green-500/50 flex items-center gap-3 animate-fade-in-up"><span className="text-xl">🛍️</span><span className="font-cinzel font-bold text-sm">{toastMessage}</span></div>)}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 pt-4 md:pt-0">
        <div>
            <Link to="/home" className="inline-flex items-center text-amber-200 hover:text-amber-400 transition-colors mb-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>{t('backToHome')}</Link>
            <h2 className="text-3xl font-cinzel font-bold text-amber-300">Mystic Bazaar</h2>
            <p className="text-amber-200/60 font-lora text-sm">Authentic spiritual artifacts & variants.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
                <input 
                    type="text" 
                    placeholder="Search Artifacts..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full md:w-64 bg-black/40 border border-amber-500/30 rounded-full py-2 px-4 text-amber-100 focus:outline-none focus:border-amber-400 shadow-inner" 
                />
            </div>
            <button onClick={openCart} className="relative bg-amber-600 hover:bg-amber-500 p-2.5 rounded-full text-white shadow-lg transition-all hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black animate-pulse">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
            </button>
        </div>
      </div>

      {filteredItems.length === 0 ? <div className="text-center py-16 text-amber-200/40 italic font-lora">No artifacts detected in this realm.</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item: any) => (
                  <div key={item.store_item_id || item.id} className="group bg-gray-900 border border-amber-500/10 rounded-2xl overflow-hidden hover:border-amber-500/40 hover:shadow-2xl transition-all duration-500 flex flex-col">
                      <div className="h-52 overflow-hidden relative">
                          <OptimizedImage src={getImageUrl(item)} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                          {item.stock < 5 && <span className="absolute bottom-2 right-2 bg-red-900/80 text-white text-[9px] font-bold px-2 py-1 rounded">LOW STOCK: {item.stock}</span>}
                      </div>
                      <div className="p-5 flex flex-col flex-grow bg-[#0c0c1a]">
                          <div className="flex justify-between items-start mb-3">
                              <h3 className="font-cinzel font-bold text-amber-100 leading-tight pr-2">{item.name}</h3>
                              <span className="font-mono font-bold text-amber-400 shrink-0">{getRegionalPrice(item.store_price || item.price).display}</span>
                          </div>
                          <p className="text-xs text-gray-400 font-lora mb-6 line-clamp-2 italic leading-relaxed">{item.description || "A sacred tool for spiritual alignment."}</p>
                          <Button onClick={() => addToCart(item)} disabled={item.stock <= 0} className="w-full mt-auto py-2.5 bg-gradient-to-r from-amber-700 to-amber-900 border-none shadow-xl hover:brightness-110">
                              {item.stock > 0 ? "ADD TO CART" : "OUT OF STOCK"}
                          </Button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      <Modal isVisible={isCartOpen} onClose={() => setIsCartOpen(false)}>
          <div className="p-8 bg-[#0a0a1a] border border-amber-500/30 rounded-3xl max-h-[85vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                  <h3 className="text-2xl font-cinzel font-black text-amber-400 uppercase tracking-widest">{checkoutStep === 'cart' ? 'Vessel Contents' : 'Shipping Seal'}</h3>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-white text-2xl">&times;</button>
              </div>
              <div className="flex-grow overflow-y-auto mb-6 pr-2 custom-scrollbar">
                  {checkoutStep === 'cart' ? (cart.length === 0 ? <p className="text-center text-gray-600 font-lora italic py-12">Your spiritual vessel is empty.</p> : (
                      <div className="space-y-4">
                          {cart.map(item => (
                              <div key={item.id} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5 group">
                                  <img src={item.image} className="w-16 h-16 object-cover rounded-lg border border-white/10" alt={item.name} />
                                  <div className="flex-grow">
                                      <h4 className="font-bold text-amber-100 text-sm">{item.name}</h4>
                                      <p className="text-xs text-amber-500/60 font-mono">{getRegionalPrice(item.price).display}</p>
                                  </div>
                                  <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-xl border border-white/5">
                                      <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-lg bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors">-</button>
                                      <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                                      <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-lg bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors">+</button>
                                  </div>
                                  <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-400 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                              </div>
                          ))}
                      </div>
                  )) : (
                      <div className="space-y-5 animate-fade-in-up">
                          {['fullName', 'address', 'city', 'zip', 'phone'].map(field => (
                              <div key={field}>
                                  <label className="block text-[10px] text-gray-500 uppercase font-black mb-1.5 ml-1 tracking-widest">{field.replace(/([A-Z])/g, ' $1')}</label>
                                  <input 
                                    name={field} 
                                    value={(deliveryDetails as any)[field]} 
                                    onChange={handleDeliveryChange} 
                                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-500 transition-all shadow-inner" 
                                  />
                              </div>
                          ))}
                      </div>
                  )}
              </div>
              <div className="border-t border-white/5 pt-6">
                  <div className="flex justify-between items-center mb-6 text-xl font-cinzel font-black text-amber-100">
                      <span className="text-gray-500 text-xs tracking-[0.3em] uppercase">Total Exchange</span>
                      <span>{getRegionalPrice(cartTotal).display}</span>
                  </div>
                  {checkoutStep === 'cart' ? (
                      <Button className="w-full py-4 bg-gradient-to-r from-amber-700 to-amber-900 shadow-2xl" disabled={cart.length === 0} onClick={() => setCheckoutStep('address')}>CONTINUE TO SHIPPING</Button>
                  ) : (
                      <Button className="w-full py-4 bg-gradient-to-r from-green-700 to-green-900 shadow-2xl" disabled={!isAddressValid} onClick={handleCheckout}>AUTHORIZE PAYMENT</Button>
                  )}
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default Store;


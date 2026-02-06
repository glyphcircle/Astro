import React, { useState, useEffect, useMemo } from 'react';
import { useDb } from '../hooks/useDb';
import { supabase } from '../services/supabaseClient';
import { useTranslation } from '../hooks/useTranslation';
import Card from './shared/Card';
import SmartBackButton from './shared/SmartBackButton';
import OptimizedImage from './shared/OptimizedImage';
import { StoreItemWithStock } from '../services/db';

const CATEGORIES = {
  crystals: { name: 'Crystals & Gemstones', icon: '💎', color: 'purple' },
  'spiritual-tools': { name: 'Spiritual Tools', icon: '🕉️', color: 'amber' },
  books: { name: 'Books & Learning', icon: '📚', color: 'blue' },
  remedies: { name: 'Remedies & Rituals', icon: '🔱', color: 'red' },
  meditation: { name: 'Meditation & Yoga', icon: '🧘', color: 'green' }
};

const ITEMS_PER_PAGE = 20;

const Store: React.FC = () => {
  const { db } = useDb();
  const { getRegionalPrice } = useTranslation();
  const [items, setItems] = useState<StoreItemWithStock[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('v_store_items_with_stock')
          .select('*', { count: 'exact' });

        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }

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

  return (
    <div className="min-h-screen bg-background text-foreground p-6 transition-colors duration-500">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <SmartBackButton className="mb-4" />
        <h1 className="text-4xl font-cinzel font-black text-foreground mb-2 uppercase tracking-widest">
          Mystic Bazaar
        </h1>
        <p className="text-foreground/70 text-sm font-lora italic">Authentic spiritual artifacts & tools for your journey.</p>
      </div>
      
      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar w-full md:w-auto">
          <button
            onClick={() => { setSelectedCategory('all'); setPage(0); }}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-card-foreground border-border hover:bg-muted'
            }`}
          >
            ✨ All Items
          </button>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => { setSelectedCategory(key); setPage(0); }}
              className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                selectedCategory === key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-card-foreground border-border hover:bg-muted'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input 
            type="text"
            placeholder="Search artifacts..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            className="w-full bg-card border border-border rounded-full px-6 py-2 text-sm focus:border-primary outline-none"
          />
        </div>
      </div>
      
      {/* Items Grid */}
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
          {items.map(item => (
            <div 
              key={item.id}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.02] flex flex-col h-full group"
            >
              <div className="relative h-56 overflow-hidden">
                <OptimizedImage 
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Optimized Stock Status Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl ${
                  item.stock_status === 'out_of_stock' ? 'bg-red-600 text-white' : 
                  item.stock_status === 'low_stock' ? 'bg-amber-500 text-black' : 
                  'bg-green-600 text-white'
                }`}>
                  {item.stock_status === 'out_of_stock' ? 'Out of Stock' :
                   item.stock_status === 'low_stock' ? `Only ${item.available_stock} left!` :
                   'In Stock'}
                </div>
              </div>
              
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
                
                <div className="mt-auto">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-2xl font-black text-foreground font-mono">
                      {getRegionalPrice(item.price).display}
                    </span>
                    <button 
                        disabled={item.stock_status === 'out_of_stock'}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg ${
                            item.stock_status === 'out_of_stock' 
                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        }`}
                    >
                      {item.stock_status === 'out_of_stock' ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                  
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
    </div>
  );
};

export default Store;
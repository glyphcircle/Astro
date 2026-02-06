import React, { useState, useEffect, useMemo } from 'react';
import { useDb } from '../hooks/useDb';
import { dbService } from '../services/db';
import { useTranslation } from '../hooks/useTranslation';
import Card from './shared/Card';
import SmartBackButton from './shared/SmartBackButton';

const CATEGORIES = {
  crystals: { name: 'Crystals & Gemstones', icon: '💎', color: 'purple' },
  'spiritual-tools': { name: 'Spiritual Tools', icon: '🕉️', color: 'amber' },
  books: { name: 'Books & Learning', icon: '📚', color: 'blue' },
  remedies: { name: 'Remedies & Rituals', icon: '🔱', color: 'red' },
  meditation: { name: 'Meditation & Yoga', icon: '🧘', color: 'green' }
};

const Store: React.FC = () => {
  const { db } = useDb();
  const { getRegionalPrice } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const data = await dbService.getAll('store_items');
        setItems(data || []);
      } catch (err) {
        console.error('Failed to fetch items:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    const activeItems = items.filter(item => item.status === 'active');
    if (selectedCategory === 'all') return activeItems;
    return activeItems.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

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
      
      {/* Category Filter */}
      <div className="max-w-7xl mx-auto mb-8 flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
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
            onClick={() => setSelectedCategory(key)}
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
      
      {/* Items Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground italic font-lora">
          No items found in this category of the Bazaar.
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map(item => (
            <div 
              key={item.id}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl transition-all hover:scale-[1.02] flex flex-col h-full group"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={item.image_url || 'https://images.unsplash.com/photo-1600609842388-3e4b489d71c6?q=80&w=400'}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg">
                      Add to Cart
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest pt-3 border-t border-border/50">
                    <span>Stock: {item.stock > 0 ? item.stock : 'Sold Out'}</span>
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
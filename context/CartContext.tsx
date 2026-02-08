// context/CartContext.tsx

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    category?: string;
    sku?: string;
    maxStock?: number;
}

interface CartContextType {
    cart: CartItem[];
    cartCount: number;
    totalPrice: number;
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        // Load cart from localStorage on init
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('mystic-bazaar-cart');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    return [];
                }
            }
        }
        return [];
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('mystic-bazaar-cart', JSON.stringify(cart));
        }
    }, [cart]);

    const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                // Check max stock if available
                const maxStock = item.maxStock || 999;
                if (existing.quantity >= maxStock) {
                    alert(`Maximum stock available: ${maxStock}`);
                    return prev;
                }
                return prev.map(i => 
                    i.id === item.id 
                        ? { ...i, quantity: i.quantity + 1 } 
                        : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setCart(prev => prev.map(item => 
            item.id === id ? { ...item, quantity } : item
        ));
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setCart([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('mystic-bazaar-cart');
        }
    }, []);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cart,
            cartCount,
            totalPrice,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

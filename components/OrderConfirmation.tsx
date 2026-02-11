/**
 * Order Confirmation Page
 * Displays order details after successful purchase
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Package, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import Card from './shared/Card';

const OrderConfirmation: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [orderData, setOrderData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            // First try to get from navigation state
            if (location.state?.orderData) {
                setOrderData(location.state.orderData);
                setIsLoading(false);
                return;
            }

            // Otherwise fetch from database
            try {
                const { data, error } = await supabase
                    .from('store_orders')
                    .select('*')
                    .eq('id', orderId)
                    .eq('user_id', user?.id)
                    .single();

                if (error) throw error;
                setOrderData(data);
            } catch (err) {
                console.error('Failed to fetch order:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId, user?.id, location.state]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen bg-background text-foreground p-6">
                <div className="max-w-2xl mx-auto text-center py-20">
                    <Package className="mx-auto text-muted-foreground mb-4" size={64} />
                    <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
                    <button
                        onClick={() => navigate('/store')}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold"
                    >
                        Return to Store
                    </button>
                </div>
            </div>
        );
    }

    const shippingAddress = location.state?.shippingAddress || orderData.shipping_address_snapshot;

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-3xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-10 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                        <CheckCircle className="text-green-500" size={48} />
                    </div>
                    <h1 className="text-4xl font-cinzel font-black mb-2">Order Confirmed!</h1>
                    <p className="text-muted-foreground text-lg">
                        Your order has been placed successfully
                    </p>
                </div>

                {/* Order Summary Card */}
                <Card className="p-8 mb-6">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                            <p className="font-mono font-bold text-lg">{orderData.id}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                            <p className="font-semibold">
                                {new Date(orderData.created_at).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Package size={20} className="text-primary" />
                            <h2 className="font-bold text-lg">Items Ordered</h2>
                        </div>
                        <div className="space-y-3">
                            {orderData.order_items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold">₹{item.price}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {shippingAddress && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin size={20} className="text-primary" />
                                <h2 className="font-bold text-lg">Shipping Address</h2>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="font-semibold">{shippingAddress.full_name}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {shippingAddress.address_line1}
                                    {shippingAddress.address_line2 && `, ${shippingAddress.address_line2}`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                                </p>
                                <p className="text-sm text-muted-foreground">{shippingAddress.country}</p>
                                <p className="text-sm text-muted-foreground mt-2">📱 {shippingAddress.phone}</p>
                            </div>
                        </div>
                    )}

                    {/* Payment Details */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard size={20} className="text-primary" />
                            <h2 className="font-bold text-lg">Payment Details</h2>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Payment Method</span>
                                <span className="font-semibold capitalize">{orderData.payment_method}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Transaction ID</span>
                                <span className="font-mono text-sm">{orderData.payment_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-bold">
                                    {orderData.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="pt-6 border-t border-border">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">Total Amount</span>
                            <span className="text-3xl font-black text-primary">₹{orderData.total}</span>
                        </div>
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate('/store')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-card border border-border rounded-xl font-bold hover:bg-muted transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Continue Shopping
                    </button>
                    <button
                        onClick={() => navigate('/transactions')}
                        className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors"
                    >
                        View All Transactions
                    </button>
                </div>

                {/* Info Message */}
                <Card className="mt-6 p-6 bg-blue-500/10 border-blue-500/30">
                    <p className="text-sm text-center">
                        📧 A confirmation email has been sent to your registered email address.
                        <br />
                        Your order will be delivered within 5-7 business days.
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default OrderConfirmation;

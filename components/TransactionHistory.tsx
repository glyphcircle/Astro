import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import SmartBackButton from './shared/SmartBackButton';
import Card from './shared/Card';

interface Transaction {
    id: string;
    created_at: string;
    service_type: string;
    service_title: string;
    amount: number;
    currency: string;
    payment_method: string;
    status: string;
    transaction_id: string;
}

const TransactionHistory: React.FC = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user?.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setTransactions(data || []);
            } catch (err) {
                console.error('Failed to fetch transactions:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.id) {
            fetchTransactions();
        }
    }, [user?.id]);

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-4xl mx-auto">
                <SmartBackButton className="mb-4" />

                <h1 className="text-3xl font-cinzel font-black mb-6">Transaction History</h1>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <Card className="text-center py-12">
                        <p className="text-muted-foreground">No transactions yet</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((txn) => (
                            <Card key={txn.id} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{txn.service_title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(txn.created_at).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">₹{txn.amount}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${txn.status === 'success'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {txn.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-sm space-y-1 text-muted-foreground border-t pt-4">
                                    <p><span className="font-semibold">Transaction ID:</span> {txn.transaction_id}</p>
                                    <p><span className="font-semibold">Payment Method:</span> {txn.payment_method}</p>
                                    <p><span className="font-semibold">Type:</span> {txn.service_type}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionHistory;

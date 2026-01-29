import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CreditCard, CheckCircle, XCircle, Clock, Package, ShieldCheck, Wallet } from 'lucide-react';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    const fetchData = async () => {
        try {
            const [ordRes, pmRes] = await Promise.all([
                axios.get('http://localhost:8000/orders', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8000/payment-methods', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setOrders(ordRes.data);
            setPaymentMethods(pmRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleAction = async (orderId, action) => {
        try {
            await axios.post(`http://localhost:8000/orders/${orderId}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (e) {
            alert(e.response?.data?.detail || `Failed to ${action}`);
        }
    };

    const updatePayment = async (pmId) => {
        const newType = prompt('Enter new payment type (e.g., CREDIT_CARD, UPI, BITCOIN):');
        if (!newType) return;

        try {
            await axios.put(`http://localhost:8000/payment-methods/${pmId}`, { type: newType }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (e) {
            alert(e.response?.data?.detail || 'Failed to update payment method');
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'COMPLETED': return { icon: <CheckCircle size={18} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'CANCELLED': return { icon: <XCircle size={18} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
            default: return { icon: <Clock size={18} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
        }
    };

    const canEditPayment = user?.role === 'ADMIN';
    const canCheckout = ['ADMIN', 'MANAGER'].includes(user?.role);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <span>Synchronizing Orders...</span>
            </div>
        </div>
    );

    return (
        <div className="container">
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ marginBottom: '0.25rem' }}>Order Control Center</h1>
                <p className="muted">Manage your gourmet orders and secure payment protocols</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '3rem' }}>
                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <Package size={24} color="var(--primary)" />
                        Recent Missions
                    </h2>

                    {orders.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                            <Package size={48} style={{ marginBottom: '1rem', margin: '0 auto' }} />
                            <p>No active orders in the database.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {orders.map(order => {
                                const styles = getStatusStyles(order.status);
                                return (
                                    <div key={order.id} className="card" style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ padding: '0.5rem 1rem', background: styles.bg, color: styles.color, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
                                                    {styles.icon}
                                                    {order.status}
                                                </div>
                                                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Order #{order.id}</span>
                                                <span className={`badge badge-${order.country.toLowerCase()}`}>{order.country}</span>
                                            </div>
                                            <span className="muted" style={{ fontSize: '0.9rem' }}>Regional Authority: {order.country}</span>
                                        </div>

                                        <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.15)', borderRadius: '15px', padding: '1.25rem' }}>
                                            {order.items.map(item => (
                                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                                    <span>{item.menu_item.name} <span className="muted" style={{ fontSize: '0.8rem' }}>x{item.quantity}</span></span>
                                                    <span style={{ fontWeight: 600 }}>${(item.menu_item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <hr style={{ margin: '0.75rem 0', borderColor: 'rgba(255,255,255,0.05)' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                                                <span>Total</span>
                                                <span style={{ color: 'var(--primary)' }}>
                                                    ${order.items.reduce((sum, item) => sum + (item.menu_item.price * item.quantity), 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {order.status === 'PENDING' && (
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button
                                                    onClick={() => handleAction(order.id, 'checkout')}
                                                    className={`btn ${canCheckout ? 'btn-primary' : 'btn-disabled'}`}
                                                    disabled={!canCheckout}
                                                    style={{ flex: 1 }}
                                                >
                                                    <ShieldCheck size={18} />
                                                    Process Payment
                                                </button>
                                                <button
                                                    onClick={() => handleAction(order.id, 'cancel')}
                                                    className={`btn ${canCheckout ? 'btn-danger' : 'btn-disabled'}`}
                                                    disabled={!canCheckout}
                                                    style={{ flex: 1 }}
                                                >
                                                    <XCircle size={18} />
                                                    Abort Order
                                                </button>
                                            </div>
                                        )}
                                        {!canCheckout && order.status === 'PENDING' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem', borderRadius: '10px', marginTop: '1rem', color: '#ef4444', fontSize: '0.85rem' }}>
                                                <XCircle size={14} />
                                                <span>Your current clearance (MEMBER) is insufficient for transaction authorization.</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <Wallet size={24} color="var(--primary)" />
                        Secure Payments
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {paymentMethods.map(pm => (
                            <div key={pm.id} className="card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)' }}>
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{pm.type}</h4>
                                            <span className="muted" style={{ fontSize: '0.8rem' }}>Protocol ID: {pm.id}</span>
                                        </div>
                                    </div>
                                    {canEditPayment ? (
                                        <button onClick={() => updatePayment(pm.id)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                            Reconfigure
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                            <ShieldCheck size={14} />
                                            SECURED
                                        </div>
                                    )}
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span className="muted">Assigned User</span>
                                        <span style={{ fontWeight: 600 }}>UID-{pm.user_id}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="muted">Encryption</span>
                                        <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>AES-256-GCM</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!canEditPayment && (
                            <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <p>Transaction methods are locked for non-administrative entities. Contact Fury for modification requests.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;

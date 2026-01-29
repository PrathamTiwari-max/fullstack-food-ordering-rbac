import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Minus, ShoppingCart, ArrowLeft, Star, Coffee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [cart, setCart] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/restaurants/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRestaurant(res.data);
            } catch (e) {
                setError('Unauthorized to view this restaurant or restaurant not found');
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurant();
    }, [id, token]);

    const updateCart = (itemId, delta) => {
        setCart(prev => {
            const newQty = (prev[itemId] || 0) + delta;
            if (newQty <= 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: newQty };
        });
    };

    const placeOrder = async () => {
        const items = Object.entries(cart).map(([menu_item_id, quantity]) => ({
            menu_item_id: parseInt(menu_item_id),
            quantity
        }));

        try {
            await axios.post('http://localhost:8000/orders', { items }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Using a more modern-feeling notification if possible, but keep it simple
            alert('Order Placed Successfully!');
            navigate('/orders');
        } catch (e) {
            alert(e.response?.data?.detail || 'Failed to place order');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span>Curating Menu...</span>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto', borderLeft: '4px solid #ef4444' }}>
                <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
                <p className="muted">{error}</p>
                <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
            </div>
        </div>
    );

    return (
        <div className="container">
            <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '2.5rem' }}>
                <ArrowLeft size={18} /> <span>Back to Selection</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
                <div>
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <h1 style={{ margin: 0 }}>{restaurant.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                                <Star size={14} fill="#f59e0b" />
                                <span>4.9</span>
                            </div>
                        </div>
                        <span className={`badge badge-${restaurant.country.toLowerCase()}`}>{restaurant.country} Collection</span>
                    </div>

                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                        <Coffee size={24} color="var(--primary)" />
                        Menu Items
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {restaurant.menu_items.map(item => (
                            <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{item.name}</h3>
                                    <p style={{ color: 'var(--primary)', fontWeight: 700, margin: '0.2rem 0', fontSize: '1.1rem' }}>${item.price.toFixed(2)}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <button
                                        onClick={() => updateCart(item.id, -1)}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.4rem', border: 'none', background: cart[item.id] ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                                        disabled={!cart[item.id]}
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span style={{ fontWeight: 800, minWidth: '1.5rem', textAlign: 'center', fontSize: '1.1rem' }}>{cart[item.id] || 0}</span>
                                    <button
                                        onClick={() => updateCart(item.id, 1)}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.4rem', border: 'none', background: 'rgba(255,255,255,0.05)' }}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ position: 'sticky', top: '100px', borderTop: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '10px' }}>
                            <ShoppingCart size={20} color="white" />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Your Basket</h2>
                    </div>

                    {Object.keys(cart).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.5 }}>
                            <ShoppingCart size={40} style={{ marginBottom: '1rem' }} />
                            <p>Select items to start your feast</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
                                {Object.entries(cart).map(([id, qty]) => {
                                    const item = restaurant.menu_items.find(mi => mi.id === parseInt(id));
                                    return (
                                        <div key={id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.95rem', animation: 'fadeIn 0.3s ease-out' }}>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {qty}</div>
                                            </div>
                                            <span style={{ fontWeight: 500 }}>${(item.price * qty).toFixed(2)}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span>Subtotal</span>
                                    <span>
                                        ${Object.entries(cart).reduce((sum, [id, qty]) => {
                                            const item = restaurant.menu_items.find(mi => mi.id === parseInt(id));
                                            return sum + (item.price * qty);
                                        }, 0).toFixed(2)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    <span>Delivery Fee</span>
                                    <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>FREE</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.25rem' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--text-main)' }}>
                                        ${Object.entries(cart).reduce((sum, [id, qty]) => {
                                            const item = restaurant.menu_items.find(mi => mi.id === parseInt(id));
                                            return sum + (item.price * qty);
                                        }, 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1.1rem', marginTop: '1.5rem', fontSize: '1rem' }}
                                onClick={placeOrder}
                            >
                                <ShoppingCart size={20} />
                                Confirm Order
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetail;

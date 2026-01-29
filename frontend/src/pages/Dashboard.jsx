import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Utensils, ArrowRight, MapPin, List } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [restaurants, setRestaurants] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const res = await axios.get('http://localhost:8000/restaurants', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRestaurants(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchRestaurants();
    }, [token]);

    return (
        <div className="container">
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ marginBottom: '0.25rem' }}>Available Restaurants</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <MapPin size={16} />
                    <span>Showing exclusive results for your country</span>
                </div>
            </header>

            <div className="grid">
                {restaurants.map(r => (
                    <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        {/* Decorative background element */}
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, color: 'var(--primary)' }}>
                            <Utensils size={100} />
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.6rem', borderRadius: '12px' }}>
                                    <Utensils size={24} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0 }}>{r.name}</h3>
                                    <span className={`badge badge-${r.country.toLowerCase()}`} style={{ marginTop: '0.4rem', display: 'inline-block' }}>{r.country}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <List size={16} />
                                <span>{r.menu_items.length} premium items available</span>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                            <Link to={`/restaurant/${r.id}`} className="btn btn-primary" style={{ borderRadius: '14px', width: '100%', padding: '0.8rem' }}>
                                <span>Browse Menu</span>
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {restaurants.length === 0 && (
                <div style={{ textAlign: 'center', padding: '5rem 0', opacity: 0.5 }}>
                    <Utensils size={64} style={{ marginBottom: '1rem' }} />
                    <h3>No restaurants found in your region.</h3>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

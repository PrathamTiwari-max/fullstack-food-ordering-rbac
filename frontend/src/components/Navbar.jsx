import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ShoppingBag, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav>
            <Link to="/" style={{ textDecoration: 'none' }} className="nav-logo">
                <Shield size={28} />
                <span>Avengers Food</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {user && (
                    <>
                        <Link to="/orders" style={{ textDecoration: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, fontSize: '0.95rem' }}>
                            <ShoppingBag size={20} className="text-primary" style={{ color: 'var(--primary)' }} />
                            <span>Orders</span>
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ background: 'var(--primary)', padding: '0.4rem', borderRadius: '8px' }}>
                                    <UserIcon size={16} color="white" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</span>
                                </div>
                            </div>
                            <span className={`badge badge-${user.country.toLowerCase()}`}>{user.country}</span>
                        </div>
                        <button onClick={logout} className="btn btn-danger" style={{ padding: '0.6rem 1rem' }}>
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

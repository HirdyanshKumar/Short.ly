import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, LogOut, LayoutDashboard, BarChart2 } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/10">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold neon-text text-primary">
                <Zap className="fill-current" />
                <span>SHORT.LY</span>
            </Link>

            <div className="flex items-center gap-6">
                {user ? (
                    <>
                        <Link to="/dashboard" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/20 transition-all hover:neon-border"
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="hover:text-primary transition-all">Login</Link>
                        <Link to="/signup" className="px-5 py-2 bg-primary text-background font-bold rounded-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,210,255,0.4)]">
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

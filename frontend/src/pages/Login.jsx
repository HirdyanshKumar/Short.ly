import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {motion} from 'framer-motion'
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex items-center justify-center pt-20 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-10 rounded-3xl border border-white/10 w-full max-auto max-w-md"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold neon-text text-primary mb-2">Login</h2>
                        <p className="text-white/50">Sign in to manage your short links.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-3 mb-6">
                            <AlertCircle size={20} />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/70">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/70">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-background font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(0,210,255,0.3)] disabled:opacity-50 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><LogIn size={20} /> Login</>}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setEmail('demo@mail.com');
                                setPassword('password123');
                            }}
                            className="w-full bg-white/5 border border-white/10 text-white/70 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-sm mt-4"
                        >
                            Demo Login
                        </button>
                    </form>

                    <p className="mt-8 text-center text-white/40">
                        New to Short.ly? <Link to="/signup" className="text-primary hover:underline font-medium">Create an account</Link>
                    </p>
                </motion.div>
            </div>
        </Layout>
    );
};

export default Login;

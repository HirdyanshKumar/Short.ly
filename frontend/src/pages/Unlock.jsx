import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Lock, Unlock as UnlockIcon, AlertCircle, Loader2 } from 'lucide-react';

const Unlock = () => {
    const { id } = useParams();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post(`/unlock/${id}`, { password });
            if (res.data.success && res.data.data.originalUrl) {
                window.location.href = res.data.data.originalUrl;
            } else {
                setError('Unexpected response from server.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Decryption failed. Incorrect code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[70vh] px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-10 rounded-3xl border border-white/10 w-full max-w-md shadow-[0_0_50px_rgba(255,0,122,0.1)]"
                >
                    <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-accent/30 text-accent">
                        <Lock size={32} className="animate-pulse" />
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold neon-text text-accent mb-2">SECURED NODE</h2>
                        <p className="text-white/50 italic">This link is encrypted. Enter bypass code.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-3 mb-6">
                            <AlertCircle size={20} />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/40 font-bold ml-1">Encryption Key</label>
                            <input
                                type="password"
                                required
                                autoFocus
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:border-accent/50 focus:ring-1 focus:ring-accent/30 outline-none transition-all text-center text-xl tracking-widest font-mono"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-accent text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_30px_rgba(255,0,122,0.4)] disabled:opacity-50 transition-all border border-accent/50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><UnlockIcon size={20} /> DECRYPT LINK</>}
                        </button>
                    </form>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full mt-6 text-white/30 hover:text-white transition-colors text-sm font-medium"
                    >
                        Abort and return to landing
                    </button>
                </motion.div>
            </div>
        </Layout>
    );
};

export default Unlock;

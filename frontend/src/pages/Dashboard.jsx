import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Link as LinkIcon,
    Copy,
    ExternalLink,
    Trash2,
    Plus,
    Settings2,
    Lock,
    Calendar,
    QrCode,
    Search,
    CheckCircle2,
    ChevronRight,
    TrendingUp,
    Globe,
    Loader2,
    X,
    Unlock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Power, BarChart3, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shortening, setShortening] = useState(false);
    const [originalUrl, setOriginalUrl] = useState('');
    const [customAlias, setCustomAlias] = useState('');
    const [password, setPassword] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [qrUrl, setQrUrl] = useState(null);
    const [updatingExpiry, setUpdatingExpiry] = useState(null); // stores urlId
    const [newExpiry, setNewExpiry] = useState('');
    const [settingPrivacy, setSettingPrivacy] = useState(null); // stores urlId
    const [privacyPassword, setPrivacyPassword] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchUrls();
    }, []);

    const fetchUrls = async () => {
        try {
            const res = await api.get('/url/mine');
            setUrls(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch URLs');
        } finally {
            setLoading(false);
        }
    };

    const handleShorten = async (e) => {
        e.preventDefault();
        setShortening(true);
        try {
            const res = await api.post('/url/create', {
                originalUrl,
                customAlias: customAlias || undefined,
                password: password || undefined,
                expiryDate: expiryDate || undefined
            });
            setUrls([res.data.data.url, ...urls]);
            setOriginalUrl('');
            setCustomAlias('');
            setPassword('');
            setExpiryDate('');
            setShowOptions(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Error shortening URL');
        } finally {
            setShortening(false);
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id) => {
        if (user?.email === 'demo@mail.com') {
            return alert("you can't delete with demo account.");
        }
        if (!window.confirm('Are you sure you want to delete this link?')) return;
        try {
            await api.delete(`/url/${id}`);
            setUrls(urls.filter(u => u._id !== id));
        } catch (err) {
            alert('Failed to delete link');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await api.patch(`/url/${id}/toggle`);
            setUrls(urls.map(u => u._id === id ? res.data.data : u));
        } catch (err) {
            alert(err.response?.data?.message || 'Toggle failed');
        }
    };

    const handleTogglePrivacy = async (id, isCurrentlyPrivate) => {
        if (!isCurrentlyPrivate) {
            setSettingPrivacy(id);
            return;
        }

        try {
            const res = await api.patch(`/url/${id}/privacy`, {
                isPrivate: false
            });
            setUrls(urls.map(u => u._id === id ? res.data.data : u));
        } catch (err) {
            alert('Failed to update privacy');
        }
    };

    const handleSetPrivacy = async (e) => {
        e.preventDefault();
        if (privacyPassword.length < 6) return alert('Key too short');

        try {
            const res = await api.patch(`/url/${settingPrivacy}/privacy`, {
                isPrivate: true,
                password: privacyPassword
            });
            setUrls(urls.map(u => u._id === settingPrivacy ? res.data.data : u));
            setSettingPrivacy(null);
            setPrivacyPassword('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update privacy');
        }
    };

    const handleUpdateExpiry = async (e) => {
        e.preventDefault();
        try {
            const res = await api.patch(`/url/${updatingExpiry}/expiry`, {
                expiryDate: newExpiry || null
            });
            setUrls(urls.map(u => u._id === updatingExpiry ? res.data.data : u));
            setUpdatingExpiry(null);
            setNewExpiry('');
        } catch (err) {
            alert('Expiry update failed');
        }
    };

    const filteredUrls = urls.filter(u =>
        u.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.customAlias && u.customAlias.toLowerCase().includes(searchTerm.toLowerCase())) ||
        u.shortId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black neon-text text-primary mb-2">DASHBOARD</h1>
                        <p className="text-white/50 italic">Managing {urls.length} active links.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-primary/50 transition-all">
                        <Search size={20} className="text-white/30" />
                        <input
                            type="text"
                            placeholder="Search links..."
                            className="bg-transparent border-none outline-none py-2 text-sm w-48 md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Shorten Form */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-8 rounded-3xl border border-white/10 mb-12 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rotate-45 pointer-events-none" />

                    <form onSubmit={handleShorten} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                <input
                                    type="url"
                                    required
                                    placeholder="Paste long URL here..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                                    value={originalUrl}
                                    onChange={(e) => setOriginalUrl(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={shortening || !originalUrl}
                                className="bg-primary text-background font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(0,210,255,0.4)] disabled:opacity-50 transition-all whitespace-nowrap"
                            >
                                {shortening ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Generate Link</>}
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setShowOptions(!showOptions)}
                                className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                            >
                                <Settings2 size={16} />
                                Link Options
                                <ChevronRight size={14} className={`transition-transform ${showOptions ? 'rotate-90' : ''}`} />
                            </button>
                        </div>

                        <AnimatePresence>
                            {showOptions && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="grid md:grid-cols-3 gap-6 overflow-hidden pt-2"
                                >
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Custom Alias (Optional)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-primary/50 outline-none transition-all text-sm"
                                            placeholder="custom-alias"
                                            value={customAlias}
                                            onChange={(e) => setCustomAlias(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Encryption Key</label>
                                        <div className="relative">
                                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input
                                                type="password"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-4 focus:border-primary/50 outline-none transition-all text-sm"
                                                placeholder="Optional password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest text-white/40 font-bold">Expiration Date</label>
                                        <div className="relative">
                                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input
                                                type="datetime-local"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-4 focus:border-primary/50 outline-none transition-all text-sm"
                                                value={expiryDate}
                                                onChange={(e) => setExpiryDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.div>

                {/* URL List */}
                <div className="space-y-4">
                    {/* URL Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/30 gap-4">
                                <Loader2 className="animate-spin" size={40} />
                                <p>Loading your links...</p>
                            </div>
                        ) : filteredUrls.length === 0 ? (
                            <div className="col-span-full text-center py-20 glass rounded-3xl border border-white/5 text-white/30 italic">
                                No links found matching your search.
                            </div>
                        ) : (
                            filteredUrls.map((url, idx) => (
                                <motion.div
                                    key={url._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`glass p-6 rounded-3xl border border-white/10 hover:border-primary/30 transition-all group flex flex-col gap-6 relative ${!url.isActive ? 'opacity-50' : ''}`}
                                >
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Globe className="text-primary" size={18} />
                                            </div>
                                            <span className="text-lg font-black tracking-tight uppercase">
                                                /{url.customAlias || url.shortId}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(url._id)}
                                            className="p-2 text-white/20 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {/* Privacy Label */}
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${url.isPrivate ? 'text-accent' : 'text-white/40'}`}>
                                            {url.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                                        </span>
                                    </div>

                                    {/* URL Display */}
                                    <p className="text-sm text-white/50 truncate font-medium">
                                        {url.originalUrl}
                                    </p>

                                    {/* Click Stats */}
                                    <div className="mt-2">
                                        <h4 className={`text-4xl font-black mb-1 ${url.isActive ? 'text-secondary' : 'text-white/20'}`}>
                                            {url.clickCount || 0}
                                        </h4>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Clicks</p>
                                    </div>

                                    {/* Action Matrix */}
                                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/5">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleTogglePrivacy(url._id, url.isPrivate)}
                                                className={`p-2 rounded-lg transition-all ${url.isPrivate ? 'text-accent bg-accent/10' : 'text-white/40 hover:bg-white/5'}`}
                                                title={url.isPrivate ? "Make Public" : "Make Private"}
                                            >
                                                {url.isPrivate ? <Lock size={18} /> : <Unlock size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(url._id)}
                                                className={`p-2 rounded-lg transition-all ${url.isActive ? 'text-green-400 bg-green-400/10' : 'text-white/20 hover:bg-white/5'}`}
                                                title={url.isActive ? "Deactivate" : "Activate"}
                                            >
                                                <Power size={18} />
                                            </button>
                                            <Link
                                                to={`/analytics/${url._id}`}
                                                className="p-2 text-white/40 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                                                title="View Analytics"
                                            >
                                                <BarChart3 size={18} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setUpdatingExpiry(url._id);
                                                    setNewExpiry(url.expiryDate ? new Date(url.expiryDate).toISOString().slice(0, 16) : '');
                                                }}
                                                className={`p-2 rounded-lg transition-all ${url.expiryDate ? 'text-primary bg-primary/10' : 'text-white/40 hover:bg-white/5'}`}
                                                title="Update Expiry"
                                            >
                                                <Calendar size={18} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => copyToClipboard(`${import.meta.env.VITE_BACKEND_BASE_URL}/${url.customAlias || url.shortId}`, url._id)}
                                                className={`p-2 rounded-lg transition-all ${copiedId === url._id ? 'text-primary bg-primary/10' : 'text-white/40 hover:bg-white/5'}`}
                                                title="Copy Link"
                                            >
                                                {copiedId === url._id ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                            </button>
                                            <button
                                                onClick={() => setQrUrl(`${import.meta.env.VITE_BACKEND_BASE_URL}/${url.customAlias || url.shortId}`)}
                                                className="p-2 text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                title="Get QR Code"
                                            >
                                                <QrCode size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {!url.isActive && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-3xl flex items-center justify-center pointer-events-none">
                                            <span className="bg-black/60 px-3 py-1 rounded-full text-[10px] font-bold text-white/60 border border-white/10 uppercase tracking-widest">Offline</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* QR Modal */}
                <AnimatePresence>
                    {qrUrl && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 px-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setQrUrl(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="glass p-10 rounded-3xl border border-white/10 w-full max-w-sm relative z-10 flex flex-col items-center gap-8"
                            >
                                <button
                                    onClick={() => setQrUrl(null)}
                                    className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold neon-text text-primary mb-2">LINK QR CODE</h3>
                                    <p className="text-white/40 text-sm">Download or scan this QR code.</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                    <QRCodeSVG value={qrUrl} size={200} />
                                </div>
                                <p className="text-xs font-mono text-white/30 truncate w-full text-center">
                                    {qrUrl}
                                </p>
                                <button
                                    onClick={() => setQrUrl(null)}
                                    className="w-full bg-white/5 border border-white/10 py-3 rounded-xl hover:bg-white/10 transition-colors font-bold"
                                >
                                    Close
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Expiry Update Modal */}
                <AnimatePresence>
                    {updatingExpiry && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setUpdatingExpiry(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="glass p-8 rounded-3xl border border-white/10 w-full max-w-sm relative z-10"
                            >
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-xl">
                                        <Calendar className="text-primary" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Update Expiration</h3>
                                        <p className="text-xs text-white/40">Set a new link deadline</p>
                                    </div>
                                </div>
                                <form onSubmit={handleUpdateExpiry} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">New Deadline</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-primary/50 outline-none transition-all text-sm"
                                            value={newExpiry}
                                            onChange={(e) => setNewExpiry(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setUpdatingExpiry(null)}
                                            className="flex-1 bg-white/5 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 bg-primary text-background py-3 rounded-xl hover:brightness-110 transition-all text-sm font-bold"
                                        >
                                            Update Date
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Privacy Update Modal */}
                <AnimatePresence>
                    {settingPrivacy && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSettingPrivacy(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="glass p-8 rounded-3xl border border-white/10 w-full max-w-sm relative z-10"
                            >
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="p-3 bg-accent/10 rounded-xl">
                                        <Lock className="text-accent" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Secure Link</h3>
                                        <p className="text-xs text-white/40">Protect your link with a password</p>
                                    </div>
                                </div>
                                <form onSubmit={handleSetPrivacy} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Encryption Key</label>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            placeholder="Min 6 characters"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all text-sm"
                                            value={privacyPassword}
                                            onChange={(e) => setPrivacyPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSettingPrivacy(null)}
                                            className="flex-1 bg-white/5 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 bg-accent text-white py-3 rounded-xl hover:brightness-110 transition-all text-sm font-bold"
                                        >
                                            Protect Link
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default Dashboard;

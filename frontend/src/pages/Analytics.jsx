import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import {
    ChevronLeft,
    MousePointer2,
    Globe2,
    Monitor,
    Calendar,
    Loader2,
    TrendingUp,
    Activity
} from 'lucide-react';

const Analytics = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [breakdown, setBreakdown] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [summaryRes, chartRes, breakdownRes] = await Promise.all([
                    api.get(`/analytics/${id}/summary`),
                    api.get(`/analytics/${id}/chart`),
                    api.get(`/analytics/${id}/breakdown`)
                ]);
                setData(summaryRes.data.data);
                setChartData(chartRes.data.data.chartData || []);
                setBreakdown(breakdownRes.data.data);
            } catch (err) {
                console.error('Failed to fetch analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-white/30 gap-4">
                    <Loader2 className="animate-spin" size={48} />
                    <p className="animate-pulse">Loading analytics...</p>
                </div>
            </Layout>
        );
    }

    const COLORS = ['#00d2ff', '#00f5d4', '#ff007a', '#a855f7', '#fbbf24'];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-6 py-12">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-primary transition-colors mb-8 group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="mb-12">
                    <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">Analytics for: <span className="text-primary neon-text">{data?.shortId || id}</span></h1>
                    <p className="text-white/40 truncate max-w-2xl">{data?.originalUrl}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <StatCard icon={<MousePointer2 size={24} />} label="Total Clicks" value={data?.totalClicks || 0} color="text-primary" />
                    <StatCard icon={<Globe2 size={24} />} label="Geolocations" value={Object.keys(breakdown?.locations || {}).length} color="text-secondary" />
                    <StatCard icon={<Monitor size={24} />} label="Devices" value={Object.keys(breakdown?.devices || {}).length} color="text-accent" />
                    <StatCard icon={<Calendar size={24} />} label="Link Age" value={data?.createdAt ? `${Math.floor((new Date() - new Date(data.createdAt)) / (1000 * 60 * 60 * 24))}d` : 'N/A'} color="text-white/60" />
                </div>

                {/* Main Chart */}
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/10 min-h-[400px]">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <Activity className="text-primary" size={20} />
                            Click Activity (Last 7 Days)
                        </h3>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00d2ff" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#ffffff30"
                                        fontSize={12}
                                        tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { weekday: 'short' })}
                                    />
                                    <YAxis stroke="#ffffff30" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                                        itemStyle={{ color: '#00d2ff' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="clicks"
                                        stroke="#00d2ff"
                                        strokeWidth={4}
                                        dot={{ fill: '#00d2ff', r: 6, strokeWidth: 0 }}
                                        activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass p-8 rounded-3xl border border-white/10 group">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <TrendingUp className="text-secondary" size={20} />
                            Device Distribution
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={Object.entries(breakdown?.devices || {}).map(([name, value]) => ({ name, value }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {Object.entries(breakdown?.devices || {}).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-3">
                            {Object.entries(breakdown?.devices || {}).map(([name, value], idx) => (
                                <div key={name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="text-white/60 capitalize">{name}</span>
                                    </div>
                                    <span className="font-bold">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Browser Breakdown */}
                <div className="mt-8 grid md:grid-cols-2 gap-8">
                    <div className="glass p-8 rounded-3xl border border-white/10">
                        <h3 className="text-xl font-bold mb-6">Browsers</h3>
                        <div className="space-y-4">
                            {Object.entries(breakdown?.browsers || {}).map(([name, value], idx) => (
                                <div key={name} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="capitalize">{name}</span>
                                        <span className="text-white/40">{value}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(value / data.totalClicks) * 100}%` }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass p-8 rounded-3xl border border-white/10">
                        <h3 className="text-xl font-bold mb-6">Locations</h3>
                        <div className="space-y-4 text-sm">
                            {Object.entries(breakdown?.locations || {}).length > 0 ? (
                                Object.entries(breakdown?.locations || {}).map(([name, value]) => (
                                    <div key={name} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                        <span className="capitalize">{name}</span>
                                        <span className="font-mono text-secondary px-2 py-0.5 bg-secondary/10 rounded">{value}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white/30 italic">No geographic data detected yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className="glass p-6 rounded-2xl border border-white/10 flex items-center gap-5">
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-white/40 mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
        </div>
    </div>
);

export default Analytics;

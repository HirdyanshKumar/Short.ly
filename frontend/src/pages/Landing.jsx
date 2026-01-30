import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import {motion} from 'framer-motion'
import { Shield, BarChart3, QrCode, Zap } from 'lucide-react';

const Landing = () => {
    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
                <div className="text-center">
                    <motion.h1
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl md:text-8xl font-black mb-6 tracking-tight"
                    >
                        SHRINK THE <span className="neon-text text-primary">WEB</span>
                    </motion.h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
                        Professional link shortening with detailed analytics, password protection, and custom QR codes.
                        Simplify your link management today.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link to="/signup" className="px-8 py-4 bg-primary text-background text-lg font-bold rounded-xl shadow-[0_0_30px_rgba(0,210,255,0.5)] hover:scale-105 transition-all">
                            Elevate Now
                        </Link>
                        <Link to="/login" className="px-8 py-4 glass border border-white/20 text-lg font-bold rounded-xl hover:bg-white/5 transition-all">
                            Access Console
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-32">
                    <FeatureCard
                        icon={<Shield className="text-primary" />}
                        title="Secure Links"
                        desc="Protect your sensitive redirects with strong password encryption."
                    />
                    <FeatureCard
                        icon={<BarChart3 className="text-secondary" />}
                        title="Detailed Analytics"
                        desc="Track visitor behavior and link performance in real-time."
                    />
                    <FeatureCard
                        icon={<QrCode className="text-accent" />}
                        title="Custom QR Codes"
                        desc="Generate instant QR codes to bridge the gap between offline and online."
                    />
                </div>
            </div>
        </Layout>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all group">
        <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl mb-6 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-white/50 leading-relaxed">{desc}</p>
    </div>
);

export default Landing;

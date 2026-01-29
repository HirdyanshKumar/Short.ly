import React from 'react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    return (
        <div className="text-white selection:bg-primary/30 min-h-screen flex flex-col">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <Navbar />

            <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 relative z-10"
            >
                {children}
            </motion.main>

            <footer className="relative z-10 p-8 border-t border-white/5 text-center text-white/40 text-sm">
                <p>&copy; {new Date().getFullYear()} Short.ly. The standard in link shortening.</p>
            </footer>
        </div>
    );
};

export default Layout;

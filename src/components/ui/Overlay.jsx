// src/components/ui/Overlay.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Overlay = ({ title, onClose, children }) => (
    <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
        className="absolute bottom-0 left-0 right-0 h-[75%] bg-white/80 backdrop-blur-md rounded-t-3xl p-4 flex flex-col shadow-2xl z-20"
    >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
            <button onClick={onClose} className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-amber-100">
            {children}
        </div>
    </motion.div>
);

export default Overlay;
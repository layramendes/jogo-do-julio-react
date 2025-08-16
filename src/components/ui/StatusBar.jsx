// src/components/ui/StatusBar.jsx
import React from 'react';
import { motion } from 'framer-motion';

const StatusBar = ({ value, colorClass }) => (
    <div className="w-full bg-gray-200/80 rounded-full h-2.5 shadow-inner">
        <motion.div
            className={`h-full rounded-full ${colorClass}`}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        />
    </div>
);

export default StatusBar;
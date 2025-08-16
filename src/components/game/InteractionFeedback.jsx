// src/components/game/InteractionFeedback.jsx
import React from 'react';
import { motion } from 'framer-motion';

const InteractionFeedback = ({ text }) => (
    <motion.div
        key={Date.now()} // Força a re-animação
        className="absolute z-50 text-2xl font-bold text-yellow-500 pointer-events-none"
        style={{ textShadow: '1px 1px 2px black' }}
        initial={{ y: 0, opacity: 1, scale: 0.8 }}
        animate={{ y: -50, opacity: 0, scale: 1.2 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
    >
        {text}
    </motion.div>
);

export default InteractionFeedback;
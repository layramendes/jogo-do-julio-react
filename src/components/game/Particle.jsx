// src/components/game/Particle.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Particle = ({ x, y }) => (
    <motion.div
        className="absolute text-2xl pointer-events-none z-50"
        style={{ left: x, top: y, x: '-50%', y: '-50%' }}
        initial={{ opacity: 1, y: 0, scale: 0.5 }}
        animate={{ opacity: 0, y: -40, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
    >
        ❤️
    </motion.div>
);

export default Particle;
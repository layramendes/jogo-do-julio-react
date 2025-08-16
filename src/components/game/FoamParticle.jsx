// src/components/game/FoamParticle.jsx
import React from 'react';
import { motion } from 'framer-motion';

const FoamParticle = ({ style }) => (
    <motion.div
        className="absolute w-8 h-8 bg-white/70 rounded-full z-30 pointer-events-none"
        style={style}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
    />
);

export default FoamParticle;
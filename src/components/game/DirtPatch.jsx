// src/components/game/DirtPatch.jsx
import React from 'react';
import { motion } from 'framer-motion';

const DirtPatch = React.forwardRef(({ style, health }, ref) => (
    <motion.div
        ref={ref}
        className="absolute w-10 h-10 bg-yellow-900/60 rounded-full z-40 pointer-events-none"
        style={style}
        initial={{ scale: 0 }}
        animate={{ scale: 1, opacity: health / 15 }} // Desaparece gradualmente
        exit={{ scale: 0 }}
    />
));

export default DirtPatch;
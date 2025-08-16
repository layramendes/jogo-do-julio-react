import React from 'react';
import { motion } from 'framer-motion';

const Poop = ({ poop, onClick }) => (
    <motion.div
        className="absolute text-5xl cursor-pointer z-10"
        style={{ top: poop.style.top, left: poop.style.left }}
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0, y: 20 }}
        onClick={() => onClick(poop.id)}
    >
        💩
    </motion.div>
);

export default Poop;
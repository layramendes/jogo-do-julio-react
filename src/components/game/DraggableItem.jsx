// src/components/game/DraggableItem.jsx
import React from 'react';
import { motion } from 'framer-motion';

const DraggableItem = ({ item, onDragEnd, constraintsRef }) => (
    <motion.div
        className="absolute text-6xl z-50 cursor-grab"
        style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.5}
        onDragEnd={(event, info) => onDragEnd(info, item)}
        whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
    >
        {item.icon}
    </motion.div>
);

export default DraggableItem;
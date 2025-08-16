// src/components/ui/ItemCard.jsx
import React from 'react';

const ItemCard = ({ children, onClick, disabled = false }) => (
    <div
        onClick={!disabled ? onClick : null}
        className={`bg-white/80 p-4 rounded-xl shadow-md flex flex-col items-center justify-between text-center transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'}`}
    >
        {children}
    </div>
);

export default ItemCard;
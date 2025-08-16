// src/components/screens/RoomComponent.jsx
import React from 'react';
import ItemCard from '../ui/ItemCard';
import { gameItems } from '../../data/gameData';

const RoomComponent = ({ playerState, itemType, emptyMessage, onUseItem }) => {
    const items = Object.keys(playerState?.inventory || {})
        .filter(key => gameItems?.[key]?.type === itemType && playerState.inventory?.[key] > 0);

    if (!playerState || !playerState.inventory) return <p className="text-center text-gray-500">A carregar...</p>;

    if (items.length === 0) return <p className="text-center text-gray-500">{emptyMessage}</p>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {items.map(itemId => (
                <ItemCard key={itemId} onClick={() => onUseItem(itemId)}>
                    <div className="text-4xl mb-2">{gameItems?.[itemId]?.icon}</div>
                    <p className="font-semibold text-gray-700">{gameItems?.[itemId]?.name}</p>
                    <p className="text-sm text-gray-500">Quantidade: {playerState.inventory?.[itemId]}</p>
                </ItemCard>
            ))}
        </div>
    );
};

export default RoomComponent;
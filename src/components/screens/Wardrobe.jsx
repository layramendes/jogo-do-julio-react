// src/components/screens/Wardrobe.jsx
import React from 'react';
import ItemCard from '../ui/ItemCard';
import { gameItems } from '../../data/gameData';

const Wardrobe = ({ playerState, onEquipItem }) => {
    // Filtra apenas os itens do tipo 'accessory' que o jogador possui no inventário
    const ownedAccessories = Object.keys(playerState?.inventory || {})
        .filter(key => gameItems[key]?.type === 'accessory' && playerState.inventory[key] > 0);

    const { customization } = playerState || {};

    if (ownedAccessories.length === 0) {
        return <p className="text-center text-gray-500">Você não possui acessórios. Visite a loja! 🧢</p>;
    }

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-600 mb-3">Seus Acessórios</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ownedAccessories.map(itemId => {
                    const item = gameItems[itemId];
                    const isEquipped = customization[item.category] === itemId;
                    
                    return (
                        <div 
                            key={itemId} 
                            onClick={() => onEquipItem(itemId)}
                            className={`p-1 rounded-xl transition-all duration-200 ${isEquipped ? 'bg-amber-400' : 'bg-transparent'}`}
                        >
                            <ItemCard>
                                <div className="text-4xl mb-2">{item.icon}</div>
                                <p className="font-semibold text-gray-700">{item.name}</p>
                            </ItemCard>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Wardrobe;
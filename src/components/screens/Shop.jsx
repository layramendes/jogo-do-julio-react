// src/components/screens/Shop.jsx
import React from 'react';
import ItemCard from '../ui/ItemCard';
import { gameItems, coinPackages, soundManager } from '../../data/gameData';
import { arrayUnion } from 'firebase/firestore';

const Shop = ({ playerState, updatePlayerState, onBuyCoins, onShowFeedback }) => {
    const handleBuyItem = (itemId) => {
        const item = gameItems?.[itemId];
        if (!item || playerState?.coins < item.price) {
            onShowFeedback("Moedas insuficientes!");
            return;
        }
        const newCoins = playerState.coins - item.price;
        if (item.type === 'background') {
            updatePlayerState({ coins: newCoins, backgroundsOwned: arrayUnion(item.value) });
        } else {
            const currentAmount = playerState?.inventory?.[itemId] || 0;
            updatePlayerState({ coins: newCoins, [`inventory.${itemId}`]: currentAmount + 1 });
        }
        soundManager.playSound('buy');
        onShowFeedback(`${item.name} comprado!`);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-600 mb-3">Comprar Itens</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(gameItems).map(([id, item]) => (
                    <ItemCard key={id} onClick={() => handleBuyItem(id)} disabled={playerState?.coins < item.price}>
                        <div className="text-4xl mb-2">{item.icon}</div>
                        <p className="font-semibold text-gray-700">{item.name}</p>
                        <div className="flex items-center justify-center mt-2 text-amber-600 font-bold">💰<span className="ml-1">{item.price}</span></div>
                    </ItemCard>
                ))}
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mt-6 mb-3">Comprar Moedas</h3>
            <div className="grid grid-cols-1 gap-3">
                {coinPackages.map((pkg) => (
                    <div key={pkg.id} onClick={() => onBuyCoins(pkg.id)} className="bg-gradient-to-br from-amber-300 to-yellow-400 p-4 rounded-xl shadow-lg flex items-center justify-between text-white cursor-pointer hover:from-amber-400 hover:to-yellow-500 transition-all">
                        <div>
                            <div className="text-2xl">{pkg.icon}</div>
                            <p className="font-bold text-lg">{pkg.name}</p>
                        </div>
                        <div className="bg-white/30 text-white font-bold py-2 px-4 rounded-full">{pkg.price}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shop;
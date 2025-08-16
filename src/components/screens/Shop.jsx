import React from 'react';
import { motion } from 'framer-motion';
import ItemCard from '../ui/ItemCard';
import { gameItems, coinPackages, soundManager } from '../../data/gameData';
import { arrayUnion } from 'firebase/firestore';

// Pequeno componente para o ícone de loading
const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const Shop = ({ playerState, updatePlayerState, onBuyCoins, onShowFeedback, isPurchasing }) => {
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
                    <div
                        key={pkg.id}
                        onClick={() => !isPurchasing && onBuyCoins(pkg.id)} // Só permite o clique se não estiver a comprar
                        className={`bg-gradient-to-br from-amber-300 to-yellow-400 p-4 rounded-xl shadow-lg flex items-center justify-between text-white transition-all ${isPurchasing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:from-amber-400 hover:to-yellow-500'}`}
                    >
                        <div>
                            <div className="text-2xl">{pkg.icon}</div>
                            <p className="font-bold text-lg">{pkg.name}</p>
                        </div>
                        <div className="bg-white/30 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center min-w-[70px]">
                            {isPurchasing ? <Spinner /> : pkg.price}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shop;
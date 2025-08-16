import React from 'react';
import ItemCard from '../ui/ItemCard';

const Playroom = ({ onStartGame }) => (
    <div>
        <h3 className="text-lg font-semibold text-gray-600 mb-3">Mini-Jogos</h3>
        <div className="grid grid-cols-2 gap-4">
            <ItemCard onClick={() => onStartGame('catch')}>
                <div className="text-4xl mb-2">⚽</div>
                <p className="font-semibold text-gray-700">Apanha a Bola</p>
                <p className="text-sm text-gray-500">Ganhe moedas apanhando a bola!</p>
            </ItemCard>
            <ItemCard onClick={() => onStartGame('memory')}>
                <div className="text-4xl mb-2">🧠</div>
                <p className="font-semibold text-gray-700">Jogo da Memória</p>
                <p className="text-sm text-gray-500">Encontre os pares e ganhe moedas!</p>
            </ItemCard>
        </div>
    </div>
);

export default Playroom;
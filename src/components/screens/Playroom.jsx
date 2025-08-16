// src/components/screens/Playroom.jsx
import React from 'react';
import ItemCard from '../ui/ItemCard';

const Playroom = ({ onStartGame }) => (
    <div>
        <h3 className="text-lg font-semibold text-gray-600 mb-3">Mini-Jogos</h3>
        <ItemCard onClick={onStartGame}>
            <div className="text-4xl mb-2">⚽</div>
            <p className="font-semibold text-gray-700">Apanha a Bola</p>
            <p className="text-sm text-gray-500">Ganhe moedas apanhando a bola!</p>
        </ItemCard>
    </div>
);

export default Playroom;
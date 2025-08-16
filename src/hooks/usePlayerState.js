// src/hooks/usePlayerState.js
import { useState, useEffect, useCallback } from 'react';
import { getFirestore, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export const usePlayerStateWithPoop = (userId) => {
    const [playerState, setPlayerState] = useState(null);

    useEffect(() => {
        if (!userId) return;
        const playerDocRef = doc(getFirestore(), "players", userId);
        const unsubscribe = onSnapshot(playerDocRef, (doc) => {
            if (!doc.exists()) {
                const initialState = {
                    stats: { health: 100, hunger: 80, hygiene: 70, fun: 90, energy: 60 },
                    coins: 100,
                    isSleeping: false,
                    customization: { background: 'bg-green-200' },
                    inventory: { 'maca': 2, 'sabonete': 1, 'bola': 1 },
                    backgroundsOwned: ['bg-green-200'],
                    poops: []
                };
                setDoc(playerDocRef, initialState);
            } else {
                setPlayerState(doc.data());
            }
        });
        return () => unsubscribe();
    }, [userId]);
    
    // Retornamos o estado e a função para atualizá-lo
    return playerState;
};
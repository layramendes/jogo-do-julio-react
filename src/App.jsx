// src/App.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { updateDoc, doc, getFirestore, arrayUnion, arrayRemove } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';

// Importações de Dados, Hooks e Utilitários
import { firebaseConfig, stripePublicKey, gameItems } from './data/gameData';
import { usePlayerStateWithPoop } from './hooks/usePlayerState';
import { soundManager } from './data/gameData';

// Importações de Componentes de UI
import NavIcon from './components/ui/NavIcon';
import StatusBar from './components/ui/StatusBar';
import Overlay from './components/ui/Overlay';

// Importações de Componentes de Jogo
import JulioCharacter from './components/game/JulioCharacter';
import Poop from './components/game/Poop';
import Particle from './components/game/Particle';
import DraggableItem from './components/game/DraggableItem';
import InteractionFeedback from './components/game/InteractionFeedback';
import CleaningMinigame from './components/game/CleaningMinigame';
import CatchTheBallGame from './components/game/CatchTheBallGame';

// Importações de "Telas" (Ecrãs)
import Shop from './components/screens/Shop';
import Bedroom from './components/screens/Bedroom';
import Playroom from './components/screens/Playroom';
import RoomComponent from './components/screens/RoomComponent';
import Wardrobe from './components/screens/Wardrobe'; // NOVO: Importa o Guarda-Roupa

export default function App() {
    const [userId, setUserId] = useState(null);
    const [activeOverlay, setActiveOverlay] = useState(null);
    const [draggableItem, setDraggableItem] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [isCleaning, setIsCleaning] = useState(false);
    const [isGameActive, setIsGameActive] = useState(false);
    const [isPetting, setIsPetting] = useState(false);
    const [particles, setParticles] = useState([]);
    const [julioRect, setJulioRect] = useState(null);
    const pettingIntervalRef = useRef(null);
    const mainRef = useRef(null);
    const julioRef = useRef(null);

    const updatePlayerState = useCallback(async (newData) => { if (!userId) return; const playerDocRef = doc(getFirestore(), "players", userId); await updateDoc(playerDocRef, newData, { merge: true }); }, [userId]);
    const playerState = usePlayerStateWithPoop(userId);

    useEffect(() => { try { const app = initializeApp(firebaseConfig); const auth = getAuth(app); onAuthStateChanged(auth, user => setUserId(user?.uid), console.error); signInAnonymously(auth).catch(console.error); } catch (e) { if (!getApp()) console.error("Firebase not initialized"); } }, []);
    useEffect(() => { if (julioRef.current && mainRef.current) { const rect = julioRef.current.getBoundingClientRect(); const parentRect = mainRef.current.getBoundingClientRect(); setJulioRect({ top: rect.top - parentRect.top, left: rect.left - parentRect.left, width: rect.width, height: rect.height, }); } }, [julioRef.current, playerState]);
    
    const showFeedback = (message) => { setFeedback(message); setTimeout(() => setFeedback(null), 1500); };

    const gainXp = useCallback((amount) => {
        if (!playerState || playerState.isSleeping) return;
        const newXp = (playerState.xp || 0) + amount;
        const xpToNextLevel = (playerState.level || 1) * 100;

        if (newXp >= xpToNextLevel) {
            const remainingXp = newXp - xpToNextLevel;
            const newLevel = (playerState.level || 1) + 1;
            updatePlayerState({ xp: remainingXp, level: newLevel, coins: (playerState.coins || 0) + 50 });
            showFeedback(`Julio subiu para o nível ${newLevel}! +50 moedas!`);
        } else {
            updatePlayerState({ xp: newXp });
        }
    }, [playerState, updatePlayerState]);

    const gameLoop = useCallback(() => {
        if (!playerState || isCleaning || isGameActive || isPetting) return;
        let newStats = { ...playerState.stats };
        if (playerState.isSleeping) { newStats.energy = Math.min(100, newStats.energy + 1.0); } 
        else { const poopCount = playerState.poops?.length || 0; newStats.hunger = Math.max(0, newStats.hunger - 0.5); newStats.hygiene = Math.max(0, newStats.hygiene - (0.3 + (poopCount * 2))); newStats.fun = Math.max(0, newStats.fun - 0.4); newStats.energy = Math.max(0, newStats.energy - 0.2); if (newStats.hunger < 20 || newStats.hygiene < 20 || poopCount > 0) { newStats.health = Math.max(0, newStats.health - 0.5); } }
        updatePlayerState({ stats: newStats });
    }, [playerState, updatePlayerState, isCleaning, isGameActive, isPetting]);

    useEffect(() => { const interval = setInterval(gameLoop, 5000); return () => clearInterval(interval); }, [gameLoop]);
    useEffect(() => { if (!playerState || isCleaning || isGameActive || isPetting || playerState.isSleeping) return; const poopInterval = setInterval(() => { const poops = playerState.poops || []; if (poops.length >= 3) return; if (Math.random() < 0.2) { soundManager.playSound('poop'); const newPoop = { id: Date.now(), style: { top: `${Math.random() * 20 + 75}%`, left: `${Math.random() * 80 + 10}%`, }}; updatePlayerState({ poops: arrayUnion(newPoop) }); } }, 30000); return () => clearInterval(poopInterval); }, [playerState, isCleaning, isGameActive, isPetting, updatePlayerState]);

    const handleAction = useCallback((stat, value) => { if (!playerState || playerState.isSleeping) return; const newStats = { ...playerState.stats }; newStats[stat] = Math.min(100, (newStats[stat] || 0) + value); if (stat !== 'energy') newStats.energy = Math.max(0, newStats.energy - 2); updatePlayerState({ stats: newStats }); gainXp(5); }, [playerState, updatePlayerState, gainXp]);
    const handleSleep = useCallback(() => { if (!playerState) return; updatePlayerState({ isSleeping: !playerState.isSleeping }); }, [playerState, updatePlayerState]);
    
    const handleBuyCoins = useCallback(async (priceId) => {
        if (!userId) {
            showFeedback("Você precisa estar logado para comprar moedas.");
            return;
        }
        try {
            const stripe = await loadStripe(stripePublicKey);
            const { error } = await stripe.redirectToCheckout({
                lineItems: [{ price: priceId, quantity: 1 }],
                mode: 'payment',
                successUrl: `${window.location.origin}?purchase=success`,
                cancelUrl: `${window.location.origin}?purchase=canceled`,
            });
    
            if (error) {
                console.error("Erro ao redirecionar para o checkout:", error);
                showFeedback("Ocorreu um erro ao tentar comprar moedas.");
            }
        } catch (error) {
            console.error("Erro no Stripe:", error);
            showFeedback("Não foi possível iniciar a compra.");
        }
    }, [userId]);
    
    const handleCleanPoop = (poopId) => { soundManager.playSound('clean'); const poopToRemove = playerState.poops.find(p => p.id === poopId); if (poopToRemove) { updatePlayerState({ poops: arrayRemove(poopToRemove) }); handleAction('hygiene', 15); gainXp(10); } };
    const handleUseItem = (itemId) => {
        const item = gameItems[itemId]; if (!item) return; const currentAmount = playerState.inventory[itemId] || 0;
        if (currentAmount <= 0) { showFeedback(`Não tem mais ${item.name}!`); return; }
        if (item.type === 'hygiene') { soundManager.playSound('clean'); updatePlayerState({ [`inventory.${itemId}`]: currentAmount - 1 }); setIsCleaning(true); setActiveOverlay(null); } 
        else { setDraggableItem({ id: itemId, icon: item.icon }); setActiveOverlay(null); }
    };
    const handleEndCleaning = () => { const soapEffect = gameItems.sabonete.effect; handleAction(soapEffect.stat, soapEffect.value); showFeedback(gameItems.sabonete.feedback); setIsCleaning(false); gainXp(15);};
    const handleItemDrop = (info, droppedItem) => { /* ...código idêntico... */ };
    const handleGameFinish = (score) => { const coinsEarned = score * 2; if (coinsEarned > 0) { showFeedback(`+${coinsEarned} moedas!`); gainXp(score * 2); } updatePlayerState({ coins: playerState.coins + coinsEarned, }); setIsGameActive(false); };
    const handlePettingEnd = useCallback(() => { setIsPetting(false); clearInterval(pettingIntervalRef.current); window.removeEventListener('mouseup', handlePettingEnd); }, []);
    const handlePettingStart = (event) => { /* ...código idêntico... */ };
    const handlePettingMove = (event) => { /* ...código idêntico... */ };

    // NOVO: Função para equipar/desequipar itens
    const handleEquipItem = (itemId) => {
        const item = gameItems[itemId];
        if (!item || item.type !== 'accessory') return;

        const category = item.category;
        const currentlyEquipped = playerState.customization[category];
        
        // Se o item já estiver equipado, desequipa. Senão, equipa.
        const newEquip = currentlyEquipped === itemId ? null : itemId;
        updatePlayerState({ [`customization.${category}`]: newEquip });
        soundManager.playSound('click');
    };
    
    const handleToggleLight = useCallback(() => {
        if (!playerState) return;
        updatePlayerState({ isLightOn: !playerState.isLightOn });
        soundManager.playSound('click');
    }, [playerState, updatePlayerState]);
    
    
    const NavButton = ({ type, onClick }) => (<button onClick={onClick} className="bg-amber-100/80 p-3 rounded-lg shadow-md text-amber-800 hover:bg-amber-200/80 transition-colors flex items-center justify-center"><NavIcon type={type} /></button>);
    const renderOverlayContent = () => {
        switch (activeOverlay) {
            case 'Loja': return <Shop playerState={playerState} updatePlayerState={updatePlayerState} onBuyCoins={handleBuyCoins} onShowFeedback={showFeedback} />;
            case 'Cozinha': return <RoomComponent playerState={playerState} onUseItem={handleUseItem} itemType="food" emptyMessage="Não tem comida. Visite a loja! 🛒" />;
            case 'Casa de Banho': return <RoomComponent playerState={playerState} onUseItem={handleUseItem} itemType="hygiene" emptyMessage="Não tem itens de higiene. 🛒" />;
            case 'Sala de Jogos': return <Playroom onStartGame={() => { soundManager.playSound('click'); setIsGameActive(true); setActiveOverlay(null); }} />;
            case 'Quarto': return <Bedroom playerState={playerState} updatePlayerState={updatePlayerState} onSleep={handleSleep} onToggleLight={handleToggleLight} />;
            case 'Guarda-Roupa': return <Wardrobe playerState={playerState} onEquipItem={handleEquipItem} />; // NOVO
            default: return null;
        }
    };

    if (!playerState) { return <div className="w-full max-w-sm mx-auto h-[95vh] max-h-[800px] bg-white/70 rounded-3xl shadow-2xl p-6 flex items-center justify-center"><div className="text-center"><div className="text-4xl animate-spin">🐾</div><p className="text-lg mt-2">A carregar o Jogo...</p></div></div>; }

    const backgroundClass = playerState?.customization?.background || 'bg-green-200';
    const xpPercentage = ((playerState.xp || 0) / ((playerState.level || 1) * 100)) * 100;

    return (
        <div className={`w-full max-w-sm mx-auto h-[95vh] max-h-[800px] flex flex-col font-sans overflow-hidden ${backgroundClass} rounded-3xl shadow-2xl p-4 border-4 border-amber-300 transition-colors duration-500`}>
            <header className="flex justify-between items-center mb-2 flex-shrink-0">
                <div className="text-lg bg-blue-500 text-white px-4 py-1 rounded-full shadow flex items-center">
                    Nível <span className="ml-2 font-semibold">{playerState?.level || 1}</span>
                </div>
                <div className="text-lg bg-yellow-400 text-white px-4 py-1 rounded-full shadow flex items-center">
                    💰<span className="ml-2 font-semibold">{playerState?.coins}</span>
                </div>
            </header>
            <div className="flex items-center gap-x-2 mb-2">
                <span className="text-sm font-bold text-purple-700">XP</span>
                <StatusBar value={xpPercentage} colorClass="bg-purple-500" />
            </div>
            <div className="grid grid-cols-[20px,1fr] gap-x-2 gap-y-1 items-center mb-4 flex-shrink-0 text-pink-600"><span>❤️</span><StatusBar value={playerState?.stats?.health} colorClass="bg-pink-500" /><span>🍖</span><StatusBar value={playerState?.stats?.hunger} colorClass="bg-orange-500" /><span>🧼</span><StatusBar value={playerState?.stats?.hygiene} colorClass="bg-cyan-500" /><span>🎾</span><StatusBar value={playerState?.stats?.fun} colorClass="bg-yellow-500" /><span>⚡</span><StatusBar value={playerState?.stats?.energy} colorClass="bg-lime-500" /></div>
            
            <main ref={mainRef} className="flex-grow relative flex flex-col items-center justify-center my-2 overflow-hidden">
                <AnimatePresence>{isGameActive && <CatchTheBallGame onFinish={handleGameFinish} />}</AnimatePresence>
                {particles.map(particle => <Particle key={particle.id} x={particle.x} y={particle.y} />)}
                <div className={`relative flex items-center justify-center transition-all duration-300 ${isGameActive ? 'filter blur-sm' : ''}`}>
                    <div ref={julioRef} className={`transition-all duration-300 ${isCleaning ? 'saturate-50' : ''}`}>
                        {/* NOVO: Passa a customização para o JulioCharacter */}
                        <JulioCharacter 
                            isSleeping={playerState?.isSleeping} 
                            status={playerState?.stats} 
                            isPetting={isPetting} 
                            onPetStart={handlePettingStart} 
                            onPetMove={handlePettingMove}
                            customization={playerState?.customization}
                        />
                    </div>
                </div>
                <AnimatePresence>{playerState.poops?.map(p => <Poop key={p.id} poop={p} onClick={handleCleanPoop} />)}</AnimatePresence>
                {isCleaning && julioRect && <CleaningMinigame onFinish={handleEndCleaning} julioRect={julioRect} />}
                {draggableItem && ( <DraggableItem item={draggableItem} onDragEnd={handleItemDrop} constraintsRef={mainRef} /> )}
                {feedback && <InteractionFeedback text={feedback} />}
                <div className={`absolute bottom-0 text-center mb-4 transition-opacity duration-300 ${isGameActive || isCleaning ? 'opacity-0 pointer-events-none' : ''}`}><p className="text-gray-600 font-semibold bg-white/50 px-3 py-1 rounded-full">{playerState?.isSleeping ? "Julio está a dormir... Zzz" : "Relaxa com o Julio!"}</p></div>
                <AnimatePresence>{activeOverlay && (<Overlay title={activeOverlay} onClose={() => setActiveOverlay(null)}>{renderOverlayContent()}</Overlay>)}</AnimatePresence>
            </main>

            <nav className="grid grid-cols-6 gap-2 mt-4 flex-shrink-0">
                <NavButton type="home" onClick={() => { soundManager.playSound('click'); setActiveOverlay(null); }} />
                <NavButton type="kitchen" onClick={() => { soundManager.playSound('click'); setActiveOverlay('Cozinha'); }} />
                <NavButton type="wardrobe" onClick={() => { soundManager.playSound('click'); setActiveOverlay('Guarda-Roupa'); }} /> {/* NOVO */}
                <NavButton type="playroom" onClick={() => { soundManager.playSound('click'); setActiveOverlay('Sala de Jogos'); }} />
                <NavButton type="bedroom" onClick={() => { soundManager.playSound('click'); setActiveOverlay('Quarto'); }} />
                <NavButton type="shop" onClick={() => { soundManager.playSound('click'); setActiveOverlay('Loja'); }} />
            </nav>
        </div>
    );
}
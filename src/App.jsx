import React, { useState, useEffect, useCallback, useRef } from 'react';
import julioImage from './assets/julio.png';
import { initializeApp, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { motion, AnimatePresence } from 'framer-motion';

// =================================================================================
// CONFIGURAÇÃO DO SEU PROJETO FIREBASE (JÁ PREENCHIDA)
// =================================================================================
const firebaseConfig = {
    apiKey: "AIzaSyDoQuz7iGruDuuH4Nttnr2OLvYoGwxdCCQ",
    authDomain: "jogo-do-julio.firebaseapp.com",
    projectId: "jogo-do-julio",
    storageBucket: "jogo-do-julio.firebasestorage.app",
    messagingSenderId: "971672533201",
    appId: "1:971672533201:web:42102eaf7b6d1badf0",
    measurementId: "G-TB1FLNKMCS"
};
// =================================================================================
// Chave publicável do Stripe (JÁ PREENCHIDA)
const stripePublicKey = "pk_test_51RwNzjRYFnX592EO5TlJ5pb1fzDnVKD8Jsp1DVssKSvs7aTqegqCdcywjCmLkyvfkmck0AgE7Kx2U706pNjTdUeg002wLT66Ju";
// =================================================================================

// --- DADOS DO JOGO ---
const gameItems = {
    'maca': { name: 'Maçã', price: 10, icon: '🍎', type: 'food', effect: { stat: 'hunger', value: 15 }, feedback: 'Yum!' },
    'frango': { name: 'Frango Assado', price: 25, icon: '🍗', type: 'food', effect: { stat: 'hunger', value: 40 }, feedback: 'Delícia!' },
    'sabonete': { name: 'Sabonete', price: 15, icon: '🧼', type: 'hygiene', effect: { stat: 'hygiene', value: 50 }, feedback: 'Limpinho!' },
    'bola': { name: 'Bola', price: 30, icon: '⚽', type: 'fun', effect: { stat: 'fun', value: 30 }, feedback: 'Divertido!' },
    'videogame': { name: 'Video-game', price: 70, icon: '🎮', type: 'fun', effect: { stat: 'fun', value: 60 }, feedback: 'Uau!' },
    'remedio': { name: 'Remédio', price: 50, icon: '💊', type: 'health', effect: { stat: 'health', value: 40 }, feedback: 'Melhor agora!' },
    'fundo_praia': { name: 'Fundo Praia', price: 150, icon: '🏖️', type: 'background', value: 'bg-blue-200' },
    'fundo_espaco': { name: 'Fundo Espaço', price: 200, icon: '🚀', type: 'background', value: 'bg-gray-800' },
};

const coinPackages = [{
    id: 'price_1RwO74RYFnX592EOdPrWT0rA', // <-- IMPORTANTE: SUBSTITUA PELO SEU PRICE ID REAL
    name: '500 Moedas',
    price: 'R$ 5,00',
    icon: '💰',
    amount: 500
}];

// --- COMPONENTES ---

const NavIcon = ({ type }) => {
    const icons = {
        home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
        kitchen: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 2a8.003 8.003 0 016.014 3.014C20.5 7 21 10 21 12c-2 0-2.962-.31-4.343-1.343z" />,
        bathroom: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6.343A4.5 4.5 0 0116.5 10.5 4.5 4.5 0 0112 14.657 4.5 4.5 0 017.5 10.5 4.5 4.5 0 0112 6.343z" />,
        playroom: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />,
        bedroom: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />,
        shop: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />,
    };
    return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {icons?.[type]}
        </svg>
    );
};

const StatusBar = ({ value, colorClass }) => (
    <div className="w-full bg-gray-200/80 rounded-full h-2.5 shadow-inner">
        <motion.div className={`h-full rounded-full ${colorClass}`} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.5, ease: "easeInOut" }} />
    </div>
);

const JulioCharacter = ({ isSleeping, status }) => {
    const julioVariants = {
        awake: {
            scale: [1, 1.02, 1],
            rotate: [0, -1, 1, 0],
            transition: {
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }
        },
        sleeping: {
            scale: [1, 1.01, 1],
            rotate: 2,
            opacity: 0.7,
            transition: {
                scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                duration: 2,
            }
        },
        sad: {
            rotate: [0, 1, -1, 0],
            opacity: 0.8,
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    let animationState = 'awake';
    if (isSleeping) {
        animationState = 'sleeping';
    } else if (status.hunger < 30 || status.fun < 30 || status.hygiene < 30) {
        animationState = 'sad';
    }

    return (
        <motion.img
            src={julioImage}
            alt="Julio"
            className="w-48 h-48 object-contain"
            variants={julioVariants}
            animate={animationState}
        />
    );
};

const usePlayerState = (userId) => {
    const [playerState, setPlayerState] = useState(null);
    useEffect(() => {
        if (!userId) return;
        const playerDocRef = doc(getFirestore(), "players", userId);
        const unsubscribe = onSnapshot(playerDocRef, (doc) => {
            if (!doc.exists()) {
                const initialState = {
                    stats: { health: 100, hunger: 80, hygiene: 70, fun: 90, energy: 60 },
                    coins: 100, isSleeping: false,
                    customization: { background: 'bg-green-200' },
                    inventory: { 'maca': 2, 'sabonete': 1, 'bola': 1 },
                    backgroundsOwned: ['bg-green-200']
                };
                setDoc(playerDocRef, initialState);
            } else { setPlayerState(doc.data()); }
        });
        return () => unsubscribe();
    }, [userId]);
    const updatePlayerState = useCallback(async (newData) => {
        if (!userId) return;
        const playerDocRef = doc(getFirestore(), "players", userId);
        await updateDoc(playerDocRef, newData);
    }, [userId]);
    return [playerState, updatePlayerState];
};

const Overlay = ({ title, onClose, children }) => (
    <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
        className="absolute bottom-0 left-0 right-0 h-[75%] bg-white/80 backdrop-blur-md rounded-t-3xl p-4 flex flex-col shadow-2xl"
    >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
            <button onClick={onClose} className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-amber-100">{children}</div>
    </motion.div>
);

const ItemCard = ({ children, onClick, disabled = false }) => (
    <div onClick={!disabled ? onClick : null} className={`bg-white/80 p-4 rounded-xl shadow-md flex flex-col items-center justify-between text-center transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'}`}>
        {children}
    </div>
);

const Shop = ({ playerState, updatePlayerState, onBuyCoins }) => {
    const handleBuyItem = (itemId) => {
        const item = gameItems?.[itemId];
        if (!item) return;
        if (playerState?.coins < item.price) {
            alert("Moedas insuficientes!"); return;
        }
        const newCoins = playerState.coins - item.price;
        if (item.type === 'background') {
            updatePlayerState({ coins: newCoins, backgroundsOwned: arrayUnion(item.value) });
        } else {
            const currentAmount = playerState?.inventory?.[itemId] || 0;
            updatePlayerState({ coins: newCoins, [`inventory.${itemId}`]: currentAmount + 1 });
        }
        alert(`${item.name} comprado com sucesso!`);
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
                        <div><div className="text-2xl">{pkg.icon}</div><p className="font-bold text-lg">{pkg.name}</p></div>
                        <div className="bg-white/30 text-white font-bold py-2 px-4 rounded-full">{pkg.price}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

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

const InteractionFeedback = ({ text }) => (
    <motion.div
        key={text}
        className="absolute z-40 text-2xl font-bold text-yellow-500"
        style={{ textShadow: '1px 1px 2px black' }}
        initial={{ y: 0, opacity: 1, scale: 0.8 }}
        animate={{ y: -50, opacity: 0, scale: 1.2 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
    >
        {text}
    </motion.div>
);

const RoomComponent = ({ playerState, itemType, emptyMessage, onUseItem }) => {
    const items = Object.keys(playerState?.inventory || {})
                      .filter(key => gameItems?.[key]?.type === itemType && playerState.inventory?.[key] > 0);

    if (!playerState || !playerState.inventory) return <p className="text-center text-gray-500">A carregar...</p>;
    if (items.length === 0) return <p className="text-center text-gray-500">{emptyMessage}</p>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {items.map(itemId => {
                const item = gameItems?.[itemId];
                return (
                    <ItemCard key={itemId} onClick={() => onUseItem(itemId)}>
                        <div className="text-4xl mb-2">{item?.icon}</div>
                        <p className="font-semibold text-gray-700">{item?.name}</p>
                        <p className="text-sm text-gray-500">Quantidade: {playerState.inventory?.[itemId]}</p>
                    </ItemCard>
                );
            })}
        </div>
    );
};

const Bedroom = ({ playerState, updatePlayerState, onSleep }) => {
    const { backgroundsOwned = [], customization } = playerState || {};
    const handleSetBackground = (bgClass) => {
        updatePlayerState({ 'customization.background': bgClass });
    };
    return (
        <div>
            <button onClick={onSleep} className="w-full bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl mb-6 hover:bg-indigo-600 transition-colors shadow-lg">
                {playerState?.isSleeping ? 'Acordar Julio 🌙' : 'Pôr Julio a Dormir ☀️'}
            </button>
            <h3 className="text-lg font-semibold text-gray-600 mb-3">Mudar Fundo</h3>
            <div className="grid grid-cols-2 gap-3">
                {backgroundsOwned?.map(bg => (
                    <div key={bg} onClick={() => handleSetBackground(bg)} className={`h-24 rounded-lg cursor-pointer border-4 ${customization?.background === bg ? 'border-amber-400' : 'border-transparent'} ${bg}`}></div>
                ))}
            </div>
        </div>
    );
};


export default function App() {
    const [userId, setUserId] = useState(null);
    const [playerState, updatePlayerState] = usePlayerState(userId);
    const [activeOverlay, setActiveOverlay] = useState(null);
    const [draggableItem, setDraggableItem] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const mainRef = useRef(null);
    const julioRef = useRef(null);

    useEffect(() => {
        if (firebaseConfig.apiKey.includes("SUA_API_KEY")) return;
        try {
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            onAuthStateChanged(auth, user => setUserId(user?.uid), console.error);
            signInAnonymously(auth).catch(console.error);
        } catch (e) { if (!getApp()) console.error("Firebase not initialized"); }
    }, []);

    const gameLoop = useCallback(() => {
        if (!playerState) return;
        let newStats = { ...playerState.stats };
        if (playerState.isSleeping) {
            newStats.energy = Math.min(100, newStats.energy + 1.0);
        } else {
            newStats.hunger = Math.max(0, newStats.hunger - 0.5);
            newStats.hygiene = Math.max(0, newStats.hygiene - 0.3);
            newStats.fun = Math.max(0, newStats.fun - 0.4);
            newStats.energy = Math.max(0, newStats.energy - 0.2);
            if (newStats.hunger < 20 || newStats.hygiene < 20) {
                newStats.health = Math.max(0, newStats.health - 0.5);
            }
        }
        updatePlayerState({ stats: newStats });
    }, [playerState, updatePlayerState]);

    useEffect(() => {
        const interval = setInterval(gameLoop, 5000);
        return () => clearInterval(interval);
    }, [gameLoop]);

    const handleAction = useCallback((stat, value) => {
        if (!playerState || playerState.isSleeping) return;
        const newStats = { ...playerState.stats };
        newStats[stat] = Math.min(100, (newStats[stat] || 0) + value);
        if (stat !== 'energy') newStats.energy = Math.max(0, newStats.energy - 2);
        updatePlayerState({ stats: newStats });
    }, [playerState, updatePlayerState]);

    const handleSleep = useCallback(() => {
        if (!playerState) return;
        updatePlayerState({ isSleeping: !playerState.isSleeping });
    }, [playerState, updatePlayerState]);

    const handleBuyCoins = useCallback(async (priceId) => {
        if(!priceId || priceId.includes('SEU_PRICE_ID')) {
            alert("Erro: O ID de preço do Stripe não foi configurado corretamente no código."); return;
        }
        const functions = getFunctions(getApp());
        const createStripeCheckout = httpsCallable(functions, 'createStripeCheckout');
        try {
            const { data } = await createStripeCheckout({ priceId, success_url: window.location.href, cancel_url: window.location.href });
            const stripe = await window.Stripe(stripePublicKey);
            await stripe.redirectToCheckout({ sessionId: data?.id });
        } catch (error) {
            console.error("Erro no Stripe Checkout:", error);
            alert("Ocorreu um erro ao iniciar a compra.");
        }
    }, []);

    const handleUseItem = (itemId) => {
        const item = gameItems[itemId];
        if (item) {
            setDraggableItem({ id: itemId, icon: item.icon });
            setActiveOverlay(null);
        }
    };

    const handleItemDrop = (info, item) => {
        const julioRect = julioRef.current.getBoundingClientRect();
        const draggedPoint = { x: info.point.x, y: info.point.y };

        if (
            draggedPoint.x > julioRect.left &&
            draggedPoint.x < julioRect.right &&
            draggedPoint.y > julioRect.top &&
            draggedPoint.y < julioRect.bottom
        ) {
            const itemData = gameItems[item.id];
            handleAction(itemData.effect.stat, itemData.effect.value);
            const currentAmount = playerState.inventory[item.id];
            updatePlayerState({ [`inventory.${item.id}`]: currentAmount - 1 });
            setFeedback(itemData.feedback);
            setTimeout(() => setFeedback(null), 1500);
        }
        setDraggableItem(null);
    };

    const NavButton = ({ type, onClick }) => (
        <button onClick={onClick} className="bg-amber-100/80 p-3 rounded-lg shadow-md text-amber-800 hover:bg-amber-200/80 transition-colors flex items-center justify-center">
            <NavIcon type={type} />
        </button>
    );

    const renderOverlayContent = () => {
        const commonProps = { playerState, onUseItem: handleUseItem };
        switch (activeOverlay) {
            case 'Loja': return <Shop playerState={playerState} updatePlayerState={updatePlayerState} onBuyCoins={handleBuyCoins} />;
            case 'Cozinha': return <RoomComponent {...commonProps} itemType="food" emptyMessage="Não tem comida. Visite a loja! 🛒" />;
            case 'Casa de Banho': return <RoomComponent {...commonProps} itemType="hygiene" emptyMessage="Não tem itens de higiene. 🛒" />;
            case 'Sala de Jogos': return <RoomComponent {...commonProps} itemType="fun" emptyMessage="Não tem brinquedos. Visite a loja! 🛒" />;
            case 'Quarto': return <Bedroom playerState={playerState} updatePlayerState={updatePlayerState} onSleep={handleSleep} />;
            default: return null;
        }
    };
    
    if (!playerState) {
        return <div className="w-full max-w-sm mx-auto h-[95vh] max-h-[800px] bg-white/70 rounded-3xl shadow-2xl p-6 flex items-center justify-center"><div className="text-center"><div className="text-4xl animate-spin">🐾</div><p className="text-lg mt-2">A carregar o Jogo...</p></div></div>;
    }

    const backgroundClass = playerState?.customization?.background || 'bg-green-200';
    return (
        <div className={`w-full max-w-sm mx-auto h-[95vh] max-h-[800px] flex flex-col font-sans overflow-hidden ${backgroundClass} rounded-3xl shadow-2xl p-4 border-4 border-amber-300 transition-colors duration-500`}>
            <header className="flex justify-between items-center mb-2 flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-700">A Cuidar do Julio</h1>
                <div className="text-lg bg-yellow-400 text-white px-4 py-1 rounded-full shadow flex items-center">💰<span className="ml-2 font-semibold">{playerState?.coins}</span></div>
            </header>
            <div className="grid grid-cols-[20px,1fr] gap-x-2 gap-y-1 items-center mb-4 flex-shrink-0 text-pink-600">
                <span>❤️</span><StatusBar value={playerState?.stats?.health} colorClass="bg-pink-500" />
                <span className="text-orange-600">🍖</span><StatusBar value={playerState?.stats?.hunger} colorClass="bg-orange-500" />
                <span className="text-cyan-600">🧼</span><StatusBar value={playerState?.stats?.hygiene} colorClass="bg-cyan-500" />
                <span className="text-yellow-600">🎾</span><StatusBar value={playerState?.stats?.fun} colorClass="bg-yellow-500" />
                <span className="text-lime-600">⚡</span><StatusBar value={playerState?.stats?.energy} colorClass="bg-lime-500" />
            </div>
            
            <main ref={mainRef} className="flex-grow relative flex flex-col items-center justify-center my-2 overflow-hidden">
                <div className="relative flex items-center justify-center">
                    <div ref={julioRef}>
                        <JulioCharacter isSleeping={playerState?.isSleeping} status={playerState?.stats} />
                    </div>
                    {feedback && <InteractionFeedback text={feedback} />}
                </div>

                {draggableItem && (
                    <DraggableItem 
                        item={draggableItem}
                        onDragEnd={handleItemDrop}
                        constraintsRef={mainRef}
                    />
                )}
                
                <div className="absolute bottom-0 text-center mb-4">
                    <p className="text-gray-600 font-semibold bg-white/50 px-3 py-1 rounded-full">
                        {playerState?.isSleeping ? "Julio está a dormir... Zzz" : "Relaxa com o Julio!"}
                    </p>
                </div>
                <AnimatePresence>
                    {activeOverlay && (
                        <Overlay title={activeOverlay} onClose={() => setActiveOverlay(null)}>
                           {renderOverlayContent()}
                        </Overlay>
                    )}
                </AnimatePresence>
            </main>

            <nav className="grid grid-cols-6 gap-2 mt-4 flex-shrink-0">
                <NavButton type="home" onClick={() => setActiveOverlay(null)} />
                <NavButton type="kitchen" onClick={() => setActiveOverlay('Cozinha')} />
                <NavButton type="bathroom" onClick={() => setActiveOverlay('Casa de Banho')} />
                <NavButton type="playroom" onClick={() => setActiveOverlay('Sala de Jogos')} />
                <NavButton type="bedroom" onClick={() => setActiveOverlay('Quarto')} />
                <NavButton type="shop" onClick={() => setActiveOverlay('Loja')} />
            </nav>
        </div>
    );
}
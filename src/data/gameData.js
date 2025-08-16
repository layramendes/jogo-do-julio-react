// src/data/gameData.js

export const firebaseConfig = {
    apiKey: "AIzaSyDoQuz7iGruDuuH4Nttnr2OLvYoGwxdCCQ",
    authDomain: "jogo-do-julio.firebaseapp.com",
    projectId: "jogo-do-julio",
    storageBucket: "jogo-do-julio.firebasestorage.app",
    messagingSenderId: "971672533201",
    appId: "1:971672533201:web:42102eaf7b6d1badf0",
    measurementId: "G-TB1FLNKMCS"
};

export const stripePublicKey = "pk_test_51RwNzjRYFnX592EO5TlJ5pb1fzDnVKD8Jsp1DVssKSvs7aTqegqCdcywjCmLkyvfkmck0AgE7Kx2U706pNjTdUeg002wLT66Ju";

export const gameItems = {
    'maca': { name: 'Maçã', price: 10, icon: '🍎', type: 'food', effect: { stat: 'hunger', value: 15 }, feedback: 'Yum!' },
    'frango': { name: 'Frango Assado', price: 25, icon: '🍗', type: 'food', effect: { stat: 'hunger', value: 40 }, feedback: 'Delícia!' },
    'sabonete': { name: 'Sabonete', price: 15, icon: '🧼', type: 'hygiene', effect: { stat: 'hygiene', value: 50 }, feedback: 'Limpinho!' },
    'bola': { name: 'Bola', price: 30, icon: '⚽', type: 'fun', effect: { stat: 'fun', value: 30 }, feedback: 'Divertido!' },
    'videogame': { name: 'Video-game', price: 70, icon: '🎮', type: 'fun', effect: { stat: 'fun', value: 60 }, feedback: 'Uau!' },
    'remedio': { name: 'Remédio', price: 50, icon: '💊', type: 'health', effect: { stat: 'health', value: 40 }, feedback: 'Melhor agora!' },
    'fundo_praia': { name: 'Fundo Praia', price: 150, icon: '🏖️', type: 'background', value: 'bg-blue-200' },
    'fundo_espaco': { name: 'Fundo Espaço', price: 200, icon: '🚀', type: 'background', value: 'bg-gray-800' },
};

export const coinPackages = [{
    id: 'price_1RwO74RYFnX592EOdPrWT0rA',
    name: '500 Moedas',
    price: 'R$ 5,00',
    icon: '💰',
    amount: 500
}];

export const soundManager = {
  sounds: {
    eat: new Audio('https://www.myinstants.com/media/sounds/bite-sound-effect.mp3'),
    clean: new Audio('https://www.myinstants.com/media/sounds/bubble-wrap-pop.mp3'),
    pet: new Audio('https://www.myinstants.com/media/sounds/pling-sound-effect.mp3'),
    buy: new Audio('https://www.myinstants.com/media/sounds/cash-register-sound-effect-freetamilringtones-net.mp3'),
    click: new Audio('https://www.myinstants.com/media/sounds/mouse-click-sound-effect-2.mp3'),
    poop: new Audio('https://www.myinstants.com/media/sounds/fart-sound-effect.mp3'),
    foam: new Audio('https://www.myinstants.com/media/sounds/pop-sound-effect.mp3')
  },
  playSound: (soundName) => {
    try {
      const sound = soundManager.sounds[soundName];
      sound.currentTime = 0;
      sound.play().catch(e => console.error(`Error playing sound ${soundName}:`, e));
    } catch (e) {
      console.error(`Sound ${soundName} not found.`);
    }
  }
};
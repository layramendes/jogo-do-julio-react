import eatSound from '../assets/sounds/eat.mp3';
import cleanSound from '../assets/sounds/clean.mp3';
import petSound from '../assets/sounds/pet.mp3';
import buySound from '../assets/sounds/buy.mp3';
import clickSound from '../assets/sounds/click.mp3';
import poopSound from '../assets/sounds/poop.mp3';

// =================================================================================
// CONFIGURAÇÃO DO FIREBASE
// =================================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyDoQuz7iGruDuuH4Nttnr2OLvYoGwxdCCQ",
  authDomain: "jogo-do-julio.firebaseapp.com",
  projectId: "jogo-do-julio",
  storageBucket: "jogo-do-julio.firebasestorage.app",
  messagingSenderId: "971672533201",
  appId: "1:971672533201:web:42102eaf7b6d1badf0",
  measurementId: "G-TB1FLNKMCS"
};

// =================================================================================
// CHAVE PUBLICÁVEL DO STRIPE
// =================================================================================
export const stripePublicKey = "pk_test_51RwNzjRYFnX592EO5TlJ5pb1fzDnVKD8Jsp1DVssKSvs7aTqegqCdcywjCmLkyvfkmck0AgE7Kx2U706pNjTdUeg002wLT66Ju";

// =================================================================================
// DADOS DOS ITENS DO JOGO
// =================================================================================
export const gameItems = {
  'maca': { name: 'Maçã', price: 10, icon: '🍎', type: 'food', effect: { stat: 'hunger', value: 15 }, feedback: 'Yum!' },
  'frango': { name: 'Frango Assado', price: 25, icon: '🍗', type: 'food', effect: { stat: 'hunger', value: 40 }, feedback: 'Delícia!' },
  'sabonete': { name: 'Sabonete', price: 15, icon: '🧼', type: 'hygiene', effect: { stat: 'hygiene', value: 50 }, feedback: 'Limpinho!' },
  'bola': { name: 'Bola', price: 30, icon: '⚽', type: 'fun', effect: { stat: 'fun', value: 30 }, feedback: 'Divertido!' },
  'videogame': { name: 'Video-game', price: 70, icon: '🎮', type: 'fun', effect: { stat: 'fun', value: 60 }, feedback: 'Uau!' },
  'remedio': { name: 'Remédio', price: 50, icon: '💊', type: 'health', effect: { stat: 'health', value: 40 }, feedback: 'Melhor agora!' },
  'fundo_praia': { name: 'Fundo Praia', price: 150, icon: '🏖️', type: 'background', value: 'bg-blue-200' },
  'fundo_espaco': { name: 'Fundo Espaço', price: 200, icon: '🚀', type: 'background', value: 'bg-gray-800' },
  'chapeu_bob': { name: 'Chapéu Bob', price: 100, icon: '🎩', type: 'accessory', category: 'hat' },
  'oculos_descolado': { name: 'Óculos Descolado', price: 120, icon: '😎', type: 'accessory', category: 'glasses' },
};

// =================================================================================
// PACOTES DE MOEDAS
// =================================================================================
export const coinPackages = [{
  id: 'price_1RwO74RYFnX592EOdPrWT0rA', // Lembre-se de usar o seu Price ID real do Stripe
  name: '500 Moedas',
  price: 'R$ 4,99',
  icon: '💰',
  amount: 500
}];

// =================================================================================
// GESTOR DE SONS
// =================================================================================
export const soundManager = {
  sounds: {
    eat: new Audio(eatSound),
    clean: new Audio(cleanSound),
    pet: new Audio(petSound),
    buy: new Audio(buySound),
    click: new Audio(clickSound),
    poop: new Audio(poopSound),
    foam: new Audio(cleanSound) // Reutiliza o som de 'clean' para a espuma
  },
  playSound: (soundName) => {
    try {
      const sound = soundManager.sounds[soundName];
      sound.currentTime = 0; // Permite que o som toque novamente do início
      sound.play().catch(e => {
        // Ignora o erro comum "The request is not allowed by the user agent" que acontece
        // quando o utilizador ainda não interagiu com a página.
        if (e.name !== 'NotAllowedError') {
          console.error(`Error playing sound ${soundName}:`, e)
        }
      });
    } catch (e) {
      console.error(`Sound ${soundName} not found.`);
    }
  }
};
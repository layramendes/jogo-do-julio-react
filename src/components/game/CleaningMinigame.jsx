// src/components/game/CleaningMinigame.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { throttle } from '../../utils/throttle';
import DirtPatch from './DirtPatch';
import FoamParticle from './FoamParticle';
import { soundManager } from '../../data/gameData';

const CleaningMinigame = ({ onFinish, julioRect }) => {
    const [dirtPatches, setDirtPatches] = useState([]);
    const [foamPatches, setFoamPatches] = useState([]);
    const [cleaningPhase, setCleaningPhase] = useState('soaping');
    const toolRef = useRef(null);
    const dirtPatchRefs = useRef([]);

    useEffect(() => {
        const newPatches = Array.from({ length: 7 }).map((_, i) => ({
            id: i,
            style: { top: `${Math.random() * 80}%`, left: `${Math.random() * 80}%` },
            health: 15
        }));
        setDirtPatches(newPatches);
        dirtPatchRefs.current = newPatches.map(() => React.createRef());
    }, []);
    
    const handleDrag = useMemo(() => throttle((toolRect) => {
        if (cleaningPhase === 'soaping') {
            let dirtCleaned = false;
            const newDirtState = dirtPatches.map((patch, index) => {
                const patchEl = dirtPatchRefs.current[index]?.current;
                if (!patchEl || patch.health <= 0) return patch;
                
                const patchRect = patchEl.getBoundingClientRect();
                const isColliding = !(toolRect.right < patchRect.left || toolRect.left > patchRect.right || toolRect.bottom < patchRect.top || toolRect.top > patchRect.bottom);

                if (isColliding) {
                    dirtCleaned = true;
                    return { ...patch, health: patch.health - 1 };
                }
                return patch;
            });

            if (dirtCleaned) {
                const justCleaned = dirtPatches.find((oldPatch, i) => oldPatch.health > 0 && newDirtState[i].health <= 0);
                if (justCleaned) {
                    soundManager.playSound('foam');
                    setFoamPatches(prev => [...prev, { id: `foam-${justCleaned.id}`, style: justCleaned.style }]);
                }
                const remainingDirt = newDirtState.filter(p => p.health > 0);
                setDirtPatches(remainingDirt);
                if (remainingDirt.length === 0) {
                    setCleaningPhase('rinsing');
                }
            }
        } else if (cleaningPhase === 'rinsing') {
            const remainingFoam = foamPatches.filter(foam => {
                const foamRect = {
                    top: julioRect.top + (parseFloat(foam.style.top) / 100) * julioRect.height,
                    left: julioRect.left + (parseFloat(foam.style.left) / 100) * julioRect.width,
                    width: 32, height: 32
                };
                const isColliding = !(toolRect.right < foamRect.left || toolRect.left > foamRect.right || toolRect.bottom < foamRect.top || toolRect.top > foamRect.bottom);
                return !isColliding;
            });
            if (remainingFoam.length < foamPatches.length) {
                setFoamPatches(remainingFoam);
                if (remainingFoam.length === 0) {
                    onFinish();
                }
            }
        }
    }, 50), [dirtPatches, foamPatches, cleaningPhase, onFinish, julioRect]);

    const gameAreaStyle = { position: 'absolute', top: julioRect.top, left: julioRect.left, width: julioRect.width, height: julioRect.height };

    return (
        <div style={gameAreaStyle} className="z-30">
            <AnimatePresence>
                {cleaningPhase === 'soaping' && (<motion.div ref={toolRef} className="absolute text-6xl z-50 cursor-grab" style={{ top: '70%', left: '40%' }} drag onDrag={(e, info) => handleDrag(toolRef.current.getBoundingClientRect())} whileDrag={{ scale: 1.2, cursor: 'grabbing' }}>🧼</motion.div>)}
            </AnimatePresence>
            <AnimatePresence>
                {cleaningPhase === 'rinsing' && (<motion.div ref={toolRef} className="absolute text-6xl z-50 cursor-grab" style={{ top: '70%', left: '40%' }} drag onDrag={(e, info) => handleDrag(toolRef.current.getBoundingClientRect())} whileDrag={{ scale: 1.2, cursor: 'grabbing' }}>🚿</motion.div>)}
            </AnimatePresence>
            <AnimatePresence>
                {dirtPatches.map((patch, index) => (<DirtPatch key={patch.id} ref={dirtPatchRefs.current[index]} style={patch.style} health={patch.health} />))}
            </AnimatePresence>
            <AnimatePresence>
                {foamPatches.map(foam => (<FoamParticle key={foam.id} style={foam.style} />))}
            </AnimatePresence>
        </div>
    );
};

export default CleaningMinigame;
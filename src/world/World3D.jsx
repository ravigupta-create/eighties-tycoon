import { useRef, useEffect, useState } from 'react';
import { WorldEngine } from './engine';
import { getRank } from '../career';
import { getReputationTier } from '../luxuryShop';

export default function World3D({ state, dispatch, onExit, onInteractTab }) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const [showHelp, setShowHelp] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [nearbyName, setNearbyName] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new WorldEngine(containerRef.current);
    engine.init();
    engine.start();
    engineRef.current = engine;

    // Set interaction callback
    engine.onInteract = (tab) => {
      if (onInteractTab) onInteractTab(tab);
    };

    // Sync game state into 3D
    engine.updateGameState(state);

    // Track pointer lock
    const onLockChange = () => {
      setIsLocked(document.pointerLockElement === engine.renderer.domElement);
    };
    document.addEventListener('pointerlockchange', onLockChange);

    // Tab to exit
    const onKey = (e) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        onExit();
      }
    };
    document.addEventListener('keydown', onKey);

    // Proximity check interval (for UI prompt)
    const proximityInterval = setInterval(() => {
      if (!engine.running) return;
      const lm = engine.getNearbyLandmark();
      setNearbyName(lm ? lm.userData.landmarkName : null);
    }, 200);

    const helpTimer = setTimeout(() => setShowHelp(false), 6000);

    return () => {
      clearTimeout(helpTimer);
      clearInterval(proximityInterval);
      document.removeEventListener('pointerlockchange', onLockChange);
      document.removeEventListener('keydown', onKey);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Sync state changes into engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateGameState(state);
    }
  }, [state.luxuryItems, state.properties, state.reputation]);

  const handleClick = () => {
    if (engineRef.current && !isLocked) {
      engineRef.current.controls.requestPointerLock();
    }
  };

  const rank = getRank(state.career?.rankIndex || 0);
  const repTier = getReputationTier(state.reputation || 0);

  return (
    <div className="fixed inset-0 z-30 bg-black">
      <div ref={containerRef} className="w-full h-full cursor-crosshair" onClick={handleClick} />

      {/* Click to look prompt */}
      {!isLocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="bg-black/70 border border-amber rounded-lg px-6 py-4 text-center pointer-events-auto cursor-pointer" onClick={handleClick}>
            <p className="text-amber font-[family-name:var(--font-crt)] text-lg mb-1">CLICK TO EXPLORE</p>
            <p className="text-phosphor-dim font-[family-name:var(--font-crt)] text-xs">Click anywhere to enable mouse look</p>
          </div>
        </div>
      )}

      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="flex justify-between items-start p-3">
          {/* Left: Stats */}
          <div className="bg-black/70 border border-crt-border rounded px-3 py-2 pointer-events-auto">
            <div className="flex items-center gap-3 text-xs font-[family-name:var(--font-crt)] mb-1">
              <span className="text-phosphor text-glow">${(state.cash || 0).toLocaleString()}</span>
              <span className="text-amber">HP: {state.health}%</span>
              <span className="text-[#00ffff]">JOY: {state.happiness}%</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-[family-name:var(--font-crt)]">
              <span className="text-amber-dim">{rank.icon} {rank.name}</span>
              <span className="text-phosphor-dim">{state.reputation || 0} REP</span>
              <span className="text-phosphor-dim">{state.year}</span>
            </div>
          </div>

          {/* Right: Exit button */}
          <button onClick={onExit}
            className="bg-black/70 border border-phosphor rounded px-3 py-2 text-phosphor font-[family-name:var(--font-crt)] text-xs cursor-pointer hover:bg-phosphor hover:text-black transition-all pointer-events-auto"
          >[ TERMINAL ] Tab</button>
        </div>
      </div>

      {/* Interaction Prompt */}
      {nearbyName && isLocked && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-black/80 border border-amber rounded-lg px-5 py-3 text-center animate-pulse">
            <p className="text-amber font-[family-name:var(--font-crt)] text-sm font-bold">{nearbyName}</p>
            <p className="text-phosphor font-[family-name:var(--font-crt)] text-xs mt-1">Press <span className="text-amber">E</span> to enter</p>
          </div>
        </div>
      )}

      {/* Controls help */}
      {showHelp && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-black/70 border border-crt-border rounded-lg px-6 py-3 text-center">
            <div className="flex gap-5 text-xs font-[family-name:var(--font-crt)]">
              <span className="text-phosphor"><span className="text-amber">WASD</span> Move</span>
              <span className="text-phosphor"><span className="text-amber">MOUSE</span> Look</span>
              <span className="text-phosphor"><span className="text-amber">SHIFT</span> Sprint</span>
              <span className="text-phosphor"><span className="text-amber">E</span> Interact</span>
              <span className="text-phosphor"><span className="text-amber">TAB</span> Terminal</span>
            </div>
          </div>
        </div>
      )}

      {/* Crosshair */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="relative">
            <div className="w-0.5 h-4 bg-phosphor/70 absolute -translate-x-1/2 -translate-y-1/2" />
            <div className="h-0.5 w-4 bg-phosphor/70 absolute -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}
    </div>
  );
}

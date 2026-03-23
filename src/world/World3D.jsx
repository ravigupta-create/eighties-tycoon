import { useRef, useEffect, useState } from 'react';
import { WorldEngine } from './engine';

/**
 * React wrapper for the 3D world.
 * Manages lifecycle, pointer lock, and HUD overlay.
 */
export default function World3D({ state, dispatch, onExit }) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const [showHelp, setShowHelp] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new WorldEngine(containerRef.current);
    engine.init();
    engine.start();
    engineRef.current = engine;

    // Track pointer lock state
    const onLockChange = () => {
      setIsLocked(document.pointerLockElement === engine.renderer.domElement);
    };
    document.addEventListener('pointerlockchange', onLockChange);

    // ESC to exit world (when not pointer-locked)
    const onKey = (e) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        onExit();
      }
    };
    document.addEventListener('keydown', onKey);

    // Hide help after 5 seconds
    const helpTimer = setTimeout(() => setShowHelp(false), 6000);

    return () => {
      clearTimeout(helpTimer);
      document.removeEventListener('pointerlockchange', onLockChange);
      document.removeEventListener('keydown', onKey);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleClick = () => {
    if (engineRef.current && !isLocked) {
      engineRef.current.controls.requestPointerLock();
    }
  };

  return (
    <div className="fixed inset-0 z-30 bg-black">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-crosshair"
        onClick={handleClick}
      />

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
        <div className="flex justify-between items-start p-4">
          {/* Left: Stats */}
          <div className="bg-black/60 border border-crt-border rounded px-3 py-2 pointer-events-auto">
            <div className="flex items-center gap-4 text-xs font-[family-name:var(--font-crt)]">
              <span className="text-phosphor">${(state.cash || 0).toLocaleString()}</span>
              <span className="text-amber">HP: {state.health}%</span>
              <span className="text-[#00ffff]">JOY: {state.happiness}%</span>
              <span className="text-amber-dim">{state.reputation || 0} REP</span>
            </div>
          </div>

          {/* Right: Exit button */}
          <button
            onClick={onExit}
            className="bg-black/60 border border-phosphor rounded px-3 py-2 text-phosphor font-[family-name:var(--font-crt)] text-xs cursor-pointer hover:bg-phosphor hover:text-black transition-all pointer-events-auto"
          >
            [ TERMINAL ] Tab
          </button>
        </div>
      </div>

      {/* Bottom: Controls help */}
      {showHelp && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-black/70 border border-crt-border rounded-lg px-6 py-3 text-center">
            <div className="flex gap-6 text-xs font-[family-name:var(--font-crt)]">
              <span className="text-phosphor"><span className="text-amber">W A S D</span> Move</span>
              <span className="text-phosphor"><span className="text-amber">MOUSE</span> Look</span>
              <span className="text-phosphor"><span className="text-amber">SHIFT</span> Sprint</span>
              <span className="text-phosphor"><span className="text-amber">TAB</span> Terminal</span>
              <span className="text-phosphor"><span className="text-amber">ESC</span> Release Mouse</span>
            </div>
          </div>
        </div>
      )}

      {/* Crosshair */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="w-1 h-1 bg-phosphor rounded-full shadow-[0_0_4px_#33ff33,0_0_8px_#33ff33]" />
        </div>
      )}
    </div>
  );
}

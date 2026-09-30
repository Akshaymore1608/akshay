import React, { useState, useRef, useEffect } from 'react';
import { playBoingSound, playScreechBeep, playErrorBuzzer } from '../utils/audio';

const TAUNTS = [
  "Submit Soil Sample",
  "🏃 TOO SLOW, FARMER!",
  "🌾 MISSED BY AN ACRE!",
  "⚠️ QUANTUM EVASION ACTIVE",
  "🚜 TRACTOR TOO FAST!",
  "💩 OOPS! STEPPED IN MANURE!",
  "🧪 SOIL SAMPLE DODGED!",
  "⚡ ENTANGLEMENT SLIP!",
  "🌽 CORN CANNOT BE CLICKED",
];

export default function EvasiveButton({
  originalText = "Submit Soil Sample",
  className = "",
  onSuccessfulClick,
  onResetTriggered,
}) {
  const [pos, setPos] = useState(null); // null means normal in-flow, otherwise fixed {x, y}
  const [tauntIndex, setTauntIndex] = useState(0);
  const [dodgeCount, setDodgeCount] = useState(0);
  const btnRef = useRef(null);

  // Proximity dodge listener
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

      // If user comes within 90 pixels, trigger evasive leap!
      if (dist < 90) {
        dodge();
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [tauntIndex]);

  const dodge = () => {
    playBoingSound();

    // Pick new random coordinates away from edges
    const padding = 100;
    const maxX = Math.max(200, window.innerWidth - 300);
    const maxY = Math.max(200, window.innerHeight - 150);

    const newX = Math.floor(padding + Math.random() * (maxX - padding));
    const newY = Math.floor(padding + Math.random() * (maxY - padding));

    setPos({ x: newX, y: newY });
    setTauntIndex((prev) => (prev + 1) % TAUNTS.length);
    setDodgeCount((c) => c + 1);
  };

  const handleManualClick = (e) => {
    // If by miracle the user managed to click it (or used keyboard focus + Enter)
    e.preventDefault();
    e.stopPropagation();

    // Loud auditory punishment
    playScreechBeep(3400, 0.6);
    setTimeout(() => playErrorBuzzer(0.8), 200);

    // Call reset handler
    if (onResetTriggered) onResetTriggered();
    if (onSuccessfulClick) onSuccessfulClick();

    // Teleport immediately after punishment
    dodge();
  };

  return (
    <button
      ref={btnRef}
      onMouseEnter={dodge}
      onClick={handleManualClick}
      style={
        pos
          ? {
              position: 'fixed',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              zIndex: 9999,
              transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }
          : {}
      }
      className={`px-8 py-4 font-black uppercase text-lg tracking-widest rounded-none shadow-[6px_6px_0px_#000] border-4 border-[#FFFF00] bg-[#FF007F] text-[#FFFF00] hover:bg-[#00F0FF] hover:text-[#000] hover:border-[#FF007F] active:scale-95 transition-transform duration-75 select-none ${className}`}
    >
      <span className="flex items-center gap-2">
        {pos ? TAUNTS[tauntIndex] : originalText}
        {dodgeCount > 0 && (
          <span className="text-xs bg-black text-[#39FF14] px-1 py-0.5 border border-[#39FF14]">
            [DODGES: {dodgeCount}]
          </span>
        )}
      </span>
    </button>
  );
}

import React, { useState, useEffect } from 'react';
import { playSirenSound, playErrorBuzzer, playScreechBeep, playBoingSound } from '../utils/audio';

const ALERT_TEMPLATES = [
  {
    title: "🚨 CRITICAL ERROR 0xFEED: DIGITAL WEEDS IN BROWSER CACHE",
    body: "AI Soil Heuristics have detected Digitaria sanguinalis cybernetica (digital crabgrass) propagating inside your LocalStorage. De-weeding takes 45 minutes unless you purchase CropShield™ Enterprise ($899/mo).",
    btnPrimary: "PULL WEEDS MANUALLY",
    btnSecondary: "LET WEEDS CHOKE CPU",
    icon: "🌱⚠️"
  },
  {
    title: "🌾 SCARECROW RE-AUTHENTICATION REQUIRED",
    body: "Bio-photonic sensors indicate your cursor moves in rigid, wooden trajectories. To confirm you are a living human farmer and NOT a jacket stuffed with straw, solve the 18-step agricultural puzzle below.",
    btnPrimary: "I AM MADE OF FLESH & BONE",
    btnSecondary: "ADMIT I AM A SCARECROW",
    icon: "🧑‍🌾🌾"
  },
  {
    title: "🚜 TRACTOR FIRMWARE DRM VIOLATION",
    body: "John Deere Subatomic Telemetry Unit #984-Z-MAIZE detected non-certified, open-source manure applied to your field. Your combine harvester has been remotely locked into reverse gear.",
    btnPrimary: "ACCEPT $2,400 FINE",
    btnSecondary: "DISPUTE VIA TELEGRAM",
    icon: "🚜🔒"
  },
  {
    title: "🍄 MYCORRHIZAL FUNGI REBELLION IN SECTOR 9",
    body: "Over 14,000,000 mycorrhizal fungi in your rhizosphere have formed an autonomous trade union and refuse to transport phosphorus ions until their soil pH is raised to exactly 6.841.",
    btnPrimary: "NEGOTIATE WITH HYPHAE",
    btnSecondary: "APPLY FUNGICIDE TEAR GAS",
    icon: "🍄⚡"
  },
  {
    title: "💨 AMMONIA VAPOR DETECTED FROM DISPLAY",
    body: "Warning: High-density quantum nitrogen telemetry is venting virtual ammonium nitrate gas through your speaker grilles. Please do not ignite any open flames near your keyboard.",
    btnPrimary: "EVACUATE BROWSER TAB",
    btnSecondary: "INHALE QUANTUM FUMES",
    icon: "☣️💨"
  },
  {
    title: "🦗 LOCUST SWARM PACKET FLOOD",
    body: "4,000,000 digital grasshoppers are eating the bandwidth allocated to your crop yield forecast. Yield forecast reduced to 0.4 ears of corn for the entire 2027 fiscal year.",
    btnPrimary: "DEPLOY LASER SCARECROW",
    btnSecondary: "SURRENDER TO SWARM",
    icon: "🦗💻"
  },
];

export default function AnnoyingPopups() {
  const [popups, setPopups] = useState([]);

  // Spawn a popup every 4 to 6.5 seconds
  useEffect(() => {
    const triggerInterval = () => {
      const delay = Math.random() * 2500 + 4000; // 4000ms - 6500ms
      return setTimeout(() => {
        spawnPopup();
        timer = triggerInterval();
      }, delay);
    };

    let timer = triggerInterval();
    return () => clearTimeout(timer);
  }, []);

  const spawnPopup = () => {
    playSirenSound();
    const template = ALERT_TEMPLATES[Math.floor(Math.random() * ALERT_TEMPLATES.length)];
    const id = Date.now() + Math.random();

    // Randomize center offset
    const offsetX = Math.floor(Math.random() * 160 - 80);
    const offsetY = Math.floor(Math.random() * 140 - 70);

    const newPopup = {
      id,
      ...template,
      x: offsetX,
      y: offsetY,
      color: ['#FF007F', '#FFFF00', '#00F0FF', '#FF5F00'][Math.floor(Math.random() * 4)],
      shake: Math.random() > 0.5,
    };

    setPopups((prev) => [...prev.slice(-6), newPopup]); // Keep up to 7 on screen to preserve performance while overwhelming user
  };

  // The insidious "X" button handler: clicking "X" DOES NOT CLOSE, IT SPAWNS TWO MORE!
  const handleEvilClose = (id, e) => {
    e.stopPropagation();
    playScreechBeep(3500, 0.4);
    setTimeout(() => playErrorBuzzer(0.5), 100);

    // Spawn 2 more popups!
    spawnPopup();
    setTimeout(() => spawnPopup(), 200);

    // We do NOT remove this popup, or we duplicate it
    setPopups((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: "❌ ACCESS DENIED: CANNOT CLOSE HYPER-ALERT", shake: true } : p))
    );
  };

  const handleAction = (btnType) => {
    playErrorBuzzer(0.6);
    spawnPopup();
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[90000] flex items-center justify-center">
      {popups.map((popup) => (
        <div
          key={popup.id}
          className={`pointer-events-auto absolute max-w-md w-11/12 p-5 border-4 border-black shadow-[12px_12px_0px_#000] text-black ${
            popup.shake ? 'animate-violent-shake' : ''
          }`}
          style={{
            backgroundColor: popup.color,
            transform: `translate(${popup.x}px, ${popup.y}px)`,
          }}
        >
          {/* Header Bar with microscopic, evasive 'X' */}
          <div className="flex justify-between items-center border-b-4 border-black pb-2 mb-3 bg-black text-[#FFFF00] px-2 py-1">
            <span className="font-mono text-xs font-black tracking-tight truncate flex items-center gap-1">
              <span>{popup.icon}</span> AGRO-SYS FAULT EXCEPTION
            </span>

            {/* Tiny deceptive close button */}
            <button
              onClick={(e) => handleEvilClose(popup.id, e)}
              title="Close window (spawns 2 more)"
              className="text-[9px] bg-red-600 hover:bg-yellow-400 text-white hover:text-black font-black px-1.5 py-0.5 border border-white cursor-pointer transition-all hover:scale-125"
            >
              [X]
            </button>
          </div>

          <h3 className="font-impact text-lg leading-tight uppercase mb-2 text-[#000] tracking-wide">
            {popup.title}
          </h3>

          <p className="font-mono text-xs font-bold leading-relaxed mb-4 bg-white/70 p-2 border-2 border-dashed border-black">
            {popup.body}
          </p>

          {/* Action Buttons that both fail */}
          <div className="flex flex-col gap-2 font-mono text-xs">
            <button
              onClick={() => handleAction('primary')}
              className="w-full py-2 bg-[#00F0FF] text-black font-black uppercase border-2 border-black hover:bg-[#39FF14] active:bg-[#FF007F] shadow-[3px_3px_0px_#000] transition-colors"
            >
              {popup.btnPrimary}
            </button>
            <button
              onClick={() => handleAction('secondary')}
              className="w-full py-1 bg-yellow-300 text-black font-bold uppercase border-2 border-black hover:bg-red-500 hover:text-white transition-colors"
            >
              {popup.btnSecondary}
            </button>
          </div>

          {/* Tiny Fake Fine Print */}
          <div className="mt-2 text-[8px] font-mono text-center opacity-80">
            *Clicking [X] indicates consent to digital weed pollination.
          </div>
        </div>
      ))}
    </div>
  );
}

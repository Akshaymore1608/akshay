import React, { useState } from 'react';
import EvasiveButton from './EvasiveButton';
import { playErrorBuzzer, playScreechBeep } from '../utils/audio';

export default function CookieBannerHell() {
  const [closed, setClosed] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);

  const fakeCookies = [
    "Photosystem II Quantum Resonance Tracker (Essential)",
    "Root Apical Meristem Kinetic Profiler (Required for Maize)",
    "Subsurface Nematode Behavioral Tracking",
    "John Deere Telemetry Synchronization Beacon",
    "Atmospheric Vapor Pressure Deficit Cookie #491",
    "Farmer Pulse Rate Bio-Beacon",
  ];

  const handleReject = () => {
    playErrorBuzzer(0.8);
    alert("⛔ REJECTION FORBIDDEN BY THE GLOBAL CORN COMMISSION (GCC). All 48 tracking cookies have been forcibly enabled.");
    setCheckedCount(fakeCookies.length);
  };

  if (closed) return null;

  return (
    <div className="fixed bottom-10 left-4 right-4 md:left-12 md:right-12 z-[80000] bg-[#FFFF00] border-8 border-black p-4 shadow-[12px_12px_0px_#000] text-black">
      <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
        <h4 className="font-impact text-lg uppercase tracking-wider text-[#FF007F] flex items-center gap-2">
          🍪 MANDATORY RHIZOSPHERIC COOKIE AUDIT (GDPR-QUANTUM-2027)
        </h4>
        <span className="text-[10px] font-mono font-black bg-black text-[#39FF14] px-2 py-0.5">
          COMPLIANCE MANDATORY
        </span>
      </div>

      <p className="font-mono text-xs font-bold leading-tight mb-3">
        In accordance with the Intergalactic Agronomy Telecommunications Treaty, our quantum AI must deposit 48,000 cookies into your browser to balance nitrogen levels in your RAM.
      </p>

      {/* Checkboxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 max-h-24 overflow-y-scroll bg-white p-2 border-2 border-black">
        {fakeCookies.map((cookie, idx) => (
          <label key={idx} className="flex items-center gap-2 font-mono text-[11px] font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={checkedCount > idx}
              onChange={() => {
                playScreechBeep(1800, 0.05);
                setCheckedCount((c) => (c > idx ? c - 1 : c + 1));
              }}
              className="accent-[#FF007F] w-4 h-4"
            />
            <span>{cookie}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-2 border-t-2 border-black">
        {/* Evasive Accept Button */}
        <EvasiveButton
          originalText="✅ ACCEPT ALL 48,000 COOKIES"
          className="text-xs py-2 px-4 bg-[#39FF14] text-black border-black"
          onSuccessfulClick={() => {
            alert("🍪 ALL COOKIES DEPOSITED. YOUR DISK IS NOW 94% CORN.");
            setClosed(true);
          }}
        />

        <button
          onClick={handleReject}
          className="font-mono text-xs font-black uppercase px-4 py-2 bg-red-600 text-white border-2 border-black hover:bg-black shadow-[2px_2px_0px_#000]"
        >
          ❌ REJECT COOKIES (PENALTY APPLIES)
        </button>
      </div>
    </div>
  );
}

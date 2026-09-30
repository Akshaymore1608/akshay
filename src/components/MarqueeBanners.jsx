import React from 'react';

export default function MarqueeBanners() {
  const topAlerts = [
    "🚨 QUANTUM SOIL CALIBRATING... DO NOT BLINK...",
    "⚠️ WARNING: NITROGEN OVERLOAD DETECTED IN QUADRANT 7B [RHIZOSPHERE CRITICAL]",
    "🧪 PHOTOSYNTHETIC MATRIX DESTABILIZED — GLUCOSE EMISSION AT 450%",
    "🚜 TRACTOR FIRMWARE OUT OF DATE: PLEASE INSERT 3.5\" FLOPPY DISK TO PLOW",
    "🍄 SUBATOMIC MYCORRHIZAL ENTANGLEMENT FACTOR: 0.0004 Ψ",
    "🦗 LOCUST AI SWARM COORDINATES CURRENTLY DOWNLOADING TO YOUR BROWSER CACHE...",
  ];

  const bottomAlerts = [
    "🌾 AGRONOMIC WARNING: SOIL PH REACHING SUB-ZERO TEMPERATURES",
    "☢️ ENTANGLED PHOSPHORUS IONS AT 99.4% SATURATION (REGULATORY VIOLATION)",
    "📡 SATELLITE RADAR CONNECTED TO ROOT APICAL MERISTEM OF MAIZE FIELD #4",
    "🌽 CORN YIELD PROJECTION: +4,200% OR COMPLETE SPONTANEOUS COMBUSTION",
    "🛑 DO NOT REFRESH TAB: RHIZOSPHERIC DATA PACKETS WILL DROWN IN IRRIGATION DITCH",
    "⚡ QUANTUM CHLOROPHYLL TUNNELING EXCEEDED MAX LEGAL RADIATION LIMITS",
  ];

  return (
    <>
      {/* Top Competing Marquees */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col pointer-events-none select-none shadow-[0_4px_25px_rgba(255,0,127,0.8)]">
        {/* Marquee 1 (Leftward, Hot Pink on Lime) */}
        <div className="bg-[#FF007F] text-[#FFFF00] font-black text-sm tracking-wider uppercase border-b-4 border-[#00F0FF] py-1.5 overflow-hidden whitespace-nowrap">
          <div className="marquee-track-left flex gap-8 items-center">
            {[...topAlerts, ...topAlerts].map((alert, i) => (
              <span key={i} className="flex items-center gap-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {alert} <span className="text-[#39FF14]">★★★</span>
              </span>
            ))}
          </div>
        </div>

        {/* Marquee 2 (Rightward, Neon Yellow on Electric Violet) */}
        <div className="bg-[#9D00FF] text-[#39FF14] font-black text-xs tracking-widest uppercase border-b-4 border-[#FF007F] py-1 overflow-hidden whitespace-nowrap">
          <div className="marquee-track-right flex gap-12 items-center">
            {[...bottomAlerts, ...bottomAlerts].map((alert, i) => (
              <span key={i} className="flex items-center gap-3">
                {alert} <span className="text-[#FF007F]">⚡⚡⚡</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Marquee (Electric Blue on Toxic Orange) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FF5F00] text-[#00F0FF] font-black text-sm border-t-4 border-[#FFFF00] py-1.5 overflow-hidden whitespace-nowrap shadow-[0_-4px_25px_rgba(0,240,255,0.8)] pointer-events-none select-none">
        <div className="marquee-track-left flex gap-10 items-center">
          {[...bottomAlerts, ...topAlerts].map((alert, i) => (
            <span key={i} className="flex items-center gap-2 drop-shadow-[0_1px_3px_#000]">
              🌾 {alert} <span className="text-[#FFFF00]">|| LIVE TELEMETRY ||</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

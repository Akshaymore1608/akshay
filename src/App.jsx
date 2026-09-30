import React, { useState, useEffect } from 'react';
import ObnoxiousCursor from './components/ObnoxiousCursor';
import MarqueeBanners from './components/MarqueeBanners';
import AnnoyingPopups from './components/AnnoyingPopups';
import AgriQuantumForm from './components/AgriQuantumForm';
import JumbledAgriculturalText from './components/JumbledAgriculturalText';
import QuantumMetricsDashboard from './components/QuantumMetricsDashboard';
import CookieBannerHell from './components/CookieBannerHell';
import AudioController from './components/AudioController';
import EvasiveButton from './components/EvasiveButton';
import { playScreechBeep, playBoingSound, playErrorBuzzer } from './utils/audio';

export default function App() {
  const [strobeMode, setStrobeMode] = useState(true);
  const [glitchActive, setGlitchActive] = useState(false);

  // Trigger occasional random screen glitch flash
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 200);
      }
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`min-h-screen relative text-black overflow-x-hidden pt-20 pb-28 ${
        strobeMode ? 'animate-strobe-background' : 'bg-[#39FF14]'
      } ${glitchActive ? 'filter invert' : ''}`}
    >
      {/* Obnoxious Custom Tractor Cursor & Particle Blur Trail */}
      <ObnoxiousCursor />

      {/* Top and Bottom Competing Marquees */}
      <MarqueeBanners />

      {/* Audio Controller */}
      <AudioController />

      {/* Relentless Annoying Popups Spawner */}
      <AnnoyingPopups />

      {/* Cookie Consent Banner from Hell */}
      <CookieBannerHell />

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-10">
        
        {/* ================= HERO HEADER ================= */}
        <header className="bg-[#FF007F] border-8 border-[#FFFF00] p-6 text-center shadow-[16px_16px_0px_#000] relative">
          <div className="absolute top-2 left-2 bg-black text-[#39FF14] text-[10px] font-mono font-black px-2 py-1 border border-[#39FF14]">
            BUILD v9.8.4-PROD-QUANTUM
          </div>
          <div className="absolute top-2 right-2 bg-[#00F0FF] text-black text-[10px] font-mono font-black px-2 py-1 border border-black">
            USDA BIO-QUANTUM COMPLIANT
          </div>

          <div className="flex justify-center items-center gap-3 my-2">
            <span className="text-6xl animate-spin">🌽</span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-impact tracking-wider text-[#FFFF00] glow-vibrate uppercase">
              AGRI-QUANTUM™ AI
            </h1>
            <span className="text-6xl animate-bounce">🚜</span>
          </div>

          <p className="font-mono text-sm sm:text-base font-black text-black bg-[#39FF14] inline-block px-4 py-1.5 border-4 border-black uppercase tracking-widest my-2">
            Autonomous Subsurface Rhizosphere Telemetry & Photosynthetic Matrix Optimizer
          </p>

          <p className="font-mono text-xs font-bold text-white max-w-2xl mx-auto mt-2 leading-relaxed">
            Welcome to the premier quantum agronomic diagnostics engine. Utilizing sub-atomic NMR resonance and thylakoid light-harvesting models to maximize crop yield across 48 dimensions of soil chemistry.
          </p>

          {/* Quick Trigger Buttons */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
            <EvasiveButton
              originalText="⚡ INSTANT HARVEST ADVISORY"
              className="bg-[#00F0FF] text-black border-black text-sm"
              onSuccessfulClick={() => alert("ERROR: Atmospheric humidity too theoretical to advise.")}
            />

            <button
              onClick={() => {
                playScreechBeep(2600, 0.3);
                setStrobeMode((s) => !s);
              }}
              className="px-4 py-3 font-mono font-black text-xs uppercase bg-[#FFFF00] text-black border-4 border-black shadow-[4px_4px_0px_#000] hover:bg-white"
            >
              {strobeMode ? "🛑 PAUSE BACKGROUND STROBE (MAY FAIL)" : "⚡ RESUME MAXIMUM STROBE"}
            </button>
          </div>
        </header>

        {/* ================= REAL-TIME TELEMETRY METRICS ================= */}
        <QuantumMetricsDashboard />

        {/* ================= SOIL CALIBRATION FORM (EVASIVE BUTTONS) ================= */}
        <section>
          <AgriQuantumForm />
        </section>

        {/* ================= JUMBLED & INVERTED SCIENTIFIC TEXT ================= */}
        <section>
          <JumbledAgriculturalText />
        </section>

        {/* ================= RADAR SCANNER & WEIRD AGRI-SENSORS ================= */}
        <section className="bg-[#00F0FF] border-8 border-black p-6 shadow-[12px_12px_0px_#000]">
          <div className="flex justify-between items-center border-b-4 border-black pb-2 mb-4 flex-wrap gap-2">
            <h3 className="font-impact text-2xl uppercase tracking-wider text-[#FF007F] glow-vibrate">
              📡 ACTIVE SATELLITE RHIZOSPHERE RADAR SCANNER
            </h3>
            <span className="font-mono text-xs bg-black text-[#FFFF00] px-2 py-1 font-black">
              SWEEP FREQUENCY: 14.8 GHz
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Radar Animation Box */}
            <div className="relative w-48 h-48 mx-auto rounded-full border-8 border-black bg-black flex items-center justify-center overflow-hidden shadow-[inset_0_0_20px_#39FF14]">
              {/* Concentric rings */}
              <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-[#39FF14]/60"></div>
              <div className="absolute w-24 h-24 rounded-full border border-[#39FF14]/40"></div>
              <div className="absolute w-12 h-12 rounded-full border border-[#39FF14]/80"></div>
              {/* Sweeping Radar Needle */}
              <div className="absolute w-24 h-24 origin-bottom-right top-0 left-0 bg-gradient-to-br from-[#39FF14]/60 to-transparent spin-slow"></div>
              {/* Radar Targets (Blinking) */}
              <span className="absolute top-10 left-16 text-xs animate-ping">🌽</span>
              <span className="absolute bottom-12 right-10 text-xs animate-pulse">🐛</span>
              <span className="absolute top-20 right-8 text-xs animate-bounce">🚜</span>
            </div>

            {/* Radar Telemetry Text */}
            <div className="md:col-span-2 space-y-3 font-mono text-xs font-bold text-black bg-white p-4 border-4 border-black shadow-[4px_4px_0px_#000]">
              <p className="border-b border-black/30 pb-1">
                <span className="text-[#FF007F] font-black">[RADAR ECHO 01]:</span> Deep-profile electromagnetic induction confirms subterranean earthworm migration along magnetic flux lines (Azimuth 242°).
              </p>
              <p className="border-b border-black/30 pb-1">
                <span className="text-[#00F0FF] font-black bg-black px-1">[RADAR ECHO 02]:</span> Unidentified combine harvester detected operating autonomously in 3 simultaneous eigenstates.
              </p>
              <p>
                <span className="text-purple-700 font-black">[RADAR ECHO 03]:</span> Nitrate leaching risk approaching infinite divergence. Immediate sub-surface clay compaction protocol suggested.
              </p>

              <div className="pt-2 flex gap-3">
                <EvasiveButton
                  originalText="🛰️ RE-SYNC SATELLITE RADAR"
                  className="text-xs py-2 px-3 bg-[#FF007F] text-white"
                  onSuccessfulClick={() => alert("SATELLITE LOST: Gravitational slingshot malfunctioned.")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAKE FARMER TESTIMONIALS ================= */}
        <section className="bg-black text-white border-8 border-[#39FF14] p-6 shadow-[14px_14px_0px_#FF007F]">
          <h3 className="font-impact text-2xl uppercase tracking-wider text-[#FFFF00] text-center mb-6">
            💬 WHAT CERTIFIED QUANTUM AGRONOMISTS ARE SAYING
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FF007F] text-[#FFFF00] p-4 border-4 border-white font-mono text-xs">
              <p className="italic mb-3">
                "Thanks to AGRI-QUANTUM AI, my corn stalks have grown in reverse, burrowing deep toward the Earth's molten mantle. Yield is down 100%, but root quantum entropy is at an all-time high!"
              </p>
              <span className="font-black text-white block">— Jebediah K., Certified Corn Operator, Iowa</span>
            </div>

            <div className="bg-[#39FF14] text-black p-4 border-4 border-white font-mono text-xs">
              <p className="italic mb-3">
                "I tried to click 'Submit Soil Sample' for 9 consecutive hours. My tractor caught fire, my dog learned calculus, and my soil pH is now a complex imaginary number (5.4 + 3.2i)."
              </p>
              <span className="font-black text-purple-900 block">— Dr. Eleanor Vance, Rhizosphere Physicist</span>
            </div>

            <div className="bg-[#FFFF00] text-black p-4 border-4 border-white font-mono text-xs">
              <p className="italic mb-3">
                "The popups warning about digital weeds in my browser cache prompted me to pour 5 gallons of 10-10-10 fertilizer directly onto my MacBook keyboard. Advisory portal works as advertised!"
              </p>
              <span className="font-black text-red-600 block">— Billy Bob Thornton, Soy Enthusiast</span>
            </div>
          </div>
        </section>

        {/* ================= SCIENTIFIC FOOTER ================= */}
        <footer className="bg-black text-[#FFFF00] border-8 border-[#00F0FF] p-6 text-center font-mono text-xs space-y-3">
          <p className="font-impact text-xl text-[#39FF14] tracking-widest">
            AGRI-QUANTUM™ GLOBAL SUBSURFACE SYSTEMS &copy; 2027
          </p>
          <p className="text-[11px] text-gray-300 max-w-3xl mx-auto leading-relaxed">
            All agronomic recommendations generated using 512-qubit cryo-cooled nitrogen simulation models. Not responsible for field vaporization, spontaneous tractor levitation, digital weeds, or permanent psychological distress caused by evasive buttons.
          </p>
          <div className="flex justify-center gap-4 text-[#00F0FF] font-black text-xs uppercase flex-wrap">
            <span>[TERMS OF PHOTOSYNTHESIS]</span>
            <span>[NITROGEN PRIVACY POLICY]</span>
            <span>[SCARECROW RECOGNITION AGREEMENT]</span>
            <span>[ISO-9001:2027 CERTIFIED]</span>
          </div>
        </footer>

      </main>
    </div>
  );
}

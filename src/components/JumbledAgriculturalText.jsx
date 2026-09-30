import React, { useState, useEffect } from 'react';
import { playScreechBeep, playBoingSound } from '../utils/audio';

const ORIGINAL_PARAGRAPHS = [
  {
    id: 1,
    heading: "1. Hyperspectral Photochemical Refinement & Photosystem II Quantum Dynamics",
    content: "Evaluation of non-photochemical quenching (NPQ) kinetics in C4 Zea mays canopy structures reveals significant correlation between electron transport rates (ETR) and localized sub-atomic chlorophyll a/b fluorescence ratios. Utilizing 705nm red-edge reflectance indices, the quantum advisory engine computes real-time exciton dissipation across the thylakoid membrane, stabilizing light-harvesting complex II (LHCII) against photoinhibition during extreme zenith irradiance.",
    mode: "upsideDown", // Rotates upside down
  },
  {
    id: 2,
    heading: "2. Rhizosphere Metagenomics & Glomalin Secretion Pathways",
    content: "The symbiotic symbiont matrix established by Arbuscular Mycorrhizal Fungi (AMF, predominantly Glomus intraradices) modulates extracellular soil aggregate stability through continuous excretion of glomalin-related soil proteins (GRSP). By coupling deep-layer quantum dielectric tensiometers with cation exchange capacity (CEC) telemetry, root apical meristems regulate active phosphorus ion transport across high-affinity Pht1 transporter gene networks.",
    mode: "scramble", // Jumbles letters dynamically
  },
  {
    id: 3,
    heading: "3. Dinitrogenase Isotopic Superposition & Endophytic Fixation Kinetics",
    content: "Biological nitrogen fixation (BNF) orchestrated by diazotrophic Bradyrhizobium japonicum relies upon a homodimeric iron (Fe) protein and a heterotetrameric molybdenum-iron (MoFe) catalytic core. At sub-surface atmospheric nitrogen partial pressures, quantum mechanical tunneling of protons across the FeMo cofactor reduces ambient N2 into bio-available ammonium (NH4+) with zero wasted metabolic ATP expenditure.",
    mode: "shake", // Shakes violently
  },
  {
    id: 4,
    heading: "4. Autonomous Canopy Evapotranspiration & Microclimate Thermal Flux",
    content: "Stomatal conductance (gs) calculations derive from penman-monteith energy balance equations cross-calibrated against thermal infrared radiometry. As vapor pressure deficits (VPD) oscillate between 1.2 and 2.8 kPa, xylem hydraulic vulnerability curves predict cavitation risk within vascular bundles, providing sub-millimeter precision for pressurized drip irrigation pulses.",
    mode: "fontHop", // Changes fonts to papyrus / comic / unreadable
  }
];

// Helper to scramble interior letters of words
function scrambleText(text) {
  return text.split(' ').map((word) => {
    if (word.length <= 3) return word;
    const inner = word.slice(1, -1).split('');
    // Shuffle inner
    for (let i = inner.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [inner[i], inner[j]] = [inner[j], inner[i]];
    }
    return word[0] + inner.join('') + word[word.length - 1];
  }).join(' ');
}

export default function JumbledAgriculturalText() {
  const [jumbledParagraphs, setJumbledParagraphs] = useState(ORIGINAL_PARAGRAPHS);
  const [flipped, setFlipped] = useState({});
  const [hoveredFonts, setHoveredFonts] = useState({});

  // Periodic random scrambler every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setJumbledParagraphs((prev) =>
        prev.map((p) => {
          if (p.mode === 'scramble') {
            return {
              ...p,
              currentContent: Math.random() > 0.4 ? scrambleText(p.content) : p.content,
            };
          }
          return p;
        })
      );

      // Periodically invert section 1 upside down
      setFlipped((f) => ({ ...f, 1: !f[1] }));
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const handleParagraphClick = (id) => {
    playScreechBeep(1900, 0.2);
    // Reverse word order on click!
    setJumbledParagraphs((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, currentContent: (p.currentContent || p.content).split(' ').reverse().join(' ') }
          : p
      )
    );
  };

  const handleMouseEnter = (id) => {
    playBoingSound();
    const fonts = ['font-papyrus', 'font-impact', 'font-mono', 'font-comic'];
    setHoveredFonts((h) => ({
      ...h,
      [id]: fonts[Math.floor(Math.random() * fonts.length)],
    }));
  };

  return (
    <div className="space-y-8 my-8 select-none">
      <div className="bg-[#FFFF00] text-black border-4 border-[#FF007F] p-4 text-center shadow-[8px_8px_0px_#000]">
        <h2 className="text-2xl md:text-3xl font-impact tracking-wider uppercase text-[#FF007F] glow-vibrate">
          🔬 PEER-REVIEWED QUANTUM AGRONOMY & SOIL TELEMETRY WHITEPAPER
        </h2>
        <p className="font-mono text-xs font-bold text-black mt-1">
          [STANDARDS COMPLIANT: ISO-9002-QUANTUM-CROP | CALIBRATION FACTOR: ±0.000000001%]
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jumbledParagraphs.map((p) => {
          const isUpsideDown = p.mode === 'upsideDown' && flipped[p.id];
          const isShaking = p.mode === 'shake';
          const activeFont = hoveredFonts[p.id] || 'font-mono';

          return (
            <div
              key={p.id}
              onClick={() => handleParagraphClick(p.id)}
              onMouseEnter={() => handleMouseEnter(p.id)}
              className={`p-5 border-4 transition-all duration-300 relative cursor-pointer shadow-[6px_6px_0px_#000] ${
                p.id % 2 === 0
                  ? 'bg-[#00F0FF] border-[#FF007F] text-[#000]'
                  : 'bg-[#FF007F] border-[#FFFF00] text-[#FFFF00]'
              } ${isShaking ? 'animate-violent-shake' : ''} ${
                isUpsideDown ? 'upside-down-text' : ''
              }`}
            >
              {/* Badge */}
              <div className="absolute -top-3 right-3 bg-black text-[#39FF14] text-[10px] font-black px-2 py-0.5 border border-[#39FF14]">
                {isUpsideDown ? 'FLIPPED BY GRAVITY FLUX' : 'LIVE SCIENTIFIC TELEMETRY'}
              </div>

              <h3 className="font-impact text-lg uppercase tracking-wide mb-3 border-b-2 border-black pb-1">
                {p.heading}
              </h3>

              <p className={`text-sm leading-relaxed ${activeFont} font-bold`}>
                {p.currentContent || p.content}
              </p>

              <div className="mt-4 pt-2 border-t border-black/40 flex justify-between items-center text-[10px] font-mono font-black">
                <span>[CLICK PARAGRAPH TO INVERT ENTROPY]</span>
                <span className="animate-pulse text-red-600 bg-white px-1">
                  STATUS: 98.7% ACCURATE
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

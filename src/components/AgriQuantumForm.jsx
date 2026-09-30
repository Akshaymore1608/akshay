import React, { useState } from 'react';
import EvasiveButton from './EvasiveButton';
import { playScreechBeep, playErrorBuzzer, playBoingSound, playModemScreech } from '../utils/audio';

const CROP_VARIETIES = [
  "Select a Quantum Crop Variety...",
  "Zea mays subsp. gigas (Cyber-Corn 2.0)",
  "Zea mays subsp. gigas (Cyber-Corn 2.0 - Hotfix A)",
  "Zea mays subsp. gigas (Cyber-Corn 2.0 - Legacy)",
  "Glycine max (Quantum Entangled Soybean β)",
  "Triticum aestivum (Pre-Cambrian Ancient Spelt)",
  "Solanum tuberosum (High-Voltage Russet Potato)",
  "Hordeum vulgare (Subatomic Brewing Barley)",
  "Brassica oleracea (Self-Harvesting Cabbage)",
  "Bioluminescent Radioactive Rutabaga [EXPERIMENTAL]",
];

export default function AgriQuantumForm() {
  const [formData, setFormData] = useState({
    farmerName: '',
    cropStrain: CROP_VARIETIES[0],
    soilPh: '6.840291',
    nitrogenFlux: 42,
    hectares: '100',
    wormDensity: 90,
  });

  const [notification, setNotification] = useState(null);

  const resetForm = () => {
    playErrorBuzzer(0.7);
    setFormData({
      farmerName: '',
      cropStrain: CROP_VARIETIES[0],
      soilPh: '6.840291',
      nitrogenFlux: 0,
      hectares: '0',
      wormDensity: 0,
    });
    setNotification("⚠️ INPUT WIPED: Quantum flux anomaly detected in input buffer!");
    setTimeout(() => setNotification(null), 4000);
  };

  // Frustrating typing logic: reverses characters or adds corn
  const handleFarmerNameChange = (e) => {
    let val = e.target.value;
    playScreechBeep(1200 + val.length * 50, 0.05);

    // Randomly insert corn or capitalize
    if (val.length % 4 === 0 && val.length > 0) {
      val += "🌽";
    }

    setFormData((prev) => ({ ...prev, farmerName: val }));
  };

  const handleSliderChange = (e) => {
    playBoingSound();
    let val = parseInt(e.target.value, 10);
    // Slippery slider: if dragged above 50, it randomly jumps
    if (val > 50 && Math.random() > 0.4) {
      val = Math.floor(Math.random() * 20);
    }
    setFormData((prev) => ({ ...prev, nitrogenFlux: val }));
  };

  return (
    <div className="bg-[#FFFF00] border-8 border-[#FF007F] p-6 shadow-[12px_12px_0px_#000] relative">
      {/* Decorative Warning Header */}
      <div className="bg-black text-[#39FF14] p-3 mb-6 border-4 border-[#00F0FF] flex justify-between items-center flex-wrap gap-2">
        <span className="font-impact text-xl tracking-wider uppercase text-[#FFFF00] flex items-center gap-2">
          ⚡ SUBSURFACE QUANTUM NITROGEN & SOIL DIAGNOSTIC CONSOLE
        </span>
        <span className="font-mono text-xs font-black bg-[#FF007F] text-white px-2 py-1">
          STATUS: READY TO CRASH
        </span>
      </div>

      {notification && (
        <div className="mb-4 bg-red-600 text-white font-mono font-black p-3 border-4 border-yellow-300 animate-violent-shake text-center">
          {notification}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Field 1: Farmer License */}
        <div>
          <label className="block font-mono text-xs font-black uppercase text-black mb-1">
            🚜 Farmer Agronomic ID / Agrarian Call-Sign:
          </label>
          <input
            type="text"
            value={formData.farmerName}
            onChange={handleFarmerNameChange}
            placeholder="e.g., Farmer John (Typing is destabilized...)"
            className="w-full p-3 font-mono font-bold text-sm bg-white text-black border-4 border-black focus:bg-[#39FF14] focus:outline-none shadow-[4px_4px_0px_#000]"
          />
          <span className="text-[10px] font-mono text-red-700 font-bold block mt-1">
            *Notice: Every 4th character undergoes spontaneous photosynthetic cornification.
          </span>
        </div>

        {/* Field 2: Crop Variety Dropdown */}
        <div>
          <label className="block font-mono text-xs font-black uppercase text-black mb-1">
            🧬 Target Crop Genetic Superposition Strain:
          </label>
          <select
            value={formData.cropStrain}
            onChange={(e) => {
              playScreechBeep(1800, 0.1);
              setFormData((prev) => ({ ...prev, cropStrain: e.target.value }));
            }}
            className="w-full p-3 font-mono font-bold text-sm bg-[#00F0FF] text-black border-4 border-black focus:outline-none shadow-[4px_4px_0px_#000]"
          >
            {CROP_VARIETIES.map((v, i) => (
              <option key={i} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Field 3: Soil pH (Required to 8 Decimals) */}
        <div>
          <label className="block font-mono text-xs font-black uppercase text-black mb-1">
            🧪 Soil pH (Must calibrate to exact 7 decimal places for ISO-6842):
          </label>
          <input
            type="text"
            value={formData.soilPh}
            onChange={(e) => {
              playScreechBeep(2400, 0.05);
              setFormData((prev) => ({ ...prev, soilPh: e.target.value }));
            }}
            className="w-full p-3 font-mono font-bold text-sm bg-white text-black border-4 border-black focus:outline-none shadow-[4px_4px_0px_#000]"
          />
          <span className="text-[10px] font-mono text-[#FF007F] font-black block mt-1">
            [WARNING: 6.8402910 pH IS CRITICAL. 6.8402911 WILL SPONTANEOUSLY IONIZE WORMS]
          </span>
        </div>

        {/* Field 4: Slippery Nitrogen Flux Slider */}
        <div className="bg-white p-4 border-4 border-black shadow-[4px_4px_0px_#000]">
          <div className="flex justify-between items-center mb-2 font-mono text-xs font-black">
            <span>⚡ Rhizosphere Nitrogen Flux: {formData.nitrogenFlux}%</span>
            <span className="text-red-600 animate-pulse">[SLIPPERY SLIDER DYNAMICS]</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.nitrogenFlux}
            onChange={handleSliderChange}
            className="w-full h-8 accent-[#FF007F] bg-[#39FF14] border-2 border-black"
          />
          <p className="text-[10px] font-mono text-gray-700 mt-1">
            *Physics Engine: Sliders above 50% experience severe frictionless decay back to 0.
          </p>
        </div>

        {/* Buttons Row with Evasive Submit and Malicious Clear Form */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t-4 border-black">
          {/* Unclickable & Evasive Primary Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <EvasiveButton
              originalText="🚀 SUBMIT SOIL SAMPLE"
              onResetTriggered={resetForm}
              className="bg-[#39FF14] text-black border-black hover:bg-[#FF007F] hover:text-white"
            />
            <EvasiveButton
              originalText="📊 GENERATE CROP ADVISORY"
              onResetTriggered={resetForm}
              className="bg-[#00F0FF] text-black border-black hover:bg-[#FFFF00] hover:text-black"
            />
          </div>

          {/* Malicious 'Clear Entire Form' Button disguised nicely */}
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 font-mono font-bold text-xs bg-red-600 text-white border-2 border-black hover:bg-black hover:text-red-500 shadow-[3px_3px_0px_#000]"
          >
            🗑️ INSTANTLY WIPE ALL DATA
          </button>
        </div>
      </form>
    </div>
  );
}

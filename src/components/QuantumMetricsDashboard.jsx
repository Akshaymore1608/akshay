import React, { useState, useEffect } from 'react';
import { playModemScreech, playScreechBeep } from '../utils/audio';

export default function QuantumMetricsDashboard() {
  const [metrics, setMetrics] = useState({
    fluorometry: 0.814,
    moisture: -12.4,
    nitrogenPpm: 489,
    hyphaeCoherence: 94.2,
    tractorStatus: "REVERSING TOWARD BARN",
  });

  // Rapidly fluctuate numbers to disorient the user
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        fluorometry: +(0.78 + Math.random() * 0.15).toFixed(3),
        moisture: +(-20 + Math.random() * 35).toFixed(1),
        nitrogenPpm: Math.floor(400 + Math.random() * 350),
        hyphaeCoherence: +(80 + Math.random() * 20).toFixed(1),
        tractorStatus: [
          "REVERSING TOWARD BARN",
          "ENTANGLED WITH SCARECROW",
          "FIRMWARE EXPIRED",
          "BURNING SIMULATED DIESEL",
          "WHEELS SPINNING AT C",
        ][Math.floor(Math.random() * 5)],
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const handleCalibrate = () => {
    playModemScreech();
    alert("📡 CALIBRATION TRANSMISSION SENT TO 14 WEATHER SATELLITES. PLEASE DO NOT HARVEST WHEAT FOR 72 HOURS.");
  };

  return (
    <div className="bg-[#FF007F] border-8 border-[#39FF14] p-5 shadow-[10px_10px_0px_#000] my-8 text-black">
      <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-impact tracking-wider uppercase text-[#FFFF00] glow-vibrate">
            📊 REAL-TIME SUBSURFACE RHIZOSPHERE TELEMETRY
          </h2>
          <p className="font-mono text-xs font-bold text-white">
            DIRECT SATELLITE UPLINK: SATELLITE AGRI-SAT-9 [BANDWIDTH: 14 BAUD]
          </p>
        </div>

        <button
          onClick={handleCalibrate}
          className="px-4 py-2 font-mono font-black text-xs bg-[#39FF14] text-black border-2 border-black hover:bg-[#00F0FF] shadow-[3px_3px_0px_#000] active:scale-95 transition-transform"
        >
          🔄 CALIBRATE SENSORS (MODEM SOUND)
        </button>
      </div>

      {/* Grid of chaotic metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-3 border-4 border-black shadow-[4px_4px_0px_#000]">
          <span className="text-[10px] font-mono font-black text-gray-600 block">
            CHLOROPHYLL Fv/Fm YIELD
          </span>
          <div className="text-2xl font-mono font-black text-[#FF007F] animate-pulse">
            {metrics.fluorometry}
          </div>
          <span className="text-[9px] font-bold text-red-600 block">
            {metrics.fluorometry > 0.85 ? "🔥 PHOTOINHIBITION" : "STABLE EXCITON"}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#FFFF00] p-3 border-4 border-black shadow-[4px_4px_0px_#000]">
          <span className="text-[10px] font-mono font-black text-black block">
            SOIL HYGRO-TENSION
          </span>
          <div className="text-2xl font-mono font-black text-black">
            {metrics.moisture}%
          </div>
          <span className="text-[9px] font-bold text-purple-700 block">
            {metrics.moisture < 0 ? "⚡ IMPOSSIBLE DRYNESS" : "MUDDY CHAOS"}
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#00F0FF] p-3 border-4 border-black shadow-[4px_4px_0px_#000]">
          <span className="text-[10px] font-mono font-black text-black block">
            NITROGEN ISOTOPE (N-15)
          </span>
          <div className="text-2xl font-mono font-black text-red-600 animate-bounce">
            {metrics.nitrogenPpm} PPM
          </div>
          <span className="text-[9px] font-bold text-black block">
            EXCEEDS REGULATION
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#39FF14] p-3 border-4 border-black shadow-[4px_4px_0px_#000]">
          <span className="text-[10px] font-mono font-black text-black block">
            HYPHAE ENTANGLEMENT
          </span>
          <div className="text-2xl font-mono font-black text-black">
            {metrics.hyphaeCoherence}%
          </div>
          <span className="text-[9px] font-bold text-blue-900 block">
            FUNGI UNION VERIFIED
          </span>
        </div>

        {/* Metric 5 */}
        <div className="bg-black text-[#FFFF00] p-3 border-4 border-white shadow-[4px_4px_0px_#000] col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono font-black text-[#00F0FF] block">
            TRACTOR STATUS
          </span>
          <div className="text-xs font-mono font-black text-red-500 uppercase leading-snug my-1">
            {metrics.tractorStatus}
          </div>
          <span className="text-[9px] font-mono text-[#39FF14] block">
            GPS: 41.8781° N, 87.6298° W
          </span>
        </div>
      </div>
    </div>
  );
}

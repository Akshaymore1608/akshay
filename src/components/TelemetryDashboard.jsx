import React, { useState, useEffect } from 'react';
import { Activity, Wifi, Pause, Play, RefreshCw, Thermometer, Droplets, Sun, Gauge, Zap, AlertCircle } from 'lucide-react';

export default function TelemetryDashboard() {
  const [isLive, setIsLive] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState('Parcel Alpha (Corn - 420 Ha)');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  // Dynamic telemetry states
  const [metrics, setMetrics] = useState({
    soilMoisture: 37.2,
    canopyTemp: 23.4,
    ndviIndex: 0.81,
    nitrogenFlux: 44.5,
    soilEc: 1.22,
    parRadiation: 1410,
  });

  // Simulated live fluctuation
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setMetrics((prev) => ({
        soilMoisture: +(prev.soilMoisture + (Math.random() * 0.4 - 0.2)).toFixed(1),
        canopyTemp: +(prev.canopyTemp + (Math.random() * 0.2 - 0.1)).toFixed(1),
        ndviIndex: +(prev.ndviIndex + (Math.random() * 0.02 - 0.01)).toFixed(2),
        nitrogenFlux: +(prev.nitrogenFlux + (Math.random() * 0.8 - 0.4)).toFixed(1),
        soilEc: +(prev.soilEc + (Math.random() * 0.02 - 0.01)).toFixed(2),
        parRadiation: Math.round(prev.parRadiation + (Math.random() * 10 - 5)),
      }));
      setLastUpdated(new Date().toLocaleTimeString());
    }, 3200);

    return () => clearInterval(interval);
  }, [isLive]);

  const parcels = [
    'Parcel Alpha (Corn - 420 Ha)',
    'Parcel Beta (Winter Wheat - 280 Ha)',
    'Parcel Gamma (Soybeans - 350 Ha)',
    'Parcel Delta (Highland Vineyards - 120 Ha)',
  ];

  return (
    <section id="telemetry" className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Activity className="w-4 h-4" />
              <span>Real-Time Subsurface Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Live Sensor Array & Canopy Telemetry
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
              Streaming real-time LoRaWAN in-situ capacitance probes and satellite thermal radiometry.
            </p>
          </div>

          {/* Controls: Parcel Selector & Live Stream Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedParcel}
              onChange={(e) => setSelectedParcel(e.target.value)}
              className="bg-dark-900 border border-gray-800 text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {parcels.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsLive(!isLive)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                isLive
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-dark-900 border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isLive ? 'Stream: Live' : 'Stream: Paused'}</span>
            </button>

            <span className="text-[11px] font-mono text-gray-400">
              Synced: <span className="text-gray-300">{lastUpdated}</span>
            </span>
          </div>
        </div>

        {/* Telemetry Sensor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: Soil Moisture */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-gray-800 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                Soil Volumetric Water (VWC)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                OPTIMAL
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">{metrics.soilMoisture}%</span>
              <span className="text-xs text-gray-400 font-mono">depth: 25cm</span>
            </div>
            {/* Range Bar */}
            <div className="w-full bg-gray-800/80 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (metrics.soilMoisture / 50) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
              <span>Target: 32% - 42%</span>
              <span>FC: 45% · PWP: 14%</span>
            </div>
          </div>

          {/* Card 2: Canopy Temperature */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-gray-800 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                Crop Canopy Temperature
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                TRANSPIRING
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">{metrics.canopyTemp}°C</span>
              <span className="text-xs text-gray-400 font-mono">Ambient: 26.2°C</span>
            </div>
            <div className="w-full bg-gray-800/80 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-amber-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (metrics.canopyTemp / 35) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
              <span>Delta T: -2.8°C (Cooler)</span>
              <span>Stress Index: 0.12 (None)</span>
            </div>
          </div>

          {/* Card 3: NDVI Vegetation Index */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-gray-800 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                Multispectral NDVI Vigor
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                HIGH BIOMASS
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">{metrics.ndviIndex}</span>
              <span className="text-xs text-emerald-400 font-mono font-bold">+0.04 vs 7d avg</span>
            </div>
            <div className="w-full bg-gray-800/80 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, metrics.ndviIndex * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
              <span>Index Scale: 0.0 - 1.0</span>
              <span>Sentinel-2 Calibrated</span>
            </div>
          </div>

          {/* Card 4: Subsurface Nitrogen Flux */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-gray-800 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-teal-400" />
                Root Nitrogen Flux (NO₃-N)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300">
                SUFFICIENT
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">{metrics.nitrogenFlux}</span>
              <span className="text-xs text-gray-400 font-mono">mg/kg soil</span>
            </div>
            <div className="w-full bg-gray-800/80 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (metrics.nitrogenFlux / 60) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
              <span>Uptake Velocity: 1.4 mg/h</span>
              <span>Leaching Risk: Low (2%)</span>
            </div>
          </div>

          {/* Card 5: Soil Electrical Conductivity */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-gray-800 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                Salinity & Electrical Cond. (EC)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300">
                NON-SALINE
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">{metrics.soilEc}</span>
              <span className="text-xs text-gray-400 font-mono">dS/m (bulk)</span>
            </div>
            <div className="w-full bg-gray-800/80 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (metrics.soilEc / 2.5) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
              <span>Threshold Limit: 2.0 dS/m</span>
              <span>Nutrient Ion Buffer: Stable</span>
            </div>
          </div>

          {/* Card 6: Solar Active Radiation (PAR) */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden border border-gray-800 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                Photosynthetic Photon Flux (PAR)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                PEAK DLI
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">{metrics.parRadiation}</span>
              <span className="text-xs text-gray-400 font-mono">µmol/m²/s</span>
            </div>
            <div className="w-full bg-gray-800/80 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (metrics.parRadiation / 2000) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono">
              <span>Daily Light Integral: 38 mol</span>
              <span>Photochemical Quenching: Low</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

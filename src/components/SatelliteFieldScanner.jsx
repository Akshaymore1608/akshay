import React, { useState } from 'react';
import { Satellite, Eye, Layers, Compass, Crosshair, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

export default function SatelliteFieldScanner() {
  const [activeBand, setActiveBand] = useState('NDVI');
  const [selectedSector, setSelectedSector] = useState(4); // Default center sector

  const bands = [
    { id: 'NDVI', label: 'NDVI Vigor', desc: 'Normalized Difference Vegetation (Biomass)', color: 'from-emerald-600 to-green-400' },
    { id: 'NDRE', label: 'NDRE Chlorophyll', desc: 'Red Edge Index (Nitrogen Absorption)', color: 'from-teal-600 to-emerald-400' },
    { id: 'NDWI', label: 'NDWI Moisture', desc: 'Water Index (Canopy Hydration)', color: 'from-blue-600 to-cyan-400' },
    { id: 'Thermal', label: 'Thermal IR', desc: 'Canopy Surface Temperature Transpiration', color: 'from-amber-600 to-red-400' },
  ];

  // 9 grid sectors with realistic multispectral data
  const sectors = [
    { id: 0, name: 'Sector 1A (North Border)', ndvi: 0.84, ndre: 0.42, ndwi: 0.38, temp: 21.8, status: 'Healthy', note: 'Dense canopy growth, low weed competition.' },
    { id: 1, name: 'Sector 1B (Central Ridge)', ndvi: 0.79, ndre: 0.38, ndwi: 0.34, temp: 22.4, status: 'Healthy', note: 'Consistent vegetative vigor, optimal transpiration.' },
    { id: 2, name: 'Sector 1C (Northeast)', ndvi: 0.86, ndre: 0.44, ndwi: 0.41, temp: 21.2, status: 'Healthy', note: 'Highest chlorophyll index in current cycle.' },
    { id: 3, name: 'Sector 2A (West Slope)', ndvi: 0.68, ndre: 0.31, ndwi: 0.22, temp: 25.1, status: 'Moisture Deficit', note: 'Sloped terrain runoff causing slight water deficit.' },
    { id: 4, name: 'Sector 2B (Center Core)', ndvi: 0.83, ndre: 0.41, ndwi: 0.36, temp: 22.1, status: 'Optimal', note: 'Precision pivot irrigation operational. Prime vigor.' },
    { id: 5, name: 'Sector 2C (East Lowland)', ndvi: 0.74, ndre: 0.35, ndwi: 0.46, temp: 21.9, status: 'Water Accumulation', note: 'Low gradient accumulating sub-surface moisture.' },
    { id: 6, name: 'Sector 3A (Southwest Pivot)', ndvi: 0.81, ndre: 0.40, ndwi: 0.35, temp: 22.8, status: 'Healthy', note: 'Nutrient uptake consistent with vegetative phase.' },
    { id: 7, name: 'Sector 3B (South Access)', ndvi: 0.72, ndre: 0.33, ndwi: 0.28, temp: 24.2, status: 'Watchlist', note: 'Foliar dust along tractor lane, no pathogen detected.' },
    { id: 8, name: 'Sector 3C (Southeast Marsh)', ndvi: 0.88, ndre: 0.45, ndwi: 0.49, temp: 20.9, status: 'Dense Canopy', note: 'High organic matter, very strong photosynthetic output.' },
  ];

  const currentSectorData = sectors[selectedSector];

  const getSectorColor = (sector) => {
    if (activeBand === 'NDVI') {
      if (sector.ndvi >= 0.82) return 'bg-emerald-600/70 border-emerald-400 hover:bg-emerald-500/80';
      if (sector.ndvi >= 0.75) return 'bg-emerald-700/60 border-emerald-500/60 hover:bg-emerald-600/70';
      return 'bg-amber-600/60 border-amber-400/80 hover:bg-amber-500/70';
    }
    if (activeBand === 'NDRE') {
      if (sector.ndre >= 0.40) return 'bg-teal-600/70 border-teal-400 hover:bg-teal-500/80';
      return 'bg-teal-800/60 border-teal-500/50 hover:bg-teal-700/70';
    }
    if (activeBand === 'NDWI') {
      if (sector.ndwi >= 0.40) return 'bg-blue-600/70 border-blue-400 hover:bg-blue-500/80';
      if (sector.ndwi >= 0.30) return 'bg-cyan-700/60 border-cyan-400/60 hover:bg-cyan-600/70';
      return 'bg-amber-700/60 border-amber-400/80 hover:bg-amber-600/70';
    }
    // Thermal
    if (sector.temp >= 24.5) return 'bg-rose-700/70 border-rose-400 hover:bg-rose-600/80';
    if (sector.temp >= 22.0) return 'bg-amber-700/60 border-amber-400/60 hover:bg-amber-600/70';
    return 'bg-emerald-700/60 border-emerald-400/60 hover:bg-emerald-600/70';
  };

  return (
    <section id="satellite" className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Satellite className="w-4 h-4" />
              <span>Multispectral Earth Observation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Satellite Field Radar & Multispectral Imagery
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
              10-meter spatial resolution radiometry from European Space Agency Sentinel-2 constellation.
            </p>
          </div>

          {/* Band Selector Tabs */}
          <div className="flex flex-wrap gap-2 bg-dark-900/80 p-1.5 rounded-2xl border border-gray-800">
            {bands.map((band) => (
              <button
                key={band.id}
                onClick={() => setActiveBand(band.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeBand === band.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-dark-950 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                {band.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Interactive Grid & Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Simulated Satellite Grid (7 Cols) */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-gray-800 relative">
            
            {/* Top Bar with Orbit Telemetry */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-5 text-[11px] font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Orbit: Sentinel-2B · Azimuth 184.2°</span>
              </div>
              <div className="text-emerald-400 font-bold">
                Cloud Cover: 2.1% (Clear Sky)
              </div>
            </div>

            {/* 3x3 Parcel Grid */}
            <div className="grid grid-cols-3 gap-3 aspect-square sm:aspect-[4/3] p-3 bg-dark-950/80 rounded-2xl border border-gray-800 relative overflow-hidden">
              
              {/* Radar sweep line effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none animate-pulse-subtle"></div>

              {sectors.map((sec) => {
                const isSelected = selectedSector === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSector(sec.id)}
                    className={`relative rounded-xl p-3 flex flex-col justify-between border-2 transition-all text-left group ${getSectorColor(
                      sec
                    )} ${
                      isSelected
                        ? 'ring-4 ring-cyan-400/80 scale-[1.02] z-10 shadow-2xl'
                        : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] font-black text-white bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        {sec.name.split(' ')[1]}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-300"></span>
                      )}
                    </div>

                    <div className="mt-auto">
                      <div className="font-mono text-lg font-extrabold text-white drop-shadow-md">
                        {activeBand === 'NDVI' && sec.ndvi}
                        {activeBand === 'NDRE' && sec.ndre}
                        {activeBand === 'NDWI' && sec.ndwi}
                        {activeBand === 'Thermal' && `${sec.temp}°C`}
                      </div>
                      <div className="text-[10px] text-white/90 font-medium truncate drop-shadow-sm">
                        {sec.status}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend Bar */}
            <div className="flex items-center justify-between mt-4 text-[10px] font-mono text-gray-400">
              <span>Low Value (Stressed)</span>
              <div className="h-2 flex-1 mx-4 rounded-full bg-gradient-to-r from-amber-600 via-teal-500 to-emerald-500"></div>
              <span>High Value (Optimal Vigor)</span>
            </div>

          </div>

          {/* Sector Inspector Panel (5 Cols) */}
          <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-gray-800 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-mono text-cyan-400">Selected Parcel Telemetry</span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">{currentSectorData.name}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                currentSectorData.status === 'Healthy' || currentSectorData.status === 'Optimal' || currentSectorData.status === 'Dense Canopy'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
              }`}>
                {currentSectorData.status}
              </span>
            </div>

            {/* Sector Metric Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-dark-900 border border-gray-800">
                <span className="text-[10px] text-gray-400 block mb-1">NDVI Index</span>
                <span className="text-emerald-400 font-extrabold text-lg">{currentSectorData.ndvi}</span>
                <span className="text-[9px] text-gray-500 block">Biomass Absorption</span>
              </div>

              <div className="p-3 rounded-xl bg-dark-900 border border-gray-800">
                <span className="text-[10px] text-gray-400 block mb-1">NDRE Chlorophyll</span>
                <span className="text-teal-400 font-extrabold text-lg">{currentSectorData.ndre}</span>
                <span className="text-[9px] text-gray-500 block">Nitrogen Index</span>
              </div>

              <div className="p-3 rounded-xl bg-dark-900 border border-gray-800">
                <span className="text-[10px] text-gray-400 block mb-1">NDWI Hydration</span>
                <span className="text-cyan-400 font-extrabold text-lg">{currentSectorData.ndwi}</span>
                <span className="text-[9px] text-gray-500 block">Canopy Moisture</span>
              </div>

              <div className="p-3 rounded-xl bg-dark-900 border border-gray-800">
                <span className="text-[10px] text-gray-400 block mb-1">Surface Thermal</span>
                <span className="text-amber-400 font-extrabold text-lg">{currentSectorData.temp}°C</span>
                <span className="text-[9px] text-gray-500 block">Thermal Radiometry</span>
              </div>
            </div>

            {/* Field Observation Notes */}
            <div className="p-3.5 rounded-xl bg-dark-900/60 border border-gray-800 text-xs text-gray-300">
              <span className="font-semibold text-white block mb-1">Observation & Agronomic Notes:</span>
              <p className="text-gray-400 leading-relaxed">{currentSectorData.note}</p>
            </div>

            {/* Drone Dispatch / Action Button */}
            <div className="pt-2">
              <button
                onClick={() => alert(`Autonomous Scouting Drone scheduled for ${currentSectorData.name}. Waypoints uploaded.`)}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-dark-900 hover:bg-dark-800 text-emerald-400 border border-emerald-500/40 font-bold text-xs transition-colors"
              >
                <Crosshair className="w-4 h-4" />
                <span>Deploy Autonomous Scouting Drone to Sector</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

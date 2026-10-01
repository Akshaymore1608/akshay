import React, { useState } from 'react';
import { CloudRain, Wind, Sun, Droplets, Thermometer, ShieldAlert, CheckCircle2, Clock, Calendar } from 'lucide-react';

export default function WeatherSprayForecast() {
  const [selectedDay, setSelectedDay] = useState(0);

  const forecast = [
    {
      day: 'Today (Wed)',
      date: 'Sep 30',
      condition: 'Partly Sunny',
      tempMax: 26,
      tempMin: 14,
      rainChance: 10,
      rainMm: 0,
      windSpeed: 7,
      windDir: 'NNW',
      humidity: 52,
      deltaT: 4.8,
      et0: 4.6,
      soilTemp: 18.2,
      sprayStatus: 'Ideal Spray Window',
      sprayColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      sprayAdvice: 'Ideal conditions between 06:30 and 11:00 AM. Low drift risk with minimal droplet evaporation.',
    },
    {
      day: 'Thu',
      date: 'Oct 01',
      condition: 'Clear & Sunny',
      tempMax: 28,
      tempMin: 15,
      rainChance: 5,
      rainMm: 0,
      windSpeed: 11,
      windDir: 'N',
      humidity: 44,
      deltaT: 6.8,
      et0: 5.2,
      soilTemp: 19.4,
      sprayStatus: 'Marginal Spray Window',
      sprayColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      sprayAdvice: 'High afternoon evaporation rate. Spray only during early sunrise before wind exceeds 12 km/h.',
    },
    {
      day: 'Fri',
      date: 'Oct 02',
      condition: 'Overcast & Rain',
      tempMax: 21,
      tempMin: 16,
      rainChance: 85,
      rainMm: 18.4,
      windSpeed: 22,
      windDir: 'SW',
      humidity: 88,
      deltaT: 1.5,
      et0: 2.1,
      soilTemp: 17.5,
      sprayStatus: 'DO NOT SPRAY',
      sprayColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      sprayAdvice: 'Heavy precipitation incoming. High foliar wash-off and severe drift risk. Pause all chemical applications.',
    },
    {
      day: 'Sat',
      date: 'Oct 03',
      condition: 'Light Showers',
      tempMax: 22,
      tempMin: 13,
      rainChance: 40,
      rainMm: 3.2,
      windSpeed: 14,
      windDir: 'WNW',
      humidity: 76,
      deltaT: 2.8,
      et0: 3.0,
      soilTemp: 16.9,
      sprayStatus: 'Poor Conditions',
      sprayColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      sprayAdvice: 'Foliar wetness too persistent. Delay herbicide applications until leaf canopy is completely dry.',
    },
    {
      day: 'Sun',
      date: 'Oct 04',
      condition: 'Mostly Sunny',
      tempMax: 25,
      tempMin: 12,
      rainChance: 10,
      rainMm: 0,
      windSpeed: 6,
      windDir: 'N',
      humidity: 58,
      deltaT: 4.2,
      et0: 4.1,
      soilTemp: 17.8,
      sprayStatus: 'Optimal Conditions',
      sprayColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      sprayAdvice: 'Excellent recovery day. Perfect time for foliar micronutrient and biostimulant spraying.',
    },
  ];

  const current = forecast[selectedDay];

  return (
    <section id="weather" className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Sun className="w-4 h-4" />
              <span>Microclimate Agronomic Meteorology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              7-Day Crop Spray & Evapotranspiration Forecast
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
              Calculated specifically for agricultural drift prevention, Delta-T thresholds, and precision water replacement.
            </p>
          </div>

          <div className="text-xs font-mono text-gray-400 bg-dark-900 border border-gray-800 px-3 py-1.5 rounded-xl">
            Station: High Valley Agro-Met #09 (Elevation 410m)
          </div>
        </div>

        {/* 5-Day Card Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {forecast.map((day, idx) => {
            const isSelected = selectedDay === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(idx)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-dark-800/90 border-emerald-500/60 shadow-glow-emerald'
                    : 'glass-panel border-gray-800/80 hover:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-xs text-white">{day.day}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{day.date}</span>
                </div>
                <div className="text-lg font-mono font-extrabold text-white">
                  {day.tempMax}° / <span className="text-gray-400 text-sm font-normal">{day.tempMin}°</span>
                </div>
                <div className="text-[11px] text-gray-300 mt-1 flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-cyan-400" />
                  <span>{day.rainChance}% ({day.rainMm}mm)</span>
                </div>
                <div className="mt-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${day.sprayColor} block text-center truncate`}>
                    {day.sprayStatus}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Inspection for Selected Day */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Status & Advice (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${current.sprayColor}`}>
                  {current.sprayStatus}
                </div>
                <span className="text-xs text-gray-400 font-mono">Date: {current.day}, {current.date}</span>
              </div>

              <h4 className="text-xl sm:text-2xl font-extrabold text-white">
                Agronomic Spraying & Application Advisory
              </h4>

              <p className="text-sm text-gray-300 leading-relaxed bg-dark-900/60 p-4 rounded-2xl border border-gray-800/80">
                {current.sprayAdvice}
              </p>

              {/* Delta-T Explainer */}
              <div className="flex items-center gap-3 text-xs text-gray-400 font-mono pt-1">
                <span>Delta-T: <strong className="text-white">{current.deltaT}°C</strong> (Ideal: 2°C - 8°C)</span>
                <span>•</span>
                <span>Evapotranspiration (ET₀): <strong className="text-cyan-400">{current.et0} mm/day</strong></span>
              </div>
            </div>

            {/* Right Telemetry Cards (5 Cols) */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-dark-900 border border-gray-800">
                <span className="text-[10px] text-gray-400 flex items-center gap-1 mb-1">
                  <Wind className="w-3 h-3 text-cyan-400" />
                  Wind Velocity
                </span>
                <span className="text-lg font-bold text-white">{current.windSpeed} km/h</span>
                <span className="text-[10px] text-gray-500 block">Direction: {current.windDir}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-900 border border-gray-800">
                <span className="text-[10px] text-gray-400 flex items-center gap-1 mb-1">
                  <Droplets className="w-3 h-3 text-teal-400" />
                  Relative Humidity
                </span>
                <span className="text-lg font-bold text-white">{current.humidity}%</span>
                <span className="text-[10px] text-gray-500 block">Atmospheric</span>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-900 border border-gray-800">
                <span className="text-[10px] text-gray-400 flex items-center gap-1 mb-1">
                  <Thermometer className="w-3 h-3 text-amber-400" />
                  Soil Temperature
                </span>
                <span className="text-lg font-bold text-white">{current.soilTemp}°C</span>
                <span className="text-[10px] text-gray-500 block">Depth: 10cm profile</span>
              </div>

              <div className="p-3.5 rounded-xl bg-dark-900 border border-gray-800">
                <span className="text-[10px] text-gray-400 flex items-center gap-1 mb-1">
                  <CloudRain className="w-3 h-3 text-blue-400" />
                  Precipitation
                </span>
                <span className="text-lg font-bold text-white">{current.rainMm} mm</span>
                <span className="text-[10px] text-gray-500 block">Probability: {current.rainChance}%</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

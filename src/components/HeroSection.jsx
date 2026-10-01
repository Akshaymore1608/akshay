import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Database, Droplets, TrendingUp, Layers } from 'lucide-react';

export default function HeroSection() {
  const kpiStats = [
    {
      label: 'Avg. Yield Increase',
      value: '+24.8%',
      subtitle: 'Across 340+ commercial cycles',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      label: 'Irrigation Water Saved',
      value: '38.2%',
      subtitle: 'Dynamic evapotranspiration models',
      icon: Droplets,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    },
    {
      label: 'Fertilizer Runoff Cut',
      value: '-41.5%',
      subtitle: 'Precision N-P-K micro-dosing',
      icon: Layers,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20'
    },
    {
      label: 'Active Farmland Monitored',
      value: '4,850 Ha',
      subtitle: 'Real-time multi-spectral telemetry',
      icon: Cpu,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
  ];

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Autonomous Precision Agriculture & Agronomic Intelligence</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
            Autonomous Crop Advisory & <br className="hidden sm:inline" />
            <span className="gradient-text-emerald">Rhizosphere Intelligence</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Empowering agronomists and commercial growers with sub-surface soil telemetry, multispectral NDVI satellite tracking, and real-time AI yield optimization.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#diagnostics"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-dark-950 font-bold text-sm shadow-glow-emerald transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch Crop Diagnostic</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#telemetry"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-dark-900/80 hover:bg-dark-800 text-gray-200 border border-gray-700/80 font-semibold text-sm transition-all backdrop-blur-md hover:border-gray-600"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Inspect Live Telemetry</span>
            </a>
          </div>
        </div>

        {/* KPI Performance Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {kpiStats.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="glass-panel-interactive p-5 rounded-2xl relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400">{kpi.label}</span>
                  <div className={`p-2 rounded-xl ${kpi.bgColor} border ${kpi.borderColor}`}>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  {kpi.value}
                </div>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">{kpi.subtitle}</p>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

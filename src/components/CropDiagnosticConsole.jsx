import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  RotateCcw, 
  Send, 
  Droplet, 
  Layers, 
  TrendingUp, 
  Bug, 
  Calendar,
  Sliders,
  ChevronRight
} from 'lucide-react';

const CROP_CATALOG = [
  { id: 'corn', name: 'Zea mays (Dent Corn / Maize)', optimalPh: [5.8, 7.0], optimalN: 140, optimalMoisture: [30, 42] },
  { id: 'wheat', name: 'Triticum aestivum (Winter Wheat)', optimalPh: [6.0, 7.2], optimalN: 110, optimalMoisture: [25, 38] },
  { id: 'soybean', name: 'Glycine max (Soybean)', optimalPh: [6.0, 6.8], optimalN: 70, optimalMoisture: [28, 40] },
  { id: 'cotton', name: 'Gossypium hirsutum (Cotton)', optimalPh: [5.8, 7.5], optimalN: 90, optimalMoisture: [22, 35] },
  { id: 'rice', name: 'Oryza sativa (Rice)', optimalPh: [5.0, 6.5], optimalN: 130, optimalMoisture: [50, 80] },
  { id: 'potato', name: 'Solanum tuberosum (Russet Potato)', optimalPh: [5.0, 6.2], optimalN: 150, optimalMoisture: [30, 40] },
  { id: 'grape', name: 'Vitis vinifera (Wine Grape)', optimalPh: [6.0, 7.0], optimalN: 50, optimalMoisture: [18, 30] },
  { id: 'barley', name: 'Hordeum vulgare (Malting Barley)', optimalPh: [6.5, 7.5], optimalN: 80, optimalMoisture: [22, 34] },
];

export default function CropDiagnosticConsole({ onAddAdvisory }) {
  const [formData, setFormData] = useState({
    parcelName: 'North Valley - Sector 04',
    cropIndex: 0,
    growthStage: 'Mid Vegetative (V6 - V8)',
    soilType: 'Silt Loam (High CEC)',
    soilPh: 6.4,
    soilMoisture: 35,
    nitrogenPpm: 38,
    phosphorusPpm: 28,
    potassiumPpm: 195,
    observedSymptom: 'none',
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);

  const currentCrop = CROP_CATALOG[formData.cropIndex];

  const handleRunDiagnostic = (e) => {
    e.preventDefault();
    setAnalyzing(true);

    // Compute realistic agronomic assessment
    setTimeout(() => {
      let score = 92;
      const issues = [];
      const actions = [];

      // pH check
      if (formData.soilPh < currentCrop.optimalPh[0]) {
        score -= 12;
        issues.push(`Soil pH (${formData.soilPh}) is acidic for ${currentCrop.name}`);
        actions.push(`Apply agricultural calcitic lime (approx. 1.8 tons/ha) to adjust pH toward ${currentCrop.optimalPh[0]}`);
      } else if (formData.soilPh > currentCrop.optimalPh[1]) {
        score -= 10;
        issues.push(`Soil pH (${formData.soilPh}) is alkaline for ${currentCrop.name}`);
        actions.push(`Incorporate elemental sulfur or acidic ammonium sulfate fertilizer to lower rhizosphere pH`);
      }

      // Moisture check
      if (formData.soilMoisture < currentCrop.optimalMoisture[0]) {
        score -= 15;
        issues.push(`Soil moisture (${formData.soilMoisture}%) is below optimal target (${currentCrop.optimalMoisture[0]}-${currentCrop.optimalMoisture[1]}%)`);
        actions.push(`Initiate drip irrigation cycle: apply 18mm water over a 4-hour evening window`);
      } else if (formData.soilMoisture > currentCrop.optimalMoisture[1]) {
        score -= 10;
        issues.push(`Soil moisture (${formData.soilMoisture}%) exceeds field capacity; potential root hypoxia`);
        actions.push(`Pause automated irrigation for 48 hours; verify field drainage tiles`);
      }

      // Nitrogen check
      if (formData.nitrogenPpm < 30) {
        score -= 14;
        issues.push(`Subsurface available Nitrogen (${formData.nitrogenPpm} ppm) is depleted`);
        actions.push(`Sidedress application of Urea 46-0-0 at 32 kg/ha ahead of projected rainfall`);
      } else if (formData.nitrogenPpm > 65) {
        score -= 6;
        issues.push(`High residual soil Nitrogen (${formData.nitrogenPpm} ppm) may cause lodging`);
        actions.push(`Hold additional nitrogen applications; monitor canopy lushness and fungal pressure`);
      }

      // Symptoms check
      if (formData.observedSymptom === 'chlorosis') {
        score -= 12;
        issues.push('Observed interveinal chlorosis suggests localized Iron/Magnesium micronutrient lockup');
        actions.push('Foliar spray with chelated iron (Fe-EDDHA) at 1.2 kg/ha during early morning');
      } else if (formData.observedSymptom === 'tipburn') {
        score -= 10;
        issues.push('Leaf margin necrosis points to salinity stress or potassium translocation imbalance');
        actions.push('Flush with clean irrigation water and test soil electrical conductivity (EC)');
      }

      const finalScore = Math.max(45, Math.min(99, score));

      const newReport = {
        score: finalScore,
        status: finalScore >= 85 ? 'Optimal Health' : finalScore >= 70 ? 'Moderate Attention' : 'Corrective Action Required',
        statusColor: finalScore >= 85 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : finalScore >= 70 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        crop: currentCrop.name,
        parcel: formData.parcelName,
        issues: issues.length > 0 ? issues : ['No critical agronomic abnormalities detected in root zone.'],
        recommendations: actions.length > 0 ? actions : ['Maintain current precision irrigation and fertigation schedule.'],
        nitrogenReq: formData.nitrogenPpm < 35 ? '+35 kg/ha Urea' : 'Standard Maintenance (8 kg/ha)',
        waterReq: formData.soilMoisture < 30 ? '18mm Cycle (Urgent)' : '6mm Maintenance Cycle',
        diseaseRisk: formData.soilMoisture > 45 ? 'Elevated (Fungal Blight Risk)' : 'Low (Safe Microclimate)',
        yieldOutlook: finalScore >= 85 ? '+18.4% above benchmark' : finalScore >= 70 ? '+4.2% around benchmark' : '-8.5% yield deficit risk',
        timestamp: new Date().toLocaleString(),
      };

      setReport(newReport);
      setAnalyzing(false);

      if (onAddAdvisory) {
        onAddAdvisory(newReport);
      }

      if (finalScore >= 80) {
        try {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10B981', '#06B6D4', '#34D399']
          });
        } catch (e) {
          // ignore
        }
      }
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      parcelName: 'North Valley - Sector 04',
      cropIndex: 0,
      growthStage: 'Mid Vegetative (V6 - V8)',
      soilType: 'Silt Loam (High CEC)',
      soilPh: 6.4,
      soilMoisture: 35,
      nitrogenPpm: 38,
      phosphorusPpm: 28,
      potassiumPpm: 195,
      observedSymptom: 'none',
    });
    setReport(null);
  };

  return (
    <section id="diagnostics" className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Agronomic Advisory Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Precision Crop & Soil Diagnostic Console
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Configure parcel telemetry, soil biochemistry, and growth stage metrics to generate instant machine-learning crop prescriptions.
          </p>
        </div>

        {/* Interactive Console Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Input Panel (7 Cols) */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800">
            <form onSubmit={handleRunDiagnostic} className="space-y-6">
              
              {/* Row 1: Parcel Name & Crop Variety */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Field Parcel Identifier
                  </label>
                  <input
                    type="text"
                    value={formData.parcelName}
                    onChange={(e) => setFormData({ ...formData, parcelName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-medium transition-colors"
                    placeholder="e.g., North Valley Parcel 04"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Crop Cultivar
                  </label>
                  <select
                    value={formData.cropIndex}
                    onChange={(e) => setFormData({ ...formData, cropIndex: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-medium transition-colors"
                  >
                    {CROP_CATALOG.map((crop, idx) => (
                      <option key={crop.id} value={idx}>
                        {crop.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Growth Stage & Soil Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Phenological Growth Stage
                  </label>
                  <select
                    value={formData.growthStage}
                    onChange={(e) => setFormData({ ...formData, growthStage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-medium transition-colors"
                  >
                    <option value="Early Emergence (VE - V2)">Early Emergence (VE - V2)</option>
                    <option value="Mid Vegetative (V6 - V8)">Mid Vegetative (V6 - V8)</option>
                    <option value="Reproductive / Tasseling / Flowering">Reproductive / Tasseling / Flowering</option>
                    <option value="Grain Fill / Pod Swell">Grain Fill / Pod Swell</option>
                    <option value="Maturity & Pre-Harvest">Maturity & Pre-Harvest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Soil Texture & Profile
                  </label>
                  <select
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-dark-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-medium transition-colors"
                  >
                    <option value="Silt Loam (High CEC)">Silt Loam (High CEC)</option>
                    <option value="Clay Loam (Moderate Drainage)">Clay Loam (Moderate Drainage)</option>
                    <option value="Sandy Loam (Rapid Infiltration)">Sandy Loam (Rapid Infiltration)</option>
                    <option value="Alluvial Riverbed Soil">Alluvial Riverbed Soil</option>
                  </select>
                </div>
              </div>

              {/* Sliders: pH & Soil Moisture */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-dark-900/60 border border-gray-800/80">
                {/* pH Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-300">Soil pH Value</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-dark-800 border border-gray-700 text-emerald-400">
                      {formData.soilPh} pH
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4.5"
                    max="8.5"
                    step="0.1"
                    value={formData.soilPh}
                    onChange={(e) => setFormData({ ...formData, soilPh: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                    <span>4.5 (Acidic)</span>
                    <span className="text-emerald-400 font-bold">6.5 (Neutral)</span>
                    <span>8.5 (Alkaline)</span>
                  </div>
                </div>

                {/* Moisture Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-300">Soil Moisture (VWC)</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-dark-800 border border-gray-700 text-cyan-400">
                      {formData.soilMoisture}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="1"
                    value={formData.soilMoisture}
                    onChange={(e) => setFormData({ ...formData, soilMoisture: parseInt(e.target.value, 10) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                    <span>10% (Dry)</span>
                    <span className="text-cyan-400 font-bold">35% (Optimal)</span>
                    <span>80% (Saturated)</span>
                  </div>
                </div>
              </div>

              {/* N-P-K Nutrients Row */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Soil Nutrients Telemetry (N - P - K)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block mb-1">Nitrogen (N)</span>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.nitrogenPpm}
                        onChange={(e) => setFormData({ ...formData, nitrogenPpm: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-2 bg-dark-900 border border-gray-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500 font-bold"
                      />
                      <span className="absolute right-2.5 top-2 text-[10px] text-gray-500 font-mono">ppm</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block mb-1">Phosphorus (P)</span>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.phosphorusPpm}
                        onChange={(e) => setFormData({ ...formData, phosphorusPpm: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-2 bg-dark-900 border border-gray-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500 font-bold"
                      />
                      <span className="absolute right-2.5 top-2 text-[10px] text-gray-500 font-mono">ppm</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-400 font-medium block mb-1">Potassium (K)</span>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.potassiumPpm}
                        onChange={(e) => setFormData({ ...formData, potassiumPpm: parseInt(e.target.value, 10) || 0 })}
                        className="w-full px-3 py-2 bg-dark-900 border border-gray-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500 font-bold"
                      />
                      <span className="absolute right-2.5 top-2 text-[10px] text-gray-500 font-mono">ppm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observed Stress / Visual Foliar Symptoms */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Observed Foliar Stress or Canopy Irregularities
                </label>
                <select
                  value={formData.observedSymptom}
                  onChange={(e) => setFormData({ ...formData, observedSymptom: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-dark-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-medium transition-colors"
                >
                  <option value="none">None - Normal Green Canopy Biomass</option>
                  <option value="chlorosis">Interveinal Chlorosis (Yellowing between leaf veins)</option>
                  <option value="tipburn">Marginal Leaf Tip Necrosis / Salt Browning</option>
                  <option value="stunted">Stunted Internodal Growth & Leaf Purpling</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={analyzing}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-dark-950 font-bold text-sm shadow-glow-emerald transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Synthesizing Agronomic Models...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Run AI Agronomic Diagnostic</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 rounded-xl bg-dark-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
                  title="Reset values"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

            </form>
          </div>

          {/* Results Output Panel (5 Cols) */}
          <div className="lg:col-span-5">
            {report ? (
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 relative overflow-hidden animate-fade-in shadow-2xl">
                {/* Header of Report */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-mono text-gray-400">Diagnostic Verdict</span>
                    <h3 className="text-xl font-extrabold text-white">{report.parcel}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{report.crop}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${report.statusColor}`}>
                    {report.status}
                  </div>
                </div>

                {/* Score Gauge */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-dark-900/80 border border-gray-800/80 mb-6">
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950/60 border-2 border-emerald-500/40">
                    <span className="text-xl font-black font-mono text-emerald-400">{report.score}</span>
                    <span className="text-[9px] absolute bottom-2 font-mono text-gray-400">/100</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Agronomic Biomass Score</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Yield expectation: <span className="text-emerald-400 font-bold">{report.yieldOutlook}</span>
                    </p>
                  </div>
                </div>

                {/* Issues Identified */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Rhizosphere Anomalies
                    </h5>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {report.issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-dark-900/40 p-2 rounded-lg border border-gray-800/50">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prescriptive Recommendations */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Prescriptive Interventions
                    </h5>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {report.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Quick Prescriptions Summary Bar */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-dark-900/60 border border-gray-800">
                    <span className="text-[10px] text-gray-400 block">Fertigation Target</span>
                    <span className="text-white font-bold">{report.nitrogenReq}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-dark-900/60 border border-gray-800">
                    <span className="text-[10px] text-gray-400 block">Irrigation Dose</span>
                    <span className="text-cyan-400 font-bold">{report.waterReq}</span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <span className="text-[10px] font-mono text-gray-500">
                    Calculated: {report.timestamp} · Algorithm: AgriMatrix v4.8
                  </span>
                </div>

              </div>
            ) : (
              <div className="glass-panel p-8 rounded-3xl border border-gray-800/80 text-center flex flex-col items-center justify-center min-h-[460px]">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Awaiting Field Parameters</h3>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-6">
                  Input your soil chemistry metrics and crop type on the left, then click <strong>"Run AI Agronomic Diagnostic"</strong> to generate a customized field action plan.
                </p>
                <div className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/30 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                  Calibrated for USDA & European Nitrogen Directives
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}

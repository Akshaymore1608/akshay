import React, { useState, useEffect } from 'react';
import { Sprout, Activity, ShieldCheck, Download, ChevronRight, Menu, X } from 'lucide-react';

export default function Navbar({ onQuickDiagnostic }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [livePulse, setLivePulse] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Telemetry Stream', href: '#telemetry' },
    { name: 'AI Diagnostics', href: '#diagnostics' },
    { name: 'Satellite NDVI', href: '#satellite' },
    { name: 'Spray & Weather', href: '#weather' },
    { name: 'Advisory Log', href: '#advisories' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-950/90 backdrop-blur-md border-b border-gray-800/80 shadow-2xl py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-glow-emerald">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                <Sprout className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  AGRO<span className="text-emerald-400">-AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 uppercase tracking-wider">
                  Enterprise v4.8
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium hidden md:block">
                Precision Agriculture & Autonomous Agronomy
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-dark-900/60 p-1.5 rounded-xl border border-gray-800/80 backdrop-blur-md">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/70 rounded-lg transition-all"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Telemetry Status & CTA */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-300 font-mono text-[11px] font-medium">
                Telemetry: Online (1,420 Ha)
              </span>
            </div>

            <a
              href="#diagnostics"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-dark-950 font-bold text-xs shadow-glow-emerald transition-all transform hover:-translate-y-0.5"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Run Diagnostic</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-dark-900 border border-gray-800 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 p-4 rounded-2xl bg-dark-900 border border-gray-800 space-y-3 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs mb-3">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-300 font-mono text-xs">
                Telemetry: Online · 1,420 Ha Monitored
              </span>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <a
              href="#diagnostics"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-dark-950 font-bold text-xs"
            >
              <Activity className="w-4 h-4" />
              <span>Launch Diagnostic Tool</span>
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}

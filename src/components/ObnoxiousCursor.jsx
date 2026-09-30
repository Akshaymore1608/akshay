import React, { useState, useEffect } from 'react';

export default function ObnoxiousCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trails, setTrails] = useState([]);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    let trailArray = Array.from({ length: 12 }, () => ({ x: -100, y: -100 }));

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });

      // Shift trail positions
      trailArray = [
        { x: e.clientX + (Math.random() * 20 - 10), y: e.clientY + (Math.random() * 20 - 10) },
        ...trailArray.slice(0, 11)
      ];
      setTrails([...trailArray]);
    };

    const handleMouseDown = () => {
      setClicked(true);
      setTimeout(() => setClicked(false), 250);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden">
      {/* Obnoxious Jittery Trails that occlude text */}
      {trails.map((t, idx) => (
        <div
          key={idx}
          className="absolute rounded-full font-bold text-[10px] flex items-center justify-center transition-all duration-75 select-none"
          style={{
            left: `${t.x}px`,
            top: `${t.y}px`,
            transform: `translate(-50%, -50%) scale(${1 - idx * 0.07}) rotate(${idx * 30}deg)`,
            width: `${40 + idx * 4}px`,
            height: `${40 + idx * 4}px`,
            backgroundColor: idx % 3 === 0 ? 'rgba(255, 0, 127, 0.7)' : idx % 3 === 1 ? 'rgba(255, 255, 0, 0.7)' : 'rgba(0, 240, 255, 0.7)',
            border: '2px dashed #39FF14',
            opacity: 0.85 - idx * 0.06,
          }}
        >
          {idx === 1 && "🚜"}
          {idx === 4 && "🌽"}
          {idx === 7 && "⚠️"}
        </div>
      ))}

      {/* Main Massive Custom Cursor (Tractor + Radioactive Corn + Offset Pointer) */}
      <div
        className="absolute transition-transform duration-75 select-none flex flex-col items-center"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: `translate(-25%, -20%) scale(${clicked ? 1.4 : 1})`,
        }}
      >
        <div className="relative">
          {/* Obnoxious Giant Icon */}
          <div className="text-5xl filter drop-shadow-[0_0_12px_#FF007F] animate-bounce">
            🚜🌽
          </div>
          {/* Confusing Laser Sight Crosshair that is intentionally off-center */}
          <div className="absolute -top-3 -left-3 w-8 h-8 border-4 border-dashed border-red-600 rounded-full animate-spin"></div>
        </div>

        {/* Floating Confusing Tag */}
        <span className="bg-black text-[#FFFF00] font-black text-xs px-2 py-0.5 border-2 border-[#00F0FF] uppercase tracking-widest whitespace-nowrap shadow-lg">
          [QUANTUM POINTER ±14px]
        </span>
      </div>
    </div>
  );
}

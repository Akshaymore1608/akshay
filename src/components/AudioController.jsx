import React, { useState } from 'react';
import { boostAnnoyanceAudio, playScreechBeep } from '../utils/audio';

export default function AudioController() {
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState("🔊 MUTE SOUND");

  const handleClick = (e) => {
    e.stopPropagation();
    const newMultiplier = boostAnnoyanceAudio();
    setLevel((l) => l + 1);

    const msgs = [
      "🔊 SOUND BOOSTED TO 150% (CROP REQUIREMENT)",
      "🔊 SOUND BOOSTED TO 250% (PHOTOSYNTHESIS ACCELERATED)",
      "📢 VOLUME AT MAXIMUM ULTRASONIC FREQUENCY",
      "🚨 HARVEST HORNS PERMANENTLY ENGAGED",
    ];
    setMessage(msgs[level % msgs.length]);
  };

  return (
    <div className="fixed top-20 right-4 z-40">
      <button
        onClick={handleClick}
        className="px-3 py-1.5 font-mono text-xs font-black uppercase bg-[#FF007F] text-[#FFFF00] border-4 border-black hover:bg-[#39FF14] hover:text-black shadow-[4px_4px_0px_#000] active:scale-95 transition-all select-none"
      >
        {message}
      </button>
    </div>
  );
}

import React from 'react';
import { Globe } from 'lucide-react';

export default function AccentToggle({ accentMode, setAccentMode }) {
  return (
    <div className="flex items-center gap-4">
      <Globe className="w-5 h-5 text-white" />
      <div className="flex bg-white bg-opacity-20 rounded-full p-1">
        <button
          onClick={() => setAccentMode('modern-rp')}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            accentMode === 'modern-rp'
              ? 'bg-white text-british-navy shadow-lg'
              : 'text-white hover:bg-white hover:bg-opacity-10'
          }`}
        >
          🇬🇧 RP
        </button>
        <button
          onClick={() => setAccentMode('general-american')}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            accentMode === 'general-american'
              ? 'bg-white text-british-navy shadow-lg'
              : 'text-white hover:bg-white hover:bg-opacity-10'
          }`}
        >
          🇺🇸 GenAm
        </button>
      </div>
    </div>
  );
}

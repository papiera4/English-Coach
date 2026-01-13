import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function SectionCard({ title, icon, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-effect rounded-lg overflow-hidden mb-6 border border-white border-opacity-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-white hover:bg-opacity-5 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-serif font-bold text-british-navy">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-british-navy" />
        ) : (
          <ChevronDown className="w-5 h-5 text-british-navy" />
        )}
      </button>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-white border-opacity-10">
          {children}
        </div>
      )}
    </div>
  );
}

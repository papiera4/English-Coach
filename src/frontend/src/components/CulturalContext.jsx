import React from 'react';
import { Landmark, ArrowRight, Quote } from 'lucide-react';

export default function CulturalContext({ contexts }) {
  if (!contexts || contexts.length === 0) return null;

  return (
    <div className="space-y-4">
      {contexts.map((item, index) => (
        <div key={index} className="bg-white rounded-lg p-4 border border-british-navy border-opacity-5 relative overflow-hidden">
          {/* Decorative Background Icon */}
          <Landmark className="absolute -top-2 -right-2 w-24 h-24 text-british-gold opacity-5 pointer-events-none" />

          {/* Original Text Quote */}
          <div className="flex items-start gap-2 mb-3">
            <Quote className="w-4 h-4 text-british-maroon flex-shrink-0 mt-1" />
            <p className="text-british-maroon font-serif italic text-lg leading-relaxed">
              "{item.originalText}"
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {/* Cultural Context */}
            <div className="bg-british-navy bg-opacity-5 rounded-lg p-3">
              <h5 className="text-xs font-bold text-british-navy uppercase tracking-wider mb-1 opacity-70">
                Cultural Resonance
              </h5>
              <p className="text-sm text-british-navy leading-relaxed">
                {item.context}
              </p>
            </div>

            {/* Implication */}
            <div className="bg-british-gold bg-opacity-10 rounded-lg p-3">
              <h5 className="text-xs font-bold text-british-navy uppercase tracking-wider mb-1 opacity-70 flex items-center gap-1">
                Implication <ArrowRight className="w-3 h-3" />
              </h5>
              <p className="text-sm text-british-navy leading-relaxed">
                {item.implication}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

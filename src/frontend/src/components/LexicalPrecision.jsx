import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function LexicalPrecision({ keywords }) {
  if (!keywords || !Array.isArray(keywords)) return null;
  
  return (
    <div className="space-y-4">
      {keywords.map((item, idx) => (
        <div key={idx} className="bg-white rounded-lg p-4 border border-british-navy border-opacity-10">
          <div className="flex items-start gap-3">
            <span className="inline-block bg-british-gold text-british-navy font-bold rounded-full w-7 h-7 flex items-center justify-center text-sm flex-shrink-0">
              {idx + 1}
            </span>
            <div className="flex-grow">
              <h4 className="font-serif font-bold text-british-navy text-lg">{item.word}</h4>
              <p className="text-british-navy text-opacity-70 text-sm mb-2">
                Better than: <span className="italic">"{item.betterThan}"</span>
              </p>
              <div className="bg-british-navy bg-opacity-5 rounded p-2 text-sm text-british-navy">
                {item.reason}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

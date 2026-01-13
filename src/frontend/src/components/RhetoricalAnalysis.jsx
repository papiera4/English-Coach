import React from 'react';

export default function RhetoricalAnalysis({ analysis }) {
  if (!analysis || analysis.length === 0) return null;

  return (
    <div className="space-y-4">
      {analysis.map((item, index) => (
        <div key={index} className="bg-white rounded-lg p-4 border border-british-navy border-opacity-10 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✍️</span>
            <span className="font-serif font-bold text-british-gold">{item.device}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
            <div className="bg-gray-50 p-2 rounded">
              <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Original</span>
              <p className="text-british-navy italic">"{item.originalUsage}"</p>
            </div>
            
            <div className={`p-2 rounded ${item.critique.toLowerCase().includes('good') || item.critique.toLowerCase().includes('excellent') ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Your Attempt</span>
              <p className="text-british-navy">"{item.userAttempt}"</p>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-british-navy border-t border-gray-100 pt-2">
             <span className="font-semibold">Critique: </span>{item.critique}
          </div>
        </div>
      ))}
    </div>
  );
}

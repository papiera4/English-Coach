import React from 'react';

export default function RhetoricalAnalysis({ analysis }) {
  if (!analysis || !Array.isArray(analysis) || analysis.length === 0) return null;

  return (
    <div className="space-y-4">
      {analysis.map((item, index) => (
        <div key={index} className="bg-white rounded-lg p-4 border border-british-navy border-opacity-10 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">✍️</span>
            <span className="font-serif font-bold text-british-gold">{item.device || 'Rhetorical Device'}</span>
          </div>
          
          <div className="text-sm mt-3">
            <div className="bg-gray-50 p-2 rounded mb-2">
              <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Excerpt</span>
              <p className="text-british-navy italic">"{item.excerpt || item.originalUsage}"</p>
            </div>
            
            {/* Conditional rendering for effect (Analysis mode) vs critique (Feedback mode - legacy support) */}
            {item.effect ? (
              <div className="bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                 <span className="block text-xs uppercase tracking-wider text-blue-800 mb-1">Rhetorical Effect</span>
                 <p className="text-british-navy text-sm">{item.effect}</p>
              </div>
            ) : item.critique ? (
              <div className={`p-2 rounded ${item.critique?.toLowerCase()?.includes('good') ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Critique</span>
                <p className="text-british-navy text-sm">{item.critique}</p>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

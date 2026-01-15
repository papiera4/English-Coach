import React from 'react';
import SectionCard from './SectionCard';
import LexicalPrecision from './LexicalPrecision';
import AudioPerformance from './AudioPerformance';
import ImitationChallenge from './ImitationChallenge';
import CulturalContext from './CulturalContext';
import L1LogicGap from './L1LogicGap';
import RhetoricalAnalysis from './RhetoricalAnalysis';

export default function AnalysisDisplay({ analysis, accentMode, currentText }) {
  // Guard clause to prevent crash if analysis data is missing
  if (!analysis || !analysis.analysis) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Analysis data is unavailable or malformed.
      </div>
    );
  }

  const { audioUrl } = analysis;
  const { 
    genre, 
    atmosphere, 
    lexicalPrecision, 
    audioPerformance, 
    imitationChallenge,
    culturalContext,
    rhetoricalDevices, 
    connotationNuance,
    l1LogicGap 
  } = analysis.analysis;

  return (
    <div className="space-y-6">
      {/* Original Text Display */}
      <SectionCard title="Original Text" icon="📄" defaultOpen={true}>
        <div className="p-4 bg-white rounded-lg shadow-sm">
           <p className="text-british-navy text-lg leading-relaxed font-serif whitespace-pre-wrap">{currentText}</p>
           {audioUrl && (
             <div className="mt-4 pt-3 border-t border-gray-100">
               <div className="flex items-center gap-3">
                 <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Narrator Audio</span>
                 <audio controls src={audioUrl} className="flex-1 h-8 focus:outline-none" />
               </div>
             </div>
           )}
        </div>
      </SectionCard>

      {/* Pragmatics & Tone (Formerly Context & Atmosphere) */}
      <SectionCard title="Pragmatics & Tone" icon="🎭" defaultOpen={true}>
        <div className="space-y-5">
          {/* Genre Info */}
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3">
              <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Genre</span>
              <span className="text-base text-british-gold font-serif">{genre?.type || 'N/A'}</span>
            </div>
            <div className="bg-white rounded-lg p-3">
              <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Register</span>
              <span className="text-base text-british-gold font-serif">{genre?.register || 'N/A'}</span>
            </div>
          </div>

          {/* Strategy */}
          <div className="bg-british-navy bg-opacity-5 rounded-lg p-3">
            <p className="text-xs uppercase tracking-wider text-gray-600 mb-1">Rhetorical Strategy</p>
            <p className="text-sm text-british-navy">{genre?.strategy || 'N/A'}</p>
          </div>

          {/* Mood & Evidence */}
          <div className="border-t pt-4">
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wider text-gray-600 block mb-1">Mood</p>
              <p className="text-sm font-semibold text-british-navy">{atmosphere?.mood || 'N/A'}</p>
            </div>
            
            {/* Deductive Reasoning for Atmosphere */}
            {atmosphere?.evidence && (
              <div className="bg-gray-50 rounded p-3 mb-3 border border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Linguistic Markers</p>
                <p className="text-sm text-british-navy italic">"{atmosphere.evidence}"</p>
              </div>
            )}

            <div className="bg-blue-50 border-l-4 border-british-gold rounded-r-lg p-3">
              <p className="text-xs uppercase tracking-wider text-gray-600 mb-2">Pragmatic Implicature</p>
              <p className="text-sm text-british-navy italic">{atmosphere?.unspokenMessage || 'N/A'}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Lexis & Semantics (Formerly Word Choices) */}
      <SectionCard title="Lexis & Semantics" icon="💎" defaultOpen={true}>
        <div className="space-y-6">
          {/* Detailed Nuance Analysis */}
          {connotationNuance && connotationNuance.length > 0 && (
             <div className="space-y-3">
               <h4 className="text-xs uppercase tracking-wider text-gray-500 border-b pb-1">Connotation & Nuance</h4>
               {connotationNuance.map((item, i) => (
                 <div key={i} className="bg-gradient-to-r from-gray-50 to-white rounded p-3 border border-gray-100 shadow-sm">
                   <div className="flex justify-between items-start">
                     <span className="font-serif font-bold text-british-navy">{item.word}</span>
                     <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.connotation?.toLowerCase().includes('pos') ? 'bg-green-100 text-green-700' : 
                        item.connotation?.toLowerCase().includes('neg') ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                     }`}>{item.connotation}</span>
                   </div>
                   <p className="text-sm text-gray-700 mt-2 italic">{item.nuance}</p>
                 </div>
               ))}
             </div>
          )}

          {/* Vocabulary List */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 border-b pb-1">Lexical Precision</h4>
            {lexicalPrecision && lexicalPrecision.map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border-l-4 border-british-gold shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-serif font-bold text-lg text-british-navy">{item.word}</h4>
                </div>
                
                <p className="text-sm text-british-navy mb-2">{item.reason}</p>
                
                {item.betterThan && (
                  <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                    <span className="font-semibold">Contextual Contrast:</span> Preferred over <span className="decoration-red-400">{item.betterThan}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
      
      {/* L1 Logic Gap - New Component Integration */}
      {l1LogicGap && (
        <SectionCard title="L1 Transfer Analysis" icon="🧠" defaultOpen={true}>
          <L1LogicGap gap={l1LogicGap} />
        </SectionCard>
      )}

      {/* Cultural Context */}
      {culturalContext && culturalContext.length > 0 && (
        <SectionCard title="Cultural & Textual Analysis" icon="🌍" defaultOpen={true}>
          <CulturalContext contexts={culturalContext} />
        </SectionCard>
      )}

      {/* Rhetorical Analysis - Integration */}
      {rhetoricalDevices && rhetoricalDevices.length > 0 && (
        <SectionCard title="Rhetorical Analysis" icon="✨" defaultOpen={false}>
          {/* Note: RhetoricalAnalysis component needs to handle the display logic, 
              or we iterate here. Existing RhetoricalAnalysis component assumes 'analysis' prop is the array. */}
          <RhetoricalAnalysis analysis={rhetoricalDevices} /> 
        </SectionCard>
      )}

      {/* Prosodic Features */}
      <SectionCard title="Prosodic Features" icon="📊" defaultOpen={false}>
          <div className="text-sm text-gray-600 mb-3">
             Analysis of stress, intonation, and rhythm. ({accentMode === 'modern-rp' ? 'UK' : 'US'})
          </div>
          <AudioPerformance 
            audio={audioPerformance} 
            accentMode={accentMode} 
            mood={atmosphere ? atmosphere.mood : ''}
          />
      </SectionCard>

      {/* Active Imitation */}
      <SectionCard title="Active Imitation Challenge" icon="✍️" defaultOpen={false}>
        <ImitationChallenge 
          challenge={imitationChallenge}
          originalText={currentText}
          genre={genre?.type}
          accentMode={accentMode}
        />
      </SectionCard>
    </div>
  );
}
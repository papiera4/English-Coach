import React from 'react';
import SectionCard from './SectionCard';
import LexicalPrecision from './LexicalPrecision';
import AudioPerformance from './AudioPerformance';
import ImitationChallenge from './ImitationChallenge';
import CulturalContext from './CulturalContext';

export default function AnalysisDisplay({ analysis, accentMode, currentText }) {
  const { 
    genre, 
    atmosphere, 
    lexicalPrecision, 
    audioPerformance, 
    imitationChallenge,
    culturalContext 
  } = analysis.analysis;

  return (
    <div className="space-y-6">
      {/* Original Text Display */}
      <SectionCard title="Original Text" icon="📄" defaultOpen={true}>
        <div className="p-4 bg-white rounded-lg shadow-sm">
           <p className="text-british-navy text-lg leading-relaxed font-serif whitespace-pre-wrap">{currentText}</p>
        </div>
      </SectionCard>

      {/* Genre, Atmosphere & Subtext Combined */}
      <SectionCard title="Context & Atmosphere" icon="🎭" defaultOpen={true}>
        <div className="space-y-5">
          {/* Genre Info */}
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3">
              <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Genre Type</span>
              <span className="text-base text-british-gold font-serif">{genre.type}</span>
            </div>
            <div className="bg-white rounded-lg p-3">
              <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Register</span>
              <span className="text-base text-british-gold font-serif">{genre.register}</span>
            </div>
          </div>

          {/* Strategy */}
          <div className="bg-british-navy bg-opacity-5 rounded-lg p-3">
            <p className="text-xs uppercase tracking-wider text-gray-600 mb-1">Writing Strategy</p>
            <p className="text-sm text-british-navy">{genre.strategy}</p>
          </div>

          {/* Unspoken Message & Evidence */}
          <div className="border-t pt-4">
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wider text-gray-600 block mb-1">Emotional Tone</p>
              <p className="text-sm font-semibold text-british-navy">{atmosphere.mood}</p>
            </div>
            
            {/* Deductive Reasoning for Atmosphere */}
            {atmosphere.evidence && (
              <div className="bg-gray-50 rounded p-3 mb-3 border border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Evidence</p>
                <p className="text-sm text-british-navy italic">"{atmosphere.evidence}"</p>
              </div>
            )}

            <div className="bg-blue-50 border-l-4 border-british-gold rounded-r-lg p-3">
              <p className="text-xs uppercase tracking-wider text-gray-600 mb-2">Analysis</p>
              <p className="text-sm text-british-navy italic">{atmosphere.unspokenMessage}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Lexical Precision & Connotation Nuance Combined */}
      <SectionCard title="Word Choices & Nuances" icon="💎" defaultOpen={true}>
        <div className="space-y-6">
          {/* Detailed Nuance Analysis (Separated) */}
          {analysis.analysis.connotationNuance && analysis.analysis.connotationNuance.length > 0 && (
             <div className="space-y-3">
               <h4 className="text-xs uppercase tracking-wider text-gray-500 border-b pb-1">Connotation Spectrum</h4>
               {analysis.analysis.connotationNuance.map((item, i) => (
                 <div key={i} className="bg-gradient-to-r from-gray-50 to-white rounded p-3 border border-gray-100 shadow-sm">
                   <div className="flex justify-between items-start">
                     <span className="font-serif font-bold text-british-navy">{item.word}</span>
                     <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.connotation.toLowerCase().includes('pos') ? 'bg-green-100 text-green-700' : 
                        item.connotation.toLowerCase().includes('neg') ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
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
            {lexicalPrecision.map((item, i) => (
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

      {/* Cultural Context - Now after Lexical Precision */}
      {culturalContext && culturalContext.length > 0 && (
        <SectionCard title="Cultural & Textual Analysis" icon="🌍" defaultOpen={true}>
          <CulturalContext contexts={culturalContext} />
        </SectionCard>
      )}

      {/* Rhetorical Devices */}
      {analysis.analysis.rhetoricalDevices && analysis.analysis.rhetoricalDevices.length > 0 && (
        <SectionCard title="Rhetorical Techniques" icon="✨" defaultOpen={false}>
          <div className="space-y-4">
            {analysis.analysis.rhetoricalDevices.map((dev, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border-l-4 border-british-gold">
                <h4 className="font-serif font-bold text-british-navy mb-2">{dev.device}</h4>
                <p className="text-sm italic text-gray-600 bg-gray-50 p-2 rounded mb-2">"{dev.excerpt}"</p>
                <p className="text-sm text-british-navy">{dev.effect}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Audio Performance - Simplified to only show breakdown */}
      <SectionCard title="Acoustic Breakdown" icon="📊" defaultOpen={false}>
          {/* Audio Player Section Removed - Integrated into breakdown items */}
          <div className="text-sm text-gray-600 mb-3">
             Phonetic breakdown of the text structure, stress, and intonation. ({accentMode === 'modern-rp' ? 'UK' : 'US'})
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
          genre={genre.type}
          accentMode={accentMode}
        />
      </SectionCard>
    </div>
  );
}
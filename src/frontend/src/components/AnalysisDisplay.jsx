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
      {/* Genre & Context Radar */}
      <SectionCard title="Genre & Context Radar" icon="🏷️" defaultOpen={true}>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <span className="text-sm font-semibold text-british-navy block mb-1">Type</span>
            <span className="text-lg text-british-gold font-serif">{genre.type}</span>
          </div>
          <div className="bg-white rounded-lg p-4">
            <span className="text-sm font-semibold text-british-navy block mb-1">Register</span>
            <span className="text-lg text-british-gold font-serif">{genre.register}</span>
          </div>
        </div>
        <div className="mt-4 bg-british-navy bg-opacity-5 rounded-lg p-4">
          <p className="text-sm text-british-navy"><span className="font-semibold">Strategy:</span> {genre.strategy}</p>
        </div>
      </SectionCard>

      {/* Atmosphere & Subtext */}
      <SectionCard title="Atmosphere & Subtext" icon="🔍" defaultOpen={true}>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-british-navy text-opacity-70 mb-2">Mood</p>
            <p className="text-british-navy font-semibold">{atmosphere.mood}</p>
          </div>
          <div className="bg-british-navy bg-opacity-5 rounded-lg p-4">
            <p className="text-sm text-british-navy text-opacity-70 mb-2">The "Unspoken" Message</p>
            <p className="text-british-navy italic">{atmosphere.unspokenMessage}</p>
          </div>
        </div>
      </SectionCard>

      {/* Lexical Precision */}
      <SectionCard title="Lexical Precision" icon="💎" defaultOpen={true}>
        <LexicalPrecision keywords={lexicalPrecision} />
      </SectionCard>

      {/* Cultural Context - Now after Lexical Precision */}
      {culturalContext && culturalContext.length > 0 && (
        <SectionCard title="Cultural & Textual Analysis" icon="🌍" defaultOpen={true}>
          <CulturalContext contexts={culturalContext} />
        </SectionCard>
      )}

      {/* Audio Performance */}
      <SectionCard title="Audio Performance (Accent Specific)" icon="🎧" defaultOpen={false}>
        <div className="mb-2 text-sm font-semibold text-british-navy">
          Current Mode: {accentMode === 'modern-rp' ? '🇬🇧 Modern RP (British)' : '🇺🇸 General American (GenAm)'}
        </div>
        <AudioPerformance audio={audioPerformance} accentMode={accentMode} />
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

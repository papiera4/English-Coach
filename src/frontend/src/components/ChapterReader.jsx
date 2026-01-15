import React from 'react';
import { Volume2, FileText, Activity } from 'lucide-react';
import AudioPerformance from './AudioPerformance';
import SimpleTTSButton from './SimpleTTSButton';
import SpeakingPractice from './SpeakingPractice';
import CharacterChat from './CharacterChat';

export default function ChapterReader({ paragraphs, analysis, accentMode }) {
  if (!paragraphs || paragraphs.length === 0) {
    return <div className="p-8 text-center text-gray-500">No content available.</div>;
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-10 p-4 border-b border-british-navy/10 shadow-sm mb-4 rounded-b-xl">
        <h2 className="text-xl font-serif font-bold text-british-navy flex items-center gap-2">
            <FileText className="w-5 h-5 text-british-gold" />
            Chapter Reader
        </h2>
        
        {/* Chapter Analysis Modules */}
        {analysis && (
            <div className="space-y-6 mt-6">
                
                {/* 1. Narrative Arc / Summary */}
                <div className="bg-white/60 rounded-xl p-6 shadow-sm border border-white/50 hover:bg-white/90 transition-all">
                    <div className="mb-4">
                        <span className="text-xs font-bold text-british-gold bg-british-gold/10 px-2 py-1 rounded inline-block">
                            Analytical Summary
                        </span>
                    </div>
                    <p className="text-british-navy font-serif italic text-lg leading-relaxed">
                        {analysis.summary}
                    </p>
                </div>

                {/* 2. Thematic Depth */}
                {analysis.thematicDepth && (
                    <div className="bg-white/60 rounded-xl p-6 shadow-sm border border-white/50 hover:bg-white/90 transition-all">
                        <div className="mb-4">
                            <span className="text-xs font-bold text-british-gold bg-british-gold/10 px-2 py-1 rounded inline-block">
                                Thematic Depth
                            </span>
                        </div>
                        <ul className="space-y-4">
                        {analysis.thematicDepth.map(t => (
                            <li key={t.theme} className="bg-white/40 p-4 rounded border border-white/50 text-british-navy/80 text-sm">
                                <span className="font-semibold text-british-navy block text-base mb-1">{t.theme}</span>
                                <span className="italic block text-xs opacity-90 leading-relaxed">{t.implication}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                )}

                {/* 3. Stylistic Analysis */}
                {analysis.stylisticAnalysis && (
                    <div className="bg-white/60 rounded-xl p-6 shadow-sm border border-white/50 hover:bg-white/90 transition-all">
                        <div className="mb-4">
                            <span className="text-xs font-bold text-british-gold bg-british-gold/10 px-2 py-1 rounded inline-block">
                                Stylistic Analysis
                            </span>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="bg-white/40 p-4 rounded border border-white/50">
                                <span className="font-semibold text-british-gold/90 block mb-2 uppercase text-xs tracking-wider">Diction & Imagery</span>
                                <p className="leading-relaxed text-british-navy">{analysis.stylisticAnalysis.lexicalDiction}</p>
                            </div>
                            <div className="bg-white/40 p-4 rounded border border-white/50">
                                <span className="font-semibold text-british-gold/90 block mb-2 uppercase text-xs tracking-wider">Syntactic Patterns</span>
                                <p className="leading-relaxed text-british-navy">{analysis.stylisticAnalysis.syntacticPatterns}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Character Insight */}
                {analysis.characterPsychology && (
                    <div className="bg-white/60 rounded-xl p-6 shadow-sm border border-white/50 hover:bg-white/90 transition-all">
                         <div className="mb-4">
                            <span className="text-xs font-bold text-british-gold bg-british-gold/10 px-2 py-1 rounded inline-block">
                                Character Insight
                            </span>
                        </div>
                        <div className="space-y-3">
                            {analysis.characterPsychology.map((cp, idx) => (
                                <CharacterChat 
                                    key={idx} 
                                    character={cp.character} 
                                    internalState={cp.internalState} 
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. Speaking Challenge */}
                {analysis.speakingBridge && (
                    <div className="bg-white/60 rounded-xl p-6 shadow-sm border border-white/50 hover:bg-white/90 transition-all">
                        <div className="mb-4">
                             <span className="text-xs font-bold text-british-gold bg-british-gold/10 px-2 py-1 rounded inline-block">
                                Speaking Challenge
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            {analysis.speakingBridge.personalConnection && (
                                <div className="bg-british-gold/5 p-4 rounded border border-british-gold/20">
                                    <span className="text-[10px] font-bold tracking-wider text-british-gold/80 uppercase block mb-2">Personal Reflection</span>
                                    <p className="text-lg text-british-navy font-serif leading-relaxed">"{analysis.speakingBridge.personalConnection}"</p>
                                    <SpeakingPractice 
                                        question={analysis.speakingBridge.personalConnection} 
                                        context={`Personal Reflection on ${analysis.summary}`} 
                                    />
                                </div>
                            )}
                            
                            {analysis.speakingBridge.modernContext && (
                                <div className="bg-blue-50/50 p-4 rounded border border-blue-100">
                                    <span className="text-[10px] font-bold tracking-wider text-blue-800/60 uppercase block mb-2">Modern Context</span>
                                    <p className="text-lg text-british-navy font-serif leading-relaxed">"{analysis.speakingBridge.modernContext}"</p>
                                    <SpeakingPractice 
                                        question={analysis.speakingBridge.modernContext} 
                                        context="Modern Context & Technology" 
                                    />
                                </div>
                            )}

                             {analysis.speakingBridge.debateTopic && (
                                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                    <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase block mb-2">Debate Topic</span>
                                    <p className="text-lg text-british-navy font-serif leading-relaxed">"{analysis.speakingBridge.debateTopic}"</p>
                                    <SpeakingPractice 
                                        question={`Debate this topic: ${analysis.speakingBridge.debateTopic}`} 
                                        context="Debate / Argumentation" 
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Paragraphs module removed as per request */}
    </div>
  );
}

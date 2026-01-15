
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Play, FileText, Loader2, Mic } from 'lucide-react';
import SpeakingPractice from './SpeakingPractice';
import SimpleTTSButton from './SimpleTTSButton';

export default function CharacterChat({ character, internalState }) {
    // Only show character and internal state, no chat button or chat logic
    return (
        <div className="bg-white/40 p-4 rounded border border-white/50 flex flex-col gap-2 items-start">
            <span className="font-bold text-british-navy text-sm px-2 py-0.5 bg-british-navy/5 rounded shrink-0">
                {character}
            </span>
            <p className="text-sm text-british-navy/90 leading-relaxed italic border-l-2 border-british-gold/30 pl-3">
                {internalState}
            </p>
        </div>
    );
}

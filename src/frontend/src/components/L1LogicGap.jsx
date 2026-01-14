import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function L1LogicGap({ gap }) {
  if (!gap) return null;
  
  const instinct = gap.chinglishInstinct || gap.issue;
  const target = gap.nativeLogic || gap.fix;

  return (
    <div className="space-y-4">
      <div className="bg-british-navy bg-opacity-10 rounded-lg p-4 border-l-4 border-british-gold">
        <div className="flex gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-british-navy flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-british-navy">L1 Transfer / Issue</h4>
            <p className="text-british-navy text-opacity-80 italic">
              "{instinct || 'No details provided'}"
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-british-navy text-opacity-60">⬇️</div>

      <div className="bg-british-gold bg-opacity-10 rounded-lg p-4 border-l-4 border-british-gold">
        <div className="flex gap-2 mb-2">
          <span className="text-xl">✨</span>
          <div>
            <h4 className="font-semibold text-british-navy">Target Logic / Fix</h4>
            <p className="text-british-navy text-opacity-80">
              "{target || 'No details provided'}"
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4">
        <p className="text-sm text-british-navy leading-relaxed">
          <span className="font-semibold">Linguistic Rationale:</span> {gap.explanation}
        </p>
      </div>
    </div>
  );
}

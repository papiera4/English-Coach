import React from 'react';

export default function CoachingPanel() {
  return (
    <div className="glass-effect rounded-lg p-6">
      <h3 className="text-xl font-serif font-bold mb-4 text-british-navy">🎓 Coaching Tips</h3>
      <ul className="space-y-3 text-sm text-british-navy text-opacity-80">
        <li className="flex gap-2">
          <span className="flex-shrink-0">📌</span>
          <span><strong>Genre Matters:</strong> The same phrase can be completely different in literary vs. workplace contexts.</span>
        </li>
        <li className="flex gap-2">
          <span className="flex-shrink-0">🎯</span>
          <span><strong>Accent Awareness:</strong> British and American English differ in vowel quality, rhythm, and stress patterns.</span>
        </li>
        <li className="flex gap-2">
          <span className="flex-shrink-0">🔤</span>
          <span><strong>IPA is Your Friend:</strong> Phonetic transcription helps identify subtle pronunciation differences.</span>
        </li>
        <li className="flex gap-2">
          <span className="flex-shrink-0">💭</span>
          <span><strong>Think Native:</strong> Don't translate from Chinese—think about how the phrase sounds to a native speaker.</span>
        </li>
      </ul>
    </div>
  );
}

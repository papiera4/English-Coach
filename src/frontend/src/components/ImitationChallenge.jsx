import React, { useState } from 'react';
import { Send } from 'lucide-react';
import L1LogicGap from './L1LogicGap';
import RhetoricalAnalysis from './RhetoricalAnalysis';

export default function ImitationChallenge({ challenge, originalText, genre, accentMode, onFeedbackReceived }) {
  const [userImitation, setUserImitation] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!challenge) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userImitation.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText,
          userImitation,
          genre,
          accentMode,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setFeedback(data.feedback);
        onFeedbackReceived?.(data.feedback);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate feedback.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-british-navy bg-opacity-5 rounded-lg p-4 border-l-4 border-british-navy">
        <div className="text-xs uppercase tracking-wider text-gray-600 mb-2 font-semibold">✍️ Writing Imitation Challenge</div>
        <p className="text-british-navy text-opacity-80 mb-3">{challenge.instruction}</p>
        <div className="bg-white rounded p-3 italic text-british-navy border-l-4 border-british-gold">
          {challenge.example}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={userImitation}
          onChange={(e) => setUserImitation(e.target.value)}
          placeholder="Write your imitation here..."
          className="w-full h-32 p-4 border border-british-navy border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-british-gold"
        />
        <button
          type="submit"
          disabled={!userImitation.trim() || loading}
          className="w-full bg-british-navy hover:bg-british-navy hover:bg-opacity-90 disabled:opacity-50 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Send className="w-4 h-4" />
          Get Feedback
        </button>
      </form>

      {feedback && (
        <div className="bg-british-gold bg-opacity-10 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-british-gold">{feedback.overallScore}</div>
            <div className="text-sm text-british-navy text-opacity-70">/10</div>
          </div>
          
          {/* L1 Logic Gap - NEW */}
          {feedback.l1LogicGaps && feedback.l1LogicGaps.length > 0 && (
             <div className="space-y-4">
                {feedback.l1LogicGaps.map((gap, index) => (
                  <L1LogicGap key={index} gap={gap} />
                ))}
             </div>
          )}

          {/* Rhetorical Analysis - NEW */}
          {feedback.rhetoricalAnalysis && feedback.rhetoricalAnalysis.length > 0 && (
            <RhetoricalAnalysis analysis={feedback.rhetoricalAnalysis} />
          )}

          <div>
            <h5 className="font-semibold text-british-navy mb-2">✅ Strengths</h5>
            <ul className="space-y-1">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="text-sm text-british-navy flex gap-2">
                  <span>•</span> {s}
                </li>
              ))}
            </ul>
          </div>

          {feedback.improvements.length > 0 && (
            <div>
              <h5 className="font-semibold text-british-navy mb-2">💡 Areas for Improvement</h5>
              <div className="space-y-3">
                {feedback.improvements.map((imp, i) => (
                  <div key={i} className="bg-white rounded p-3 text-sm">
                    <p className="font-semibold text-british-navy">{imp.aspect}</p>
                    <p className="text-british-navy text-opacity-70 mt-1">
                      Current: <span className="italic">"{imp.current}"</span>
                    </p>
                    <p className="text-british-navy text-opacity-70">
                      Better: <span className="italic">"{imp.suggestion}"</span>
                    </p>
                    <p className="text-british-navy text-opacity-60 text-xs mt-1">
                      {imp.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-british-navy bg-opacity-5 rounded p-3 text-sm text-british-navy">
            <span className="font-semibold">Next Step:</span> {feedback.nextStep}
          </div>
        </div>
      )}
    </div>
  );
}

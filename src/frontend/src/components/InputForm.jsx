import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function InputForm({ onSubmit, loading }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here... Can be a sentence, paragraph, or dialogue."
        className="w-full h-64 p-4 border border-british-navy border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-british-gold focus:ring-opacity-50 resize-none"
      />
      
      <div className="text-sm text-british-navy text-opacity-60">
        {text.length} characters
      </div>

      <button
        type="submit"
        disabled={!text.trim() || loading}
        className="w-full bg-british-navy hover:bg-british-navy hover:bg-opacity-90 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
      >
        <Send className="w-4 h-4" />
        Analyze
      </button>

      <div className="bg-british-navy bg-opacity-5 rounded-lg p-3 text-xs text-british-navy text-opacity-70">
        <strong>Tip:</strong> The longer the text, the more detailed the analysis. Try literary excerpts, workplace emails, or casual conversations.
      </div>
    </form>
  );
}

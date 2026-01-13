import React, { useState } from 'react';
import { BookOpen, Mic, MessageSquare, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import './index.css';
import CoachingPanel from './components/CoachingPanel';
import AccentToggle from './components/AccentToggle';
import InputForm from './components/InputForm';
import AnalysisDisplay from './components/AnalysisDisplay';

function App() {
  const [accentMode, setAccentMode] = useState('modern-rp');
  const [currentText, setCurrentText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' or 'imitate'

  const handleAnalyze = async (text) => {
    setCurrentText(text);
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, accentMode }),
      });
      const data = await response.json();
      if (data.success) {
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze text. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen british-gradient">
      {/* Header */}
      <header className="border-b border-white border-opacity-20 glass-effect sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-british-gold" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">English Coach</h1>
              <p className="text-sm text-white text-opacity-70">Advanced Linguistic Mastery</p>
            </div>
          </div>
          <AccentToggle accentMode={accentMode} setAccentMode={setAccentMode} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Sidebar - Input */}
          <div className="md:col-span-1">
            <div className="glass-effect rounded-lg p-6 h-full">
              <h2 className="text-xl font-serif font-bold mb-4 text-british-navy">📝 Your Text</h2>
              <InputForm onSubmit={handleAnalyze} loading={loading} />
            </div>
          </div>

          {/* Main Content Area - Analysis */}
          <div className="md:col-span-2">
            {loading && (
              <div className="glass-effect rounded-lg p-12 text-center">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-british-navy border-t-british-gold rounded-full animate-spin"></div>
                  <p className="mt-4 text-british-navy font-medium">Analyzing your text...</p>
                </div>
              </div>
            )}

            {!loading && analysis && (
              <AnalysisDisplay analysis={analysis} accentMode={accentMode} currentText={currentText} />
            )}

            {!loading && !analysis && (
              <div className="glass-effect rounded-lg p-12 text-center">
                <BookOpen className="w-16 h-16 text-british-gold mx-auto mb-4 opacity-50" />
                <p className="text-british-navy text-opacity-70">
                  Submit your text to receive comprehensive linguistic coaching
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

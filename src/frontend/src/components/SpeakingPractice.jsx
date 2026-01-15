import React, { useState, useRef } from 'react';
import { Mic, Square, Send, Loader2, MessageSquare, CheckCircle, RefreshCcw } from 'lucide-react';

export default function SpeakingPractice({ question, context }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [transcription, setTranscription] = useState(null);
    
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Force a mimeType that is widely supported if possible, otherwise default
            // 'audio/webm;codecs=opus' is standard for Chrome/Firefox
            const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
                            ? { mimeType: 'audio/webm;codecs=opus' } 
                            : undefined;
                            
            mediaRecorderRef.current = new MediaRecorder(stream, options);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                // Ensure we specify the correct type. Most browsers record in webm/opus or ogg/opus by default.
                // Sending it as 'audio/webm' is safer than just blob.
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); 
                setAudioBlob(blob);
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setAudioBlob(null);
            setEvaluation(null);
        } catch (err) {
            console.error("Mic error:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSubmit = async () => {
        if (!audioBlob) {
            alert("No audio recorded!");
            return;
        }
        if (audioBlob.size < 100) {
            alert("Recording is too short or empty. Please try again.");
            return;
        }

        setIsProcessing(true);
        console.log("Submitting audio blob of size:", audioBlob.size, "type:", audioBlob.type);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'speaking_practice.webm');
        formData.append('question', question);
        if (context) formData.append('context', context);

        try {
            const res = await fetch('/api/evaluate-speaking', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setEvaluation(data.evaluation);
                setTranscription(data.transcription);
            } else {
                alert('Evaluation failed: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            console.error(e);
            alert('Network error');
        }
        setIsProcessing(false);
    };

    return (
        <div className="mt-4 border-t border-black/5 pt-4">
            {!evaluation ? (
                <div className="flex items-center justify-between gap-4">
                     <div className="flex items-center gap-3">
                        {!isRecording && !audioBlob && (
                            <button 
                                onClick={startRecording}
                                className="flex items-center gap-2 px-4 py-2 bg-british-maroon text-white rounded-full text-sm font-semibold hover:bg-opacity-90 transition-colors"
                            >
                                <Mic className="w-4 h-4" /> Start Answer
                            </button>
                        )}

                        {isRecording && (
                             <button 
                                onClick={stopRecording}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full text-sm font-semibold animate-pulse"
                            >
                                <Square className="w-4 h-4 fill-current" /> Stop
                            </button>
                        )}

                        {audioBlob && !isProcessing && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleSubmit}
                                    className="flex items-center gap-2 px-4 py-2 bg-british-navy text-white rounded-full text-sm font-semibold hover:bg-opacity-90 transition-colors"
                                >
                                    <Send className="w-4 h-4" /> Submit for Analysis
                                </button>
                                <button 
                                    onClick={() => setAudioBlob(null)}
                                    className="p-2 text-gray-500 hover:text-british-maroon"
                                    title="Retry"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        
                        {isProcessing && (
                            <span className="flex items-center gap-2 text-british-navy text-sm font-medium">
                                <Loader2 className="w-4 h-4 animate-spin" /> Evaluating...
                            </span>
                        )}
                     </div>
                     {audioBlob && <span className="text-xs text-green-600 font-medium">Headset Ready</span>}
                </div>
            ) : (
                <div className="bg-white/80 p-4 rounded-lg border border-british-navy/10 space-y-4 animate-fade-in">
                    <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold uppercase text-british-navy flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" /> Evaluation Report
                        </h4>
                        <button onClick={() => { setEvaluation(null); setAudioBlob(null); }} className="text-xs text-british-maroon hover:underline">
                            Try Again
                        </button>
                    </div>

                    <div className="bg-british-cream/50 p-3 rounded text-sm italic text-british-navy/80 font-serif border-l-2 border-british-gold">
                        "{transcription}"
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-center text-xs">
                        <ScoreBadge label="Relevance" score={evaluation.relevance.score} />
                        <ScoreBadge label="Depth" score={evaluation.depth.score} />
                        <ScoreBadge label="Language" score={evaluation.language.score} />
                        <ScoreBadge label="Logic" score={evaluation.logic.score} />
                    </div>

                    <div className="space-y-2 text-sm">
                        <p><span className="font-semibold text-british-navy">Feedback:</span> {evaluation.feedback.areasForImprovement[0]}</p>
                        <p><span className="font-semibold text-british-navy">Suggestion:</span> <span className="italic text-british-navy/80">{evaluation.feedback.improvedVersion}</span></p>
                    </div>
                </div>
            )}
        </div>
    );
}

function ScoreBadge({ label, score }) {
    let color = 'bg-gray-100 text-gray-800';
    if (score >= 8) color = 'bg-green-100 text-green-800';
    else if (score >= 6) color = 'bg-yellow-100 text-yellow-800';
    else color = 'bg-red-100 text-red-800';

    return (
        <div className={`p-2 rounded border border-black/5 ${color}`}>
            <div className="font-bold text-lg">{score}/10</div>
            <div className="uppercase tracking-wider text-[10px] opacity-70">{label}</div>
        </div>
    );
}

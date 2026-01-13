import sdk from 'microsoft-cognitiveservices-speech-sdk';
import { config } from './config.js';

const VOICES = {
  british: 'en-GB-SoniaNeural',
  american: 'en-US-JennyNeural',
};

// Simple mapping from analysis mood/atmosphere to Azure TTS styles
const STYLE_MAP = {
  'cheerful': 'cheerful',
  'happy': 'cheerful',
  'joyful': 'cheerful',
  'sad': 'sad',
  'melancholic': 'sad',
  'gloomy': 'sad',
  'angry': 'angry',
  'serious': 'serious', // Some voices support this
  'excited': 'excited',
  'fearful': 'terrified',
  'terrified': 'terrified',
  'whisper': 'whispering',
  'quiet': 'whispering',
  // Default fallback will be empty string (neutral)
};

const getStyle = (mood) => {
  if (!mood) return null;
  const lowerMood = mood.toLowerCase();
  for (const [key, value] of Object.entries(STYLE_MAP)) {
    if (lowerMood.includes(key)) return value;
  }
  return null; // default
};

export const generateSpeech = async (text, accentMode = 'modern-rp', mood = '') => {
  if (!config.azure.speechKey || !config.azure.speechRegion) {
    throw new Error('Azure Speech credentials not configured');
  }

  const speechConfig = sdk.SpeechConfig.fromSubscription(config.azure.speechKey, config.azure.speechRegion);
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

  const isBritish = accentMode === 'modern-rp' || accentMode === 'british';
  const voiceName = isBritish ? VOICES.british : VOICES.american;
  const style = getStyle(mood);

  // Construct SSML
  let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
    <voice name="${voiceName}">`;
  
  if (style) {
    ssml += `<mstts:express-as style="${style}">`;
  }
  
  ssml += text;
  
  if (style) {
    ssml += `</mstts:express-as>`;
  }
  
  ssml += `</voice></speak>`;

  return new Promise((resolve, reject) => {
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null); // null audio config means in-memory

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          // result.audioData is an ArrayBuffer
          const buffer = Buffer.from(result.audioData);
          synthesizer.close();
          resolve(buffer);
        } else {
          synthesizer.close();
          reject(new Error('Speech synthesis canceled/failed: ' + result.errorDetails));
        }
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
};

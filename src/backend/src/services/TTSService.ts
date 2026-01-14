import sdk from 'microsoft-cognitiveservices-speech-sdk';
import { AppConfig } from '../config/AppConfig.js';

export class TTSService {
  private voices: { british: string; american: string };
  private styleMap: Record<string, string>;

  constructor(private config: AppConfig) {
    this.voices = {
      british: 'en-GB-SoniaNeural',
      american: 'en-US-JennyNeural',
    };
    
    // Simple mapping from analysis mood/atmosphere to Azure TTS styles
    this.styleMap = {
      'cheerful': 'cheerful',
      'happy': 'cheerful',
      'joyful': 'cheerful',
      'sad': 'sad',
      'melancholic': 'sad',
      'gloomy': 'sad',
      'angry': 'angry',
      'serious': 'serious',
      'excited': 'excited',
      'fearful': 'terrified',
      'terrified': 'terrified',
      'whisper': 'whispering',
      'quiet': 'whispering',
    };
  }

  private _getStyle(mood: string): string | null {
    if (!mood) return null;
    const lowerMood = mood.toLowerCase();
    for (const [key, value] of Object.entries(this.styleMap)) {
      if (lowerMood.includes(key)) return value;
    }
    return null;
  }

  async generateSpeech(text: string, accentMode = 'modern-rp', mood = ''): Promise<Buffer> {
    if (!this.config.azure.speechKey || !this.config.azure.speechRegion) {
      throw new Error('Azure Speech credentials not configured');
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(
        this.config.azure.speechKey, 
        this.config.azure.speechRegion
    );
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const isBritish = accentMode === 'modern-rp' || accentMode === 'british';
    const voiceName = isBritish ? this.voices.british : this.voices.american;
    const style = this._getStyle(mood);

    // Construct SSML
    let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
      <voice name="${voiceName}">`;
    
    if (style) {
      ssml += `<mstts:express-as style="${style}">${text}</mstts:express-as>`;
    } else {
      ssml += text;
    }
    
    ssml += `</voice></speak>`;

    return new Promise((resolve, reject) => {
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null as any); // null audio config for in-memory synthesis

      synthesizer.speakSsmlAsync(
        ssml,
        result => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            // content is ArrayBuffer
            const buffer = Buffer.from(result.audioData);
            synthesizer.close();
            resolve(buffer);
          } else {
            const error = `Speech synthesis canceled, ${result.errorDetails}`;
            synthesizer.close();
            reject(new Error(error));
          }
        },
        error => {
          synthesizer.close();
          reject(error);
        }
      );
    });
  }
}

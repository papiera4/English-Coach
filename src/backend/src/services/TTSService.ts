import sdk from 'microsoft-cognitiveservices-speech-sdk';
import { AppConfig } from '../config/AppConfig.js';

export class TTSService {
  private voices: { 
      british: { female: string, male: string }; 
      american: { female: string, male: string };
  };
  private styleMap: Record<string, string>;

  constructor(private config: AppConfig) {
    this.voices = {
      british: {
          female: 'en-GB-SoniaNeural',
          male: 'en-GB-RyanNeural'
      },
      american: {
          female: 'en-US-JennyNeural',
          male: 'en-US-GuyNeural'
      }
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
      'exited': 'excited', // Typo fix
      'excited': 'excited',
      'fearful': 'terrified',
      'terrified': 'terrified',
      'whisper': 'whispering',
      'quiet': 'whispering',
      'paranoid': 'whispering', // Added
      'suspicious': 'whispering' // Added
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

  private _escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
  }

  async generateSpeech(text: string, accentMode = 'modern-rp', mood = '', gender: 'male' | 'female' = 'female'): Promise<Buffer> {
    if (!this.config.azure.speechKey || !this.config.azure.speechRegion) {
      throw new Error('Azure Speech credentials not configured');
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(
        this.config.azure.speechKey, 
        this.config.azure.speechRegion
    );
    // Revert to standard 16khz MP3 as used previously in the project to ensure compatibility
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const isBritish = accentMode === 'modern-rp' || accentMode === 'british';
    const regionVoices = isBritish ? this.voices.british : this.voices.american;
    const voiceName = (gender === 'male') ? regionVoices.male : regionVoices.female;
    const voiceLocale = isBritish ? 'en-GB' : 'en-US';
    
    // Azure Neural voices are strict about styles. 
    // en-GB-SoniaNeural/RyanNeural only support a subset (cheerful, sad, chat).
    // Attempts to use 'whispering' or 'terrified' on them can cause artifacts or failures.
    // We filter styles for British voices to be safe.
    let style = this._getStyle(mood);
    if (isBritish && style && !['cheerful', 'sad', 'chat'].includes(style)) {
        style = null; // Fallback to neutral for unsupported styles
    }

    const safeText = this._escapeXml(text);

    // Construct SSML with correct xml:lang to match the voice
    let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${voiceLocale}">
      <voice name="${voiceName}">`;
    
    if (style) {
      ssml += `<mstts:express-as style="${style}">${safeText}</mstts:express-as>`;
    } else {
      ssml += safeText;
    }
    
    ssml += `</voice></speak>`;

    return new Promise((resolve, reject) => {
      // Use null as any to strictly prevent any attempt to access audio output devices on server
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null as any); 

      synthesizer.speakSsmlAsync(
        ssml,
        result => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const buffer = Buffer.from(result.audioData);
            synthesizer.close();
            resolve(buffer);
          } else {
            const error = `Speech synthesis canceled. Reason: ${result.reason}. ErrorDetails: ${result.errorDetails}`;
            console.error(error);
            synthesizer.close();
            reject(new Error(error));
          }
        },
        error => {
          console.error("Speech synthesis error callback", error);
          synthesizer.close();
          reject(error);
        }
      );
    });
  }
}

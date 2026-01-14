import sdk from 'microsoft-cognitiveservices-speech-sdk';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { AppConfig } from '../config/AppConfig.js';

ffmpeg.setFfmpegPath(ffmpegPath.path);

export interface AssessmentResult {
    accuracyScore: number;
    pronunciationScore: number;
    completenessScore: number;
    fluencyScore: number;
    prosodyScore: number;
    vocabularyScore?: number;
    grammarScore?: number;
    topicScore?: number;
    words: any[];
    recognizedText?: string;
}

export class SpeechService {
    private speechConfig: sdk.SpeechConfig;

    constructor(private config: AppConfig) {
        // Load from env directly or config object. 
        const subscriptionKey = this.config.azure.speechKey;
        const serviceRegion = this.config.azure.speechRegion;
        
        if (!subscriptionKey || !serviceRegion) {
            console.warn("Azure Speech Key/Region not set!");
        }

        this.speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
        this.speechConfig.speechRecognitionLanguage = "en-US";
    }

    public async assessPronunciation(inputAudioPath: string, referenceText: string): Promise<AssessmentResult> {
        const wavPath = inputAudioPath + '.wav';

        // 1. Convert Audio to 16kHz 16-bit Mono WAV
        await new Promise<void>((resolve, reject) => {
            ffmpeg(inputAudioPath)
                .toFormat('wav')
                .audioFrequency(16000)
                .audioChannels(1)
                .audioCodec('pcm_s16le')
                .on('end', () => resolve())
                .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
                .save(wavPath);
        });

        // 2. Configure Assessment
        const pushStream = sdk.AudioInputStream.createPushStream();
        
        // Read file and push to stream
        const audioBytes = fs.readFileSync(wavPath);
        pushStream.write(audioBytes.buffer);
        pushStream.close();

        const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
        const recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig);

        const pronConfig = new sdk.PronunciationAssessmentConfig(
            referenceText,
            sdk.PronunciationAssessmentGradingSystem.HundredMark,
            sdk.PronunciationAssessmentGranularity.Phoneme,
            true // Enable Miscue
        );

        // Enable prosody
        pronConfig.enableProsodyAssessment = true;
        // Enable content assessment (requires stricter typing or casting if definitions are old)
        try {
             (pronConfig as any).enableContentAssessmentWithTopic("General");
        } catch (e) {
             console.warn("Could not enable content assessment:", e);
        }
        
        pronConfig.applyTo(recognizer);

        return new Promise((resolve, reject) => {
            recognizer.recognizeOnceAsync(
                (result) => {
                    recognizer.close();
                    
                    if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                        const json = JSON.parse(result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult));
                        const assessment = json.NBest[0].PronunciationAssessment;
                        const content = json.NBest[0].ContentAssessment;
                        const words = json.NBest[0].Words;
                        const recognizedText = json.NBest[0].Display;

                        resolve({
                            accuracyScore: assessment.AccuracyScore,
                            pronunciationScore: assessment.PronScore,
                            completenessScore: assessment.CompletenessScore,
                            fluencyScore: assessment.FluencyScore,
                            prosodyScore: assessment.ProsodyScore,
                            vocabularyScore: content?.VocabularyScore,
                            grammarScore: content?.GrammarScore,
                            topicScore: content?.TopicScore,
                            words: words,
                            recognizedText: recognizedText 
                        });
                    } else if (result.reason === sdk.ResultReason.NoMatch) {
                        reject(new Error("No speech could be recognized."));
                    } else if (result.reason === sdk.ResultReason.Canceled) {
                         const cancellation = sdk.CancellationDetails.fromResult(result);
                         reject(new Error(`Assessment canceled: ${cancellation.reason}. Error: ${cancellation.errorDetails}`));
                    }
                    
                    // Cleanup converted file
                    try { fs.unlinkSync(wavPath); } catch(e) {}
                },
                (err) => {
                    recognizer.close();
                    reject(err);
                    try { fs.unlinkSync(wavPath); } catch(e) {}
                }
            );
        });
    }
}

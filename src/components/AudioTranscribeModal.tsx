import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  Loader2, 
  Sparkles, 
  Volume2, 
  Copy, 
  Check, 
  Send, 
  X, 
  Upload, 
  FileAudio,
  Radio
} from 'lucide-react';

interface AudioTranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTranscript: (text: string, sendImmediately?: boolean) => void;
  contextTitle?: string;
}

export const AudioTranscribeModal: React.FC<AudioTranscribeModalProps> = ({
  isOpen,
  onClose,
  onApplyTranscript,
  contextTitle,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopRecordingCleanup();
      setTranscript('');
      setError(null);
      setAudioUrl(null);
      setRecordDuration(0);
    }
  }, [isOpen]);

  const stopRecordingCleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  const startRecording = async () => {
    setError(null);
    setTranscript('');
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioUrl(URL.createObjectURL(audioBlob));
        await handleTranscribeBlob(audioBlob, mimeType);
      };

      mediaRecorder.start(250); // Slice every 250ms
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setError('Unable to access microphone. Please ensure microphone permissions are granted in your browser.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleTranscribeBlob = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);

      const base64Data = await base64Promise;

      const resp = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Data,
          mimeType: blob.type || mimeType || 'audio/webm',
        }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error: ${resp.status}`);
      }

      const data = await resp.json();
      setTranscript(data.transcript || 'No speech detected.');
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || 'Failed to transcribe audio with gemini-3.5-transcribe.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setAudioUrl(URL.createObjectURL(file));
    handleTranscribeBlob(file, file.type || 'audio/mp3');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Audio Speech-to-Text Transcription
                </h3>
                <span className="px-2 py-0.5 text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded font-mono">
                  gemini-3.5-transcribe
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dictate queries or upload recordings for intelligent grounded document analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Center Recording Console */}
        <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-4">
          <div className="relative">
            {isRecording && (
              <span className="absolute -inset-3 rounded-full bg-rose-500/30 animate-ping" />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-lg ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 ring-4 ring-rose-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-105'
              } disabled:opacity-50`}
            >
              {isRecording ? (
                <Square className="w-7 h-7 fill-white" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <div className="text-center">
            {isRecording ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-rose-400 font-mono font-bold text-sm">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>Recording... {formatTime(recordDuration)}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Speak clearly into your microphone. Click to stop and transcribe.
                </p>
              </div>
            ) : isTranscribing ? (
              <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transcribing audio with gemini-3.5-transcribe...</span>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Click microphone to start dictation
                </p>
                <p className="text-xs text-slate-400">
                  Transcribed directly with model <code className="font-mono text-indigo-300">gemini-3.5-transcribe</code>
                </p>
              </div>
            )}
          </div>

          {/* Audio Player preview if available */}
          {audioUrl && !isRecording && (
            <div className="w-full pt-2">
              <audio src={audioUrl} controls className="w-full h-8 opacity-90" />
            </div>
          )}

          {/* File Upload Option */}
          {!isRecording && !isTranscribing && (
            <div className="pt-2 text-center">
              <label className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Or upload pre-recorded audio (.mp3, .wav, .m4a, .webm)</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Transcription Output */}
        {transcript && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Transcribed Speech
              </span>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm leading-relaxed max-h-40 overflow-y-auto font-normal">
              {transcript}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  onApplyTranscript(transcript, false);
                  onClose();
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 cursor-pointer"
              >
                Insert into Chat Input
              </button>
              <button
                onClick={() => {
                  onApplyTranscript(transcript, true);
                  onClose();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask AI Now</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Send, CheckCircle2 } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendQueryToCareAI: (promptText: string) => Promise<string>;
}

const VOICE_PRESET_COMMANDS = [
  'Did I take my morning medicine?',
  'What medicines do I have today?',
  'When is my next appointment?',
  'Who needs to know if my evening medicine is missed?',
  'Show my daughter’s contact.',
  'Call my caretaker.',
];

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onSendQueryToCareAI,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState(
    'Hello Lakshmi! Tap the microphone or choose any large question button below, and I will read the answer aloud for you.'
  );
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const speakAloud = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92; // Slightly slower, clearer cadence for seniors
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleRunCommand = async (commandText: string) => {
    setTranscript(commandText);
    setLoading(true);
    try {
      const reply = await onSendQueryToCareAI(commandText);
      setResponseText(reply);
      speakAloud(reply);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMicrophone = () => {
    const SpeechRecognitionAPI =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      // Graceful fallback if browser speech recognition is unavailable in iframe
      handleRunCommand('What medicines do I have today?');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognitionAPI as any)();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const spoken = event.results?.[0]?.[0]?.transcript;
        if (spoken) {
          handleRunCommand(spoken);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      handleRunCommand('What medicines do I have today?');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-8">
        <div className="px-6 py-5 bg-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-teal-200" />
            <div>
              <h2 className="text-xl font-bold">🎙 Talk to CareAI (Voice-First Companion)</h2>
              <p className="text-xs text-teal-100">
                Speak naturally or tap a large button below · Senior-Friendly Audio Replies
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white cursor-pointer"
            aria-label="Close Voice Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Prominent Microphone Trigger */}
          <div className="flex flex-col items-center text-center space-y-3 py-2">
            <button
              onClick={handleToggleMicrophone}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-transform shadow-md cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white scale-105'
                  : 'bg-teal-700 hover:bg-teal-800 text-white'
              }`}
              aria-label="Tap to Speak with CareAI"
            >
              {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {isListening
                ? 'Listening now... Speak your question clearly'
                : 'Tap Microphone to Speak to CareAI'}
            </div>
            {transcript && (
              <div className="text-sm font-medium text-teal-800 dark:text-teal-300">
                You asked: “{transcript}”
              </div>
            )}
          </div>

          {/* CareAI Spoken Response Box */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                CareAI Response
              </span>
              <button
                onClick={() => speakAloud(responseText)}
                className="px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-900/50 hover:bg-teal-200/70 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isSpeaking ? 'Speaking Aloud...' : 'Read Aloud'}</span>
              </button>
            </div>
            <p className="text-base lg:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
              {loading ? 'CareAI is checking your schedule...' : responseText}
            </p>
          </div>

          {/* Large Text Alternatives for Users Who Prefer Tapping */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              One-Tap Senior Voice Commands (Large Text Alternatives):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {VOICE_PRESET_COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => handleRunCommand(cmd)}
                  className="p-3.5 text-left text-sm font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-600 rounded-xl transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span>“{cmd}”</span>
                  <Send className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-1">
            CareAI provides organizational support and does not replace medical advice or emergency
            services.
          </div>
        </div>
      </div>
    </div>
  );
};

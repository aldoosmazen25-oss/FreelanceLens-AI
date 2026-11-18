import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  X,
  History,
  Volume2,
  Play,
  Pause,
  Send,
  Radio,
  Sparkles,
  Plus,
  Trash2,
  MessageSquareShare,
  Check,
  Briefcase,
  ArrowUpLeft,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { VoiceSession, VoiceTurn, ChatSession } from '../../types';
import { SiriOrbIcon } from './SiriOrbIcon';
import {
  resolveVoiceAgentTaskIntent,
  VoiceTaskIntentResult,
} from '../../utils/calculations';

interface VoiceLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteTaskIntent?: (
    intent: VoiceTaskIntentResult,
    rawQuery: string
  ) => void;
}

type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export const VoiceLiveModal: React.FC<VoiceLiveModalProps> = ({
  isOpen,
  onClose,
  onExecuteTaskIntent,
}) => {
  const {
    userProfile,
    projects,
    voiceSessions,
    saveVoiceSession,
    deleteVoiceSession,
    clearVoiceSessions,
    saveChatSession,
  } = useData();

  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [thinkingSubPhase, setThinkingSubPhase] = useState<
    'Thinking...' | 'Searching...' | 'Planning...'
  >('Thinking...');
  const [lastExecutedIntent, setLastExecutedIntent] =
    useState<VoiceTaskIntentResult | null>(null);
  const [continuousMode, setContinuousMode] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('ar');
  const [voiceName, setVoiceName] = useState<'Kore' | 'Puck' | 'Zephyr'>('Kore');
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [manualInput, setManualInput] = useState<string>('');
  const [exportedToChat, setExportedToChat] = useState<boolean>(false);

  const createBlankSession = useCallback(
    (): VoiceSession => ({
      id: `vs-${Date.now()}`,
      title: 'استشارة صوتية جديدة مع لينز إيه آي',
      language: 'ar',
      voiceName: 'Kore',
      updatedAt: new Date().toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      turns: [],
    }),
    []
  );

  const [currentSession, setCurrentSession] = useState<VoiceSession>(() =>
    voiceSessions[0] || createBlankSession()
  );
  const [playingTurnId, setPlayingTurnId] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptAccumulatorRef = useRef<string>('');
  const isSubmittingRef = useRef<boolean>(false);

  const stopAudioAnalysis = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // ignore
    }
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch {
      // ignore
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const speakFallbackWithSynthesis = useCallback(
    (text: string, onDone: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onDone();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const hasArabic = /[\u0600-\u06FF]/.test(text);
      utterance.lang =
        language === 'auto'
          ? hasArabic
            ? 'ar-SA'
            : 'en-US'
          : language === 'en'
          ? 'en-US'
          : language === 'fr'
          ? 'fr-FR'
          : language === 'es'
          ? 'es-ES'
          : 'ar-SA';
      utterance.rate = 1.02;
      utterance.onend = () => onDone();
      utterance.onerror = () => onDone();
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  const submitVoiceTurn = useCallback(
    async (textInput: string, audioBlob?: Blob) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      stopAudioAnalysis();
      setStatus('thinking');
      setThinkingSubPhase('Thinking...');
      const subTimer1 = setTimeout(() => setThinkingSubPhase('Searching...'), 520);
      const subTimer2 = setTimeout(() => setThinkingSubPhase('Planning...'), 1050);

      let audioBase64 = '';
      if (audioBlob && audioBlob.size > 0) {
        try {
          const buf = await audioBlob.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          audioBase64 = btoa(binary);
        } catch {
          audioBase64 = '';
        }
      }

      try {
        const res = await fetch('/api/gemini/live-voice-turn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: textInput,
            audioBase64,
            mimeType: audioBlob?.type || 'audio/webm',
            language,
            voiceName,
            userProfile,
            projectsSummary: projects.slice(0, 5).map((p) => ({
              title: p.title,
              budget: p.budget,
              status: p.status,
            })),
            history: currentSession.turns.flatMap((t) => [
              { role: 'user', text: t.userText },
              { role: 'assistant', text: t.assistantText },
            ]),
          }),
        });

        clearTimeout(subTimer1);
        clearTimeout(subTimer2);

        const data = await res.json();
        const finalUserText = (data.transcript || textInput || '').trim();
        const resolvedIntent: VoiceTaskIntentResult =
          data.taskIntent || resolveVoiceAgentTaskIntent(finalUserText);

        setLastExecutedIntent(resolvedIntent);
        if (onExecuteTaskIntent) {
          onExecuteTaskIntent(resolvedIntent, finalUserText);
        }

        const replyText =
          resolvedIntent.actionType === 'unknown'
            ? language === 'en'
              ? "I don't know."
              : 'لا أعرف.'
            : data.replyText ||
              (language === 'en'
                ? resolvedIntent.spokenSummaryEn
                : resolvedIntent.spokenSummaryAr);

        const newTurn: VoiceTurn = {
          id: `vt-${Date.now()}`,
          userText: finalUserText || textInput,
          assistantText: replyText,
          audioBase64: data.audioBase64 || null,
          timestamp: new Date().toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          modelMode: data.modelMode || 'سريع ومباشر',
        };

        const updatedSession: VoiceSession = {
          ...currentSession,
          title:
            currentSession.turns.length === 0
              ? (finalUserText || 'أمر صوتي').slice(0, 48)
              : currentSession.title,
          language,
          voiceName,
          updatedAt: newTurn.timestamp,
          turns: [...currentSession.turns, newTurn],
        };

        setCurrentSession(updatedSession);
        await saveVoiceSession(updatedSession);
        setLiveTranscript('');
        transcriptAccumulatorRef.current = '';

        setStatus('speaking');

        // When an actual app command was executed, close the full-screen modal shortly after so the user sees the executed action in the app
        if (resolvedIntent.actionType !== 'unknown') {
          setTimeout(() => {
            onClose();
          }, 950);
        }

        const handleAfterSpeaking = () => {
          setStatus('idle');
          isSubmittingRef.current = false;
          if (
            resolvedIntent.actionType === 'unknown' &&
            continuousMode &&
            isOpen
          ) {
            setTimeout(() => {
              startListening();
            }, 500);
          }
        };

        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          htmlAudioRef.current = audio;
          audio.onended = handleAfterSpeaking;
          audio.onerror = () => {
            speakFallbackWithSynthesis(replyText, handleAfterSpeaking);
          };
          audio.play().catch(() => {
            speakFallbackWithSynthesis(replyText, handleAfterSpeaking);
          });
        } else {
          speakFallbackWithSynthesis(replyText, handleAfterSpeaking);
        }
      } catch {
        clearTimeout(subTimer1);
        clearTimeout(subTimer2);
        const fallbackIntent = resolveVoiceAgentTaskIntent(textInput);
        setLastExecutedIntent(fallbackIntent);
        if (onExecuteTaskIntent) {
          onExecuteTaskIntent(fallbackIntent, textInput);
        }
        const fallbackReply =
          fallbackIntent.actionType === 'unknown'
            ? language === 'en'
              ? "I don't know."
              : 'لا أعرف.'
            : language === 'en'
            ? fallbackIntent.spokenSummaryEn
            : fallbackIntent.spokenSummaryAr;
        speakFallbackWithSynthesis(fallbackReply, () => {});
        if (fallbackIntent.actionType !== 'unknown') {
          setTimeout(() => {
            onClose();
          }, 950);
        }
        setStatus('idle');
        isSubmittingRef.current = false;
      }
    },
    [
      continuousMode,
      currentSession,
      isOpen,
      language,
      onExecuteTaskIntent,
      projects,
      saveVoiceSession,
      speakFallbackWithSynthesis,
      stopAudioAnalysis,
      userProfile,
      voiceName,
    ]
  );

  const startListening = useCallback(async () => {
    if (status === 'listening' || status === 'thinking') return;

    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
      htmlAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setLiveTranscript('');
    transcriptAccumulatorRef.current = '';
    audioChunksRef.current = [];
    setStatus('listening');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length / 255;
        setAudioLevel(avg);
        rafRef.current = requestAnimationFrame(updateMeter);
      };
      rafRef.current = requestAnimationFrame(updateMeter);

      try {
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        recorder.start();
      } catch {
        // optional
      }

      const SpeechRec =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang =
          language === 'en'
            ? 'en-US'
            : language === 'fr'
            ? 'fr-FR'
            : language === 'es'
            ? 'es-ES'
            : 'ar-SA';

        recognition.onresult = (event: any) => {
          let text = '';
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript + ' ';
          }
          const clean = text.trim();
          transcriptAccumulatorRef.current = clean;
          setLiveTranscript(clean);

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          if (clean.length > 2) {
            silenceTimerRef.current = setTimeout(() => {
              const recordedBlob =
                audioChunksRef.current.length > 0
                  ? new Blob(audioChunksRef.current, { type: 'audio/webm' })
                  : undefined;
              submitVoiceTurn(transcriptAccumulatorRef.current, recordedBlob);
            }, 1800);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch {
      setAudioLevel(0.18);
    }
  }, [language, status, submitVoiceTurn]);

  useEffect(() => {
    if (!isOpen) {
      stopAudioAnalysis();
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setStatus('idle');
    }
  }, [isOpen, stopAudioAnalysis]);

  const handlePlayTurnAudio = (turn: VoiceTurn) => {
    if (playingTurnId === turn.id) {
      htmlAudioRef.current?.pause();
      window.speechSynthesis?.cancel();
      setPlayingTurnId(null);
      return;
    }
    setPlayingTurnId(turn.id);
    if (turn.audioBase64) {
      const audio = new Audio(`data:audio/wav;base64,${turn.audioBase64}`);
      htmlAudioRef.current = audio;
      audio.onended = () => setPlayingTurnId(null);
      audio.play().catch(() => {
        speakFallbackWithSynthesis(turn.assistantText, () => setPlayingTurnId(null));
      });
    } else {
      speakFallbackWithSynthesis(turn.assistantText, () => setPlayingTurnId(null));
    }
  };

  const handleStartNewVoiceSession = () => {
    const fresh = createBlankSession();
    setCurrentSession(fresh);
  };

  const handleExportVoiceToChat = async () => {
    if (currentSession.turns.length === 0) return;
    const chatSession: ChatSession = {
      id: `chat-from-voice-${currentSession.id}`,
      ownerId: userProfile.uid,
      title: `محادثة صوتية: ${currentSession.title}`,
      updatedAt: currentSession.updatedAt,
      messages: currentSession.turns.flatMap((t) => [
        {
          id: `${t.id}-u`,
          role: 'user' as const,
          text: t.userText,
          timestamp: t.timestamp,
        },
        {
          id: `${t.id}-a`,
          role: 'assistant' as const,
          text: t.assistantText,
          timestamp: t.timestamp,
          modelMode: t.modelMode,
        },
      ]),
    };
    await saveChatSession(chatSession);
    setExportedToChat(true);
    setTimeout(() => setExportedToChat(false), 2500);
  };

  if (!isOpen) return null;

  const statusConfig = {
    idle: {
      text: 'اضغط على الميكروفون أو تحدث مباشرة مع لينز إيه آي الصوتي',
      color: 'text-[#a4c2b4]',
    },
    listening: {
      text: 'لينز إيه آي يستمع إليك الآن... (إرسال تلقائي بعد 1.8 ثانية من الصمت)',
      color: 'text-[#ff6b7f]',
    },
    thinking: {
      text: 'لينز إيه آي يحلل استفسارك ويجهز الرد الصوتي...',
      color: 'text-[#62d9ff]',
    },
    speaking: {
      text: 'لينز إيه آي يتحدث معك صوتياً الآن...',
      color: 'text-[#2be38a]',
    },
  }[status];

  const dynamicScale = 1 + audioLevel * 0.75;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-2xl p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="المساعد الصوتي لينز إيه آي"
    >
      <div className="relative w-full max-w-5xl rounded-3xl liquid-glass-hot shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] animate-slab-spring">
        {/* Isolated Corner X Exit Button (في الزاوية وليس مع الخيارات) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق المحادثة الصوتية والخروج من لينز إيه آي"
          title="الخروج من لينز إيه آي"
          className="spring-btn absolute top-3.5 left-3.5 ltr:left-auto ltr:right-3.5 z-30 w-10 h-10 rounded-2xl bg-[#ff6b7f]/15 hover:bg-[#ff6b7f] border border-[#ff6b7f]/40 text-[#ff6b7f] hover:text-[#020504] flex items-center justify-center shadow-lg"
        >
          <X className="w-5 h-5 stroke-[2.4]" />
        </button>

        {/* Minimalist Clean Header & Options Bar (separated from the corner X button) */}
        <div className="px-5 py-3.5 pl-16 ltr:pl-5 ltr:pr-16 border-b border-white/12 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#2be38a]/20 border border-[#2be38a]/40 flex items-center justify-center text-[#2be38a] shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#effaf4] flex items-center gap-2">
                <span>Lens Voice</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#2be38a]/15 text-[#2be38a]">
                  Firework AI
                </span>
              </h2>
              <p className="text-[11px] text-[#a4c2b4]">
                استشارة صوتية ثنائية الاتجاه فورية وهادئة
              </p>
            </div>
          </div>

          {/* Compact Options Strip (منفصل تماماً عن زر الإغلاق في الزاوية) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/12 cursor-pointer text-[11px] text-[#effaf4]">
              <input
                type="checkbox"
                checked={continuousMode}
                onChange={(e) => setContinuousMode(e.target.checked)}
                className="accent-[#2be38a] rounded"
              />
              <span>مكالمة مستمرة</span>
            </label>

            <select
              aria-label="لغة المحادثة الصوتية"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/12 text-[11px] text-[#effaf4] focus:outline-none"
            >
              <option value="ar" className="bg-[#030706]">العربية (AR)</option>
              <option value="en" className="bg-[#030706]">English (EN)</option>
              <option value="fr" className="bg-[#030706]">Français (FR)</option>
              <option value="es" className="bg-[#030706]">Español (ES)</option>
              <option value="de" className="bg-[#030706]">Deutsch (DE)</option>
              <option value="tr" className="bg-[#030706]">Türkçe (TR)</option>
              <option value="ru" className="bg-[#030706]">Русский (RU)</option>
              <option value="zh" className="bg-[#030706]">中文 (ZH)</option>
              <option value="ja" className="bg-[#030706]">日本語 (JA)</option>
              <option value="hi" className="bg-[#030706]">हिन्दी (HI)</option>
              <option value="pt" className="bg-[#030706]">Português (PT)</option>
              <option value="ko" className="bg-[#030706]">한국어 (KO)</option>
              <option value="auto" className="bg-[#030706]">Auto Detect</option>
            </select>

            <select
              aria-label="نبرة صوت Lens Voice"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/12 text-[11px] text-[#effaf4] focus:outline-none"
            >
              <option value="Kore" className="bg-[#030706]">Kore</option>
              <option value="Puck" className="bg-[#030706]">Puck</option>
              <option value="Zephyr" className="bg-[#030706]">Zephyr</option>
            </select>

            <button
              type="button"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              aria-label="سجل المحادثات الصوتية"
              className={`spring-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors ${
                isHistoryOpen
                  ? 'bg-[#2be38a]/20 border-[#2be38a]/40 text-[#2be38a]'
                  : 'bg-white/[0.04] border-white/12 text-[#a4c2b4] hover:text-[#effaf4]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>السجل ({voiceSessions.length})</span>
            </button>
          </div>
        </div>


        {/* Main Body with Voice Conversation History Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[460px]">
          {/* Voice History Sidebar */}
          {isHistoryOpen && (
            <div className="w-full md:w-76 border-b md:border-b-0 md:border-l border-white/15 bg-black/35 backdrop-blur-2xl p-4 flex flex-col justify-between shrink-0 max-h-56 md:max-h-none">
              <div className="space-y-3 overflow-y-auto flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#effaf4]">
                    سجل المحادثات الصوتية
                  </span>
                  <button
                    type="button"
                    onClick={handleStartNewVoiceSession}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2be38a] text-[#020504] font-bold text-[11px] hover:brightness-110"
                  >
                    <Plus className="w-3 h-3" />
                    <span>محادثة جديدة</span>
                  </button>
                </div>

                {voiceSessions.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-[#6c8a7d] leading-relaxed">
                    لا توجد محادثات صوتية سابقة بعد. ابدأ التحدث مع لينز إيه آي وسيُحفظ سجلك هنا تلقائياً.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {voiceSessions.map((sess) => (
                      <div
                        key={sess.id}
                        className={`p-3 rounded-xl border transition-colors flex items-start justify-between gap-2 ${
                          currentSession.id === sess.id
                            ? 'bg-[#2be38a]/15 border-[#2be38a]/40'
                            : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setCurrentSession(sess)}
                          className="text-right flex-1 min-w-0"
                        >
                          <div className="text-xs font-semibold text-[#effaf4] truncate">
                            {sess.title}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#a4c2b4] mt-1 font-mono">
                            <span>{sess.turns.length} مداخلات</span>
                            <span>·</span>
                            <span>{sess.updatedAt}</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteVoiceSession(sess.id)}
                          aria-label={`حذف المحادثة الصوتية ${sess.title}`}
                          className="p-1 rounded-lg text-[#6c8a7d] hover:text-[#ff6b7f]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {voiceSessions.length > 0 && (
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleExportVoiceToChat}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] text-[#62d9ff]"
                  >
                    {exportedToChat ? (
                      <>
                        <Check className="w-3 h-3 text-[#2be38a]" />
                        <span className="text-[#2be38a]">نُقلت لسجل الدردشة</span>
                      </>
                    ) : (
                      <>
                        <MessageSquareShare className="w-3 h-3" />
                        <span>حفظ في سجل الدردشة</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={clearVoiceSessions}
                    className="py-1.5 px-2.5 rounded-lg bg-white/[0.04] hover:bg-[#ff6b7f]/15 text-[11px] text-[#a4c2b4] hover:text-[#ff6b7f]"
                  >
                    مسح الكل
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3D Iridescent Siri / Lens Voice Sphere Orb + Multi-State Cool Glass Pill + Actionable Tasks */}
          <div className="flex-1 flex flex-col justify-between p-5 sm:p-6 overflow-y-auto">
            <div className="flex flex-col items-center justify-center py-3">
              {/* Interactive 3D Iridescent Sphere Orb (Matches attached _______5__988034c7.jpg) */}
              <div className="relative flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40">
                {status !== 'idle' && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full border border-[#FF7A45]/45 animate-ping-scale pointer-events-none"
                      style={{
                        transform: `scale(${dynamicScale})`,
                      }}
                    />
                    <div
                      className="absolute inset-3 rounded-full border border-[#38BDF8]/40 animate-ping-scale pointer-events-none"
                      style={{
                        animationDelay: '0.45s',
                        transform: `scale(${1 + audioLevel * 0.55})`,
                      }}
                    />
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (status === 'listening') {
                      const recordedBlob =
                        audioChunksRef.current.length > 0
                          ? new Blob(audioChunksRef.current, { type: 'audio/webm' })
                          : undefined;
                      submitVoiceTurn(
                        transcriptAccumulatorRef.current || liveTranscript,
                        recordedBlob
                      );
                    } else {
                      startListening();
                    }
                  }}
                  aria-label={
                    status === 'listening'
                      ? 'إيقاف الاستماع وإرسال الصوت إلى Lens Voice'
                      : 'بدء التحدث بالميكروفون مع Lens Voice'
                  }
                  className="relative z-10 rounded-full focus:outline-none transition-transform duration-200 hover:scale-105 active:scale-95 shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
                >
                  <SiriOrbIcon
                    size="xl"
                    status={
                      status === 'thinking'
                        ? thinkingSubPhase === 'Searching...'
                          ? 'searching'
                          : thinkingSubPhase === 'Planning...'
                          ? 'planning'
                          : 'thinking'
                        : status
                    }
                    audioLevel={
                      status === 'speaking'
                        ? 0.55
                        : status === 'listening'
                        ? Math.max(audioLevel, 0.28)
                        : audioLevel
                    }
                  />
                </button>
              </div>

              {/* Morphing Thinking... / Searching... / Planning... Cool Glass Pill (Matches Video 1 0a12ce78.mp4) */}
              {status === 'thinking' ? (
                <div
                  className={`mt-3 px-6 py-2 rounded-full text-sm font-bold text-white shadow-xl transition-all duration-300 ${
                    thinkingSubPhase === 'Thinking...'
                      ? 'cool-glass-thinking-pill'
                      : thinkingSubPhase === 'Searching...'
                      ? 'cool-glass-searching-fluted'
                      : 'cool-glass-planning-pill'
                  }`}
                >
                  {thinkingSubPhase}
                </div>
              ) : (
                <div
                  className={`mt-3 text-xs sm:text-sm font-semibold text-center ${statusConfig.color}`}
                >
                  {statusConfig.text}
                </div>
              )}

              {liveTranscript && (
                <div className="mt-2.5 max-w-xl px-4 py-2 rounded-2xl cool-glass-spotlight-bar text-xs text-white text-center">
                  &quot;{liveTranscript}&quot;
                </div>
              )}

              {/* Executed In-App Task Notification Banner */}
              {lastExecutedIntent && (
                <div className="mt-3 w-full max-w-xl p-3 rounded-2xl cool-glass-island-result flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Briefcase className="w-4 h-4 text-[#FFB84D] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-[#FDE68A]">
                        {lastExecutedIntent.actionType === 'unknown'
                          ? 'Lens Voice · أمر غير معروف'
                          : `تم تنفيذ الأمر داخل التطبيق (${lastExecutedIntent.actionType})`}
                      </div>
                      <div className="text-xs text-white truncate">
                        {lastExecutedIntent.spokenSummaryAr}
                      </div>
                    </div>
                  </div>
                  {lastExecutedIntent.actionType !== 'unknown' && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-[11px] font-bold text-white flex items-center gap-1 shrink-0"
                    >
                      <span>مشاهدة في التطبيق</span>
                      <ArrowUpLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Voice Task Execution Pills (ينفذ مهام داخل التطبيق مباشرة) */}
            <div className="my-2 flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                disabled={status === 'thinking'}
                onClick={() =>
                  submitVoiceTurn(
                    'ابحث لي عن عمل مناسب مثلاً لكتابة أو نسخ أو ترجمة محتوى'
                  )
                }
                className="spring-btn px-3 py-1.5 rounded-full cool-glass-spotlight-bar text-[11px] font-bold text-[#FAF7F2] hover:border-[#FFB84D]/60 flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-[#FFB84D]" />
                <span>ابحث لي عن عمل لكتابة أو نسخ أو ترجمة محتوى</span>
              </button>

              <button
                type="button"
                disabled={status === 'thinking'}
                onClick={() =>
                  submitVoiceTurn(
                    'حلل لي مشروع تطوير موقع وتطبيق واكشف مخاطر النطاق'
                  )
                }
                className="spring-btn px-3 py-1.5 rounded-full cool-glass-spotlight-bar text-[11px] font-semibold text-[#E5E0D8] hover:text-white flex items-center gap-1.5"
              >
                <span>تحليل مشروع جديد داخل التطبيق</span>
              </button>

              <button
                type="button"
                disabled={status === 'thinking'}
                onClick={() =>
                  submitVoiceTurn('اكتب عرض سعر تنافسي لمشروع جديد مقسم إلى 3 مراحل')
                }
                className="spring-btn px-3 py-1.5 rounded-full cool-glass-spotlight-bar text-[11px] font-semibold text-[#E5E0D8] hover:text-white flex items-center gap-1.5"
              >
                <span>توليد عرض سعر فائز</span>
              </button>
            </div>

            {/* Spoken Conversation Turns inside Current Session */}
            <div className="space-y-3 max-h-52 overflow-y-auto px-1 my-2">
              {currentSession.turns.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center text-xs text-[#a4c2b4]">
                  اضغط على كرة <strong className="text-[#FFB84D]">Lens Voice</strong> المضيئة أو اختر مهمة من الأعلى لتنفيذها داخل التطبيق بالصوت مباشرة (مثل البحث عن فرص عمل في الكتابة والنسخ والترجمة).
                </div>
              ) : (
                currentSession.turns.map((turn) => (
                  <div
                    key={turn.id}
                    className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/15 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-[#a4c2b4]">
                      <span className="font-semibold text-[#effaf4]">
                        {userProfile.name || 'أنت'}: {turn.userText}
                      </span>
                      <span className="font-mono text-[11px] text-[#6c8a7d]">
                        {turn.timestamp}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3 pt-1.5 border-t border-white/10">
                      <p className="text-xs text-[#60A5FA] leading-relaxed">
                        <strong className="text-[#effaf4] ml-1">Lens Voice:</strong>
                        {turn.assistantText}
                      </p>
                      <button
                        type="button"
                        onClick={() => handlePlayTurnAudio(turn)}
                        aria-label={
                          playingTurnId === turn.id
                            ? 'إيقاف مؤقت للصوت'
                            : 'تشغيل رد Lens Voice الصوتي'
                        }
                        className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-[#effaf4] shrink-0"
                      >
                        {playingTurnId === turn.id ? (
                          <Pause className="w-3.5 h-3.5 text-[#ffc15a]" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-[#60A5FA]" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Direct Text / Quick Voice Prompt Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!manualInput.trim()) return;
                const text = manualInput.trim();
                setManualInput('');
                submitVoiceTurn(text);
              }}
              className="mt-3 flex flex-wrap items-center gap-2 pt-3 border-t border-white/15"
            >
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="اطلب مهمة صوتية أو كتابية (مثلاً: ابحث لي عن عمل لكتابة أو نسخ أو ترجمة محتوى)..."
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-[#effaf4] placeholder-[#6c8a7d] focus:outline-none focus:border-[#FFB84D]"
              />
              <button
                type="submit"
                disabled={status === 'thinking'}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7A45] via-[#FFB84D] to-[#38BDF8] text-[#09080B] font-extrabold text-xs hover:brightness-110 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>تنفيذ وتحدث مع Lens Voice</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

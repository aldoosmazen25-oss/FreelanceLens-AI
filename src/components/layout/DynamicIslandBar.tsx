import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Mic,
  MicOff,
  Folder,
  Layers,
  Clipboard,
  AppWindow,
  Plus,
  Circle,
  Square,
  Sparkles,
  Volume2,
  X,
  ArrowUpLeft,
  CheckCircle2,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { ViewId } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import { SiriOrbIcon, SiriOrbStatus } from '../voice/SiriOrbIcon';
import {
  resolveVoiceAgentTaskIntent,
  VoiceTaskIntentResult,
} from '../../utils/calculations';

export type DynamicIslandPhase =
  | 'compact'
  | 'search'
  | 'listening'
  | 'Thinking...'
  | 'Searching...'
  | 'Planning...'
  | 'result';

interface DynamicIslandBarProps {
  activeView: ViewId;
  onSelectView: (view: ViewId) => void;
  onOpenVoiceModal: () => void;
  onExecuteTaskIntent: (
    intent: VoiceTaskIntentResult,
    rawQuery: string
  ) => void;
  externalPhase?: DynamicIslandPhase | null;
  externalMessage?: string | null;
}

export const DynamicIslandBar: React.FC<DynamicIslandBarProps> = ({
  onSelectView,
  onOpenVoiceModal,
  onExecuteTaskIntent,
  externalPhase,
  externalMessage,
}) => {
  const { language } = useLanguage();
  const {
    userProfile,
    projects,
    opportunities,
    proposals,
    financials,
    notifications,
  } = useData();
  const [phase, setPhase] = useState<DynamicIslandPhase>('compact');
  const [query, setQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<
    'applications' | 'files' | 'actions' | 'clipboard'
  >('actions');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [resultSummary, setResultSummary] = useState<string>('');
  const [lastExecutedTarget, setLastExecutedTarget] =
    useState<ViewId>('opportunities');
  const [lastIntent, setLastIntent] = useState<VoiceTaskIntentResult | null>(
    null
  );
  const [rawCommandText, setRawCommandText] = useState<string>('');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const phaseTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = useCallback(() => {
    phaseTimersRef.current.forEach((t) => clearTimeout(t));
    phaseTimersRef.current = [];
  }, []);

  useEffect(() => {
    if (externalPhase) {
      setPhase(externalPhase);
      if (externalMessage) {
        setResultSummary(externalMessage);
      }
    }
  }, [externalPhase, externalMessage]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        phase === 'search' &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPhase('compact');
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [phase]);

  useEffect(() => {
    return () => {
      clearTimers();
      try {
        recognitionRef.current?.stop?.();
      } catch {
        // ignore
      }
    };
  }, [clearTimers]);

  const speakConfirmation = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = /[\u0600-\u06FF]/.test(text)
          ? 'ar-SA'
          : language === 'ar'
          ? 'ar-SA'
          : 'en-US';
        utter.rate = 1.03;
        window.speechSynthesis.speak(utter);
      } catch {
        // ignore
      }
    },
    [language]
  );

  const runDynamicIslandCommand = useCallback(
    async (commandText: string) => {
      const clean = commandText.trim();
      if (!clean) return;
      clearTimers();
      setRawCommandText(clean);

      // Morph sequence matching attached Video 1 (Thinking... -> Searching... -> Planning...)
      setPhase('Thinking...');
      const t1 = setTimeout(() => {
        setPhase((prev) => (prev === 'Thinking...' ? 'Searching...' : prev));
      }, 480);
      const t2 = setTimeout(() => {
        setPhase((prev) => (prev === 'Searching...' ? 'Planning...' : prev));
      }, 960);

      let intent: VoiceTaskIntentResult;
      try {
        const res = await fetch('/api/gemini/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: clean,
            channel: 'island',
            language,
            userProfile,
            projects,
            opportunities,
            proposals,
            financials,
            notifications,
            workStatus: userProfile.workStatus || 'work',
          }),
        });
        if (!res.ok) throw new Error('Agent endpoint failed');
        const data = await res.json();
        intent =
          data.taskIntent ||
          resolveVoiceAgentTaskIntent(clean, {
            userProfile,
            projects,
            opportunities,
            proposals,
            financials,
            notifications,
            workStatus: userProfile.workStatus || 'work',
            channel: 'island',
            language,
          });
      } catch {
        intent = resolveVoiceAgentTaskIntent(clean, {
          userProfile,
          projects,
          opportunities,
          proposals,
          financials,
          notifications,
          workStatus: userProfile.workStatus || 'work',
          channel: 'island',
          language,
        });
      }

      clearTimers();
      setLastIntent(intent);
      setLastExecutedTarget(intent.targetView);

      onExecuteTaskIntent(intent, clean);
      const summary =
        language === 'ar' ? intent.spokenSummaryAr : intent.spokenSummaryEn;
      setResultSummary(summary);
      setPhase('result');
      speakConfirmation(summary);

      if (!intent.requiresConfirmation) {
        const t4 = setTimeout(() => {
          setPhase('compact');
        }, 9000);
        phaseTimersRef.current = [t4];
      }
    },
    [
      clearTimers,
      financials,
      language,
      notifications,
      onExecuteTaskIntent,
      opportunities,
      projects,
      proposals,
      speakConfirmation,
      userProfile,
    ]
  );

  const startIslandVoiceListening = () => {
    clearTimers();
    if (phase === 'listening') {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        // ignore
      }
      setPhase('compact');
      setAudioLevel(0);
      return;
    }

    setPhase('listening');
    setAudioLevel(0.45);

    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      // Fallback: open search spotlight with pre-filled voice command option
      setTimeout(() => {
        setPhase('search');
        setTimeout(() => inputRef.current?.focus(), 60);
      }, 450);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      rec.interimResults = true;
      rec.continuous = false;
      recognitionRef.current = rec;

      rec.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
        }
        const clean = text.trim();
        setQuery(clean);
        setAudioLevel(0.35 + Math.random() * 0.5);
        if (event.results[0]?.isFinal && clean.length > 2) {
          runDynamicIslandCommand(clean);
        }
      };

      rec.onerror = () => {
        setAudioLevel(0);
        setPhase('search');
      };

      rec.onend = () => {
        setAudioLevel(0);
      };

      rec.start();
    } catch {
      setAudioLevel(0);
      setPhase('search');
    }
  };

  const orbStatus: SiriOrbStatus =
    phase === 'listening'
      ? 'listening'
      : phase === 'Thinking...'
      ? 'thinking'
      : phase === 'Searching...'
      ? 'searching'
      : phase === 'Planning...'
      ? 'planning'
      : phase === 'result'
      ? 'speaking'
      : 'idle';

  const quickVoiceActions = [
    {
      id: 'act-writing-jobs',
      labelAr: 'ابحث لي عن عمل مناسب لكتابة أو نسخ أو ترجمة محتوى',
      labelEn: 'Find freelance jobs for content writing, copywriting, or translation',
      shortcut: '⌘1',
      command:
        language === 'ar'
          ? 'ابحث لي عن عمل مناسب مثلاً لكتابة أو نسخ أو ترجمة محتوى'
          : 'Find suitable freelance work for content writing, copywriting, or translation',
    },
    {
      id: 'act-analyze-contract',
      labelAr: 'حلل لي مشروع تطوير موقع وتطبيق واكشف مخاطر النطاق',
      labelEn: 'Analyze a web & mobile app project and detect scope risks',
      shortcut: '⌘2',
      command:
        language === 'ar'
          ? 'حلل لي مشروع تطوير منصة ويب وتطبيق جوال مع كشف مخاطر العقد'
          : 'Analyze a full-stack web and mobile project contract',
    },
    {
      id: 'act-write-proposal',
      labelAr: 'اكتب عرض سعر تنافسي مقسم إلى 3 مراحل تسليم',
      labelEn: 'Draft a competitive 3-milestone proposal',
      shortcut: '⌘3',
      command:
        language === 'ar'
          ? 'اكتب عرض سعر تنافسي لمشروع جديد مقسم إلى 3 مراحل'
          : 'Draft a winning proposal with 3 clear milestones',
    },
    {
      id: 'act-calc-pricing',
      labelAr: 'احسب السعر العادل وصافي الربح بعد عمولة المنصة',
      labelEn: 'Calculate fair client price and net profit after platform fees',
      shortcut: '⌘4',
      command:
        language === 'ar'
          ? 'احسب تسعير مشروع عمل حر وصافي الربح'
          : 'Calculate project pricing and net profit',
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative z-40 flex flex-col items-center justify-center mx-auto select-none"
      aria-label="Dynamic Island — Search or Ask Lens Voice"
    >
      {/* =====================================================================
          MAIN MORPHING DYNAMIC ISLAND CAPSULE
          Smooth 60fps Framer Motion layout morphing across states:
          compact | search | listening | Thinking... | Searching... | Planning... | result
         ===================================================================== */}
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 410,
          damping: 31,
          mass: 0.78,
        }}
        className={`relative overflow-hidden ${
          phase === 'Thinking...'
            ? 'cool-glass-thinking-pill rounded-full px-6 py-2.5 min-w-[250px] sm:min-w-[310px]'
            : phase === 'Searching...'
            ? 'cool-glass-searching-fluted rounded-full px-6 py-2.5 min-w-[250px] sm:min-w-[310px]'
            : phase === 'Planning...'
            ? 'cool-glass-planning-pill rounded-full px-6 py-2.5 min-w-[250px] sm:min-w-[310px]'
            : phase === 'result'
            ? 'cool-glass-island-result rounded-[28px] px-5 py-3.5 w-[94vw] max-w-[540px]'
            : phase === 'search' || phase === 'listening'
            ? 'cool-glass-spotlight-bar rounded-full px-4 py-2 w-[92vw] max-w-[520px]'
            : 'cool-glass-island-capsule rounded-full px-2.5 py-1.5 min-w-[265px] sm:min-w-[350px]'
        }`}
      >
        {/* Specular Diagonal Refraction Overlay (Matches Image 2 _______4__3ed9dc6a.jpg) */}
        <div className="cool-glass-diagonal-streak pointer-events-none" />

        <AnimatePresence mode="wait" initial={false}>
          {/* STATE 1: COMPACT DYNAMIC ISLAND WITH SIRI ORB + "Search or Ask" + (+ O □) CAPSULE */}
          {phase === 'compact' && (
            <motion.div
              key="island-compact"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              className="relative z-10 flex items-center justify-between gap-2.5"
            >
              {/* Left: 3D Iridescent Lens Voice Sphere Orb */}
              <button
                type="button"
                onClick={startIslandVoiceListening}
                title="Lens Voice — تحدث أو اطلب تنفيذ مهمة"
                className="spring-btn flex items-center gap-2 pr-1 rounded-full focus:outline-none"
              >
                <SiriOrbIcon size="sm" status={orbStatus} audioLevel={audioLevel} />
              </button>

              {/* Center: "| Search or Ask" Trigger (Matches Image 2 _______4__3ed9dc6a.jpg) */}
              <button
                type="button"
                onClick={() => {
                  setPhase('search');
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="flex-1 flex items-center gap-1.5 text-left ltr:text-left rtl:text-right py-0.5 px-1.5 group focus:outline-none"
              >
                <span className="w-[2px] h-4 rounded-full bg-[#FFFDF9] shadow-[0_0_8px_#FFB84D,0_0_14px_#FFFFFF] animate-pulse shrink-0" />
                <span className="text-xs font-medium text-[#E5E0D8] group-hover:text-white truncate tracking-tight">
                  {language === 'ar'
                    ? 'Search or Ask · ابحث أو اطلب مهمة...'
                    : 'Search or Ask Lens Voice...'}
                </span>
              </button>

              {/* Right: Cool Glass (+ O □) Mini Action Capsule (Matches Video 3 70c4e39a.mp4) + Mic */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] border border-white/15 text-[#EAE5DC]">
                  <button
                    type="button"
                    onClick={() => onSelectView('project-analyzer')}
                    title={language === 'ar' ? 'تحليل مشروع جديد (+)' : 'New Analysis (+)'}
                    className="hover:text-white transition-transform hover:scale-110"
                  >
                    <Plus className="w-3 h-3 stroke-[2.2]" />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenVoiceModal}
                    title="Lens Voice Orb (O)"
                    className="hover:text-white transition-transform hover:scale-110"
                  >
                    <Circle className="w-2.5 h-2.5 stroke-[2.2]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectView('opportunities')}
                    title={language === 'ar' ? 'رادار الفرص (□)' : 'Opportunities (□)'}
                    className="hover:text-white transition-transform hover:scale-110"
                  >
                    <Square className="w-2.5 h-2.5 stroke-[2.2]" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={startIslandVoiceListening}
                  aria-label="الأمر الصوتي في الدايناميك آيلاند"
                  className="w-7 h-7 rounded-full bg-white/[0.1] hover:bg-white/[0.18] border border-white/20 flex items-center justify-center text-[#F5F2EB] transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 2: EXPANDED "Search or Ask" INPUT BAR OR LIVE VOICE LISTENING */}
          {(phase === 'search' || phase === 'listening') && (
            <motion.form
              key="island-search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onSubmit={(e) => {
                e.preventDefault();
                runDynamicIslandCommand(query);
              }}
              className="relative z-10 flex items-center justify-between gap-2.5 w-full"
            >
              <button
                type="button"
                onClick={onOpenVoiceModal}
                title="فتح نافذة Lens Voice الكاملة"
                className="shrink-0"
              >
                <SiriOrbIcon
                  size="sm"
                  status={phase === 'listening' ? 'listening' : 'idle'}
                  audioLevel={audioLevel}
                />
              </button>

              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <span className="w-[2px] h-5 rounded-full bg-[#FFFDF9] shadow-[0_0_10px_#FFB84D,0_0_16px_#FFFFFF] animate-pulse shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    phase === 'listening'
                      ? language === 'ar'
                        ? 'تحدث الآن... مثلاً: ابحث لي عن عمل لكتابة أو ترجمة محتوى'
                        : 'Listening... e.g., Find freelance content writing or translation jobs'
                      : 'Search or Ask (e.g. ابحث لي عن عمل لكتابة أو نسخ أو ترجمة محتوى)...'
                  }
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-[#FAF7F2] placeholder-[#C8C0B4] focus:outline-none focus:ring-0"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {query.trim() && (
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-full bg-gradient-to-r from-[#FF7A45] via-[#FFB84D] to-[#38BDF8] text-[#09080B] font-extrabold text-[11px] shadow-md hover:brightness-110 transition-all"
                  >
                    {language === 'ar' ? 'تنفيذ' : 'Run'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={startIslandVoiceListening}
                  aria-label="تحدث بالميكروفون"
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    phase === 'listening'
                      ? 'bg-[#FF4D4D] text-white border-white/40 shadow-[0_0_20px_rgba(255,77,77,0.65)] animate-pulse'
                      : 'bg-white/[0.1] hover:bg-white/[0.18] text-[#F5F2EB] border-white/20'
                  }`}
                >
                  {phase === 'listening' ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPhase('compact')}
                  aria-label="طي الدايناميك آيلاند"
                  className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-[#D5CFC4] flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.form>
          )}

          {/* STATE 3: MULTI-STATE MORPHING AI STATUS PILLS (Thinking... / Searching... / Planning...)
              Matches Video 1 (0a12ce78.mp4) and Video 4 (0b1ebd52.mp4 spinning dots ring) */}
          {(phase === 'Thinking...' ||
            phase === 'Searching...' ||
            phase === 'Planning...') && (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 5, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 flex items-center justify-center gap-3 py-0.5"
            >
              {/* Spinning Ring of Luminous White Dots (Matches Video 4 0b1ebd52.mp4 at 00:06) */}
              <div className="relative w-5 h-5 flex items-center justify-center animate-spin">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
                  <span
                    key={deg}
                    className="absolute w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#FFFFFF]"
                    style={{
                      opacity: 0.25 + (idx / 8) * 0.75,
                      transform: `rotate(${deg}deg) translateY(-7px)`,
                    }}
                  />
                ))}
              </div>

              <span className="font-display text-sm sm:text-base font-semibold tracking-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
                {phase}
              </span>

              <SiriOrbIcon size="xs" status={orbStatus} audioLevel={0.65} />
            </motion.div>
          )}

          {/* STATE 4: EXPANDED DYNAMIC ISLAND SPOKEN RESPONSE BANNER (Matches Video 4 0b1ebd52.mp4 at 00:09) */}
          {phase === 'result' && (
            <motion.div
              key="island-result"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <SiriOrbIcon size="md" status="speaking" audioLevel={0.6} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FDE68A]">
                    {lastIntent?.requiresConfirmation && !lastIntent.confirmed ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-[#FF3B30] shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                    )}
                    <span>
                      {resultSummary === 'لا أعرف.' || resultSummary === "I don't know."
                        ? 'Lens Voice'
                        : lastIntent?.requiresConfirmation && !lastIntent.confirmed
                        ? language === 'ar'
                          ? 'يتطلب تأكيدك قبل التنفيذ'
                          : 'Confirmation Required'
                        : 'Firework AI · تم تنفيذ الأمر والتحقق'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white leading-snug line-clamp-2 mt-0.5">
                    {resultSummary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {lastIntent?.requiresConfirmation && !lastIntent.confirmed ? (
                  <>
                    <button
                      type="button"
                      data-testid="island-confirm-destructive"
                      onClick={() => {
                        const confirmedIntent: VoiceTaskIntentResult = {
                          ...lastIntent,
                          confirmed: true,
                          executionTrace: [
                            ...(lastIntent.executionTrace || []),
                            'USER_CONFIRMED',
                            'EXECUTE',
                            'VERIFY',
                          ],
                        };
                        setLastIntent(confirmedIntent);
                        onExecuteTaskIntent(confirmedIntent, rawCommandText);
                        setResultSummary(
                          language === 'ar'
                            ? 'تم تأكيد الحذف وتنفيذه بنجاح.'
                            : 'Deletion confirmed and executed.'
                        );
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#FF3B30] hover:bg-[#DC2626] text-[11px] font-bold text-white flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>{language === 'ar' ? 'تأكيد الحذف' : 'Confirm'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLastIntent(null);
                        setPhase('compact');
                      }}
                      className="px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </>
                ) : (
                  resultSummary !== 'لا أعرف.' &&
                  resultSummary !== "I don't know." && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectView(lastExecutedTarget);
                        setPhase('compact');
                      }}
                      className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-[11px] font-bold text-white flex items-center gap-1"
                    >
                      <span>{language === 'ar' ? 'عرض النتائج' : 'Open'}</span>
                      <ArrowUpLeft className="w-3.5 h-3.5" />
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => setPhase('compact')}
                  aria-label="إغلاق إشعار الدايناميك آيلاند"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* =====================================================================
          COOL GLASS SPOTLIGHT DROPDOWN PANEL (Matches Image 2 _______4__3ed9dc6a.jpg)
          Applications ⌘& | Files ⌘é | Actions ⌘" | Clipboard ⌘'
         ===================================================================== */}
      <AnimatePresence>
        {phase === 'search' && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[calc(100%+10px)] w-[92vw] max-w-[520px] rounded-[28px] cool-glass-dropdown-panel p-3.5 z-50 overflow-hidden shadow-[0_28px_70px_rgba(0,0,0,0.65)]"
          >
            {/* Diagonal Specular Light Refraction Streak across Frosted Smoked Glass */}
            <div className="cool-glass-diagonal-streak pointer-events-none" />

            {/* 4 Primary Cool Glass Rows from Image 2 (_______4__3ed9dc6a.jpg) */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-1.5 pb-3 border-b border-white/15">
              <button
                type="button"
                onClick={() => setActiveCategory('applications')}
                className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all ${
                  activeCategory === 'applications'
                    ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                    : 'text-[#E5E0D8] hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-2">
                  <AppWindow className="w-3.5 h-3.5 text-[#FDE68A]" />
                  <span>Applications</span>
                </span>
                <kbd className="font-mono text-[10px] opacity-75">⌘&amp;</kbd>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('files')}
                className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all ${
                  activeCategory === 'files'
                    ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                    : 'text-[#E5E0D8] hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Files</span>
                </span>
                <kbd className="font-mono text-[10px] opacity-75">⌘é</kbd>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('actions')}
                className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all ${
                  activeCategory === 'actions'
                    ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                    : 'text-[#E5E0D8] hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#FF8A3D]" />
                  <span>Actions</span>
                </span>
                <kbd className="font-mono text-[10px] opacity-75">⌘&quot;</kbd>
              </button>

              <button
                type="button"
                onClick={() => setActiveCategory('clipboard')}
                className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all ${
                  activeCategory === 'clipboard'
                    ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                    : 'text-[#E5E0D8] hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Clipboard className="w-3.5 h-3.5 text-[#A7F3D0]" />
                  <span>Clipboard</span>
                </span>
                <kbd className="font-mono text-[10px] opacity-75">⌘&apos;</kbd>
              </button>
            </div>

            {/* Contextual Items inside the Selected Category */}
            <div className="relative z-10 pt-3 space-y-1.5">
              {activeCategory === 'actions' && (
                <>
                  <div className="px-2 pb-1 flex items-center justify-between text-[11px] text-[#D6CFC5]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFB84D]" />
                      <span>
                        {language === 'ar'
                          ? 'مهام ينفذها المساعد الصوتي فوراً داخل التطبيق:'
                          : 'Instant Voice & AI In-App Tasks:'}
                      </span>
                    </span>
                    <span className="font-mono text-[10px] opacity-80">Lens Voice</span>
                  </div>
                  {quickVoiceActions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => runDynamicIslandCommand(item.command)}
                      className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl hover:bg-white/15 text-right ltr:text-left transition-all group border border-transparent hover:border-white/20"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SiriOrbIcon size="xs" status="idle" />
                        <span className="text-xs font-semibold text-[#FAF7F2] truncate">
                          {language === 'ar' ? item.labelAr : item.labelEn}
                        </span>
                      </div>
                      <kbd className="font-mono text-[11px] text-[#D6CFC5] group-hover:text-white shrink-0">
                        {item.shortcut}
                      </kbd>
                    </button>
                  ))}
                </>
              )}

              {activeCategory === 'applications' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[
                    {
                      id: 'opportunities' as ViewId,
                      title:
                        language === 'ar'
                          ? 'رادار الفرص والوظائف'
                          : 'Opportunities Radar',
                      key: '⌘O',
                    },
                    {
                      id: 'project-analyzer' as ViewId,
                      title:
                        language === 'ar'
                          ? 'محلل العقود والمشاريع'
                          : 'Contract Analyzer',
                      key: '⌘A',
                    },
                    {
                      id: 'proposal-studio' as ViewId,
                      title:
                        language === 'ar'
                          ? 'استوديو العروض التنافسية'
                          : 'Proposal Studio',
                      key: '⌘P',
                    },
                    {
                      id: 'lens-chat' as ViewId,
                      title: 'Lens AI Workspace Chat',
                      key: '⌘L',
                    },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => {
                        onSelectView(app.id);
                        setPhase('compact');
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-white/15 text-xs font-semibold text-[#FAF7F2] border border-white/10"
                    >
                      <span>{app.title}</span>
                      <kbd className="font-mono text-[10px] text-[#D6CFC5]">
                        {app.key}
                      </kbd>
                    </button>
                  ))}
                </div>
              )}

              {activeCategory === 'files' && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('file-analysis');
                      setPhase('compact');
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-white/15 text-xs font-semibold text-[#FAF7F2]"
                  >
                    <span>
                      {language === 'ar'
                        ? 'فحص وتحليل ملفات PDF و DOCX والصور بالذكاء الاصطناعي'
                        : 'Analyze PDF, DOCX & Images in File & Vision AI'}
                    </span>
                    <kbd className="font-mono text-[11px] text-[#D6CFC5]">⌘é</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('resume-analyzer');
                      setPhase('compact');
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-white/15 text-xs font-semibold text-[#FAF7F2]"
                  >
                    <span>
                      {language === 'ar'
                        ? 'تحليل السيرة الذاتية CV ومطابقتها مع الفرص'
                        : 'Resume & CV Compatibility Analyzer'}
                    </span>
                    <kbd className="font-mono text-[11px] text-[#D6CFC5]">⌘R</kbd>
                  </button>
                </div>
              )}

              {activeCategory === 'clipboard' && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      runDynamicIslandCommand(
                        'ابحث لي عن عمل مناسب مثلاً لكتابة أو نسخ أو ترجمة محتوى'
                      )
                    }
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-white/15 text-xs font-semibold text-[#FAF7F2]"
                  >
                    <span>
                      {language === 'ar'
                        ? 'لصق وتنفيذ سريع: بحث عن مشاريع كتابة ونسخ وترجمة محتوى'
                        : 'Quick Paste: Find writing, copywriting & translation projects'}
                    </span>
                    <kbd className="font-mono text-[11px] text-[#D6CFC5]">⌘V</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('overview');
                      setPhase('compact');
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-white/15 text-xs font-semibold text-[#FAF7F2]"
                  >
                    <span>
                      {language === 'ar'
                        ? 'الانتقال إلى مساحة العمل الرئيسية للصق وصف مشروع'
                        : 'Open Main AI Composer to paste project brief'}
                    </span>
                    <kbd className="font-mono text-[11px] text-[#D6CFC5]">⌘&apos;</kbd>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

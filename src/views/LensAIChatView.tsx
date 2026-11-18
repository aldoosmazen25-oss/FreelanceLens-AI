import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  MessageSquarePlus,
  Search,
  Send,
  Radio,
  Volume2,
  FolderGit2,
  Trash2,
  X,
  History,
  Copy,
  Check,
  RotateCcw,
  Square,
  AlertCircle,
  Paperclip,
  FileText,
  CheckCircle2,
  ShieldAlert,
  ArrowUpLeft,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../i18n/LanguageContext';
import { ChatMessage, ChatSession, ViewId } from '../types';
import {
  validateComposerAttachment,
  VoiceTaskIntentResult,
} from '../utils/calculations';
import { useMotionSystem, EASE_OUT_EXPO } from '../utils/motionVariants';

const EXPERT_PROMPTS = [
  'بدل وضعي من Work إلى Sleep',
  'ابحث لي عن أعمال مناسبة في التصميم أو البرمجة للمبتدئين',
  'أضف مهارة Figma إلى مهاراتي في الملف المهني',
  'كيف أصيغ بند حماية النطاق (Scope Creep) في عقد التطوير؟',
];

interface LensAIChatViewProps {
  onSelectView?: (view: ViewId) => void;
  onExecuteTaskIntent?: (
    intent: VoiceTaskIntentResult,
    rawQuery: string,
    options?: { skipNavigation?: boolean }
  ) => void;
}

export const LensAIChatView: React.FC<LensAIChatViewProps> = ({
  onSelectView,
  onExecuteTaskIntent,
}) => {
  const {
    userProfile,
    projects,
    opportunities,
    proposals,
    financials,
    notifications,
    chatSessions,
    saveChatSession,
    deleteChatSession,
    addNotification,
  } = useData();
  const { language } = useLanguage();
  const { reducedMotion } = useMotionSystem();

  const [activeSessionId, setActiveSessionId] = useState<string>(
    chatSessions[0]?.id || 'chat-welcome-lens'
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [linkedProjectId, setLinkedProjectId] = useState<string>(
    chatSessions[0]?.linkedProjectId || projects[0]?.id || ''
  );
  const [mode, setMode] = useState<'fast' | 'balanced' | 'deep'>('deep');
  const [input, setInput] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    formattedSize: string;
    extractedText: string;
  } | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);

  const [isSending, setIsSending] = useState<boolean>(false);
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isUserNearBottomRef = useRef<boolean>(true);

  const currentSession =
    chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0];

  const filteredSessions = chatSessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScrollContainer = () => {
    const el = messagesScrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isUserNearBottomRef.current = distanceFromBottom <= 96;
  };

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (el && isUserNearBottomRef.current) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    }
  }, [currentSession?.messages.length, isSending, reducedMotion]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 44), 140)}px`;
  }, [input]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setAttachError(null);
    const check = validateComposerAttachment({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!check.valid) {
      setAttachError(
        language === 'ar'
          ? check.errorAr || 'ملف غير مدعوم'
          : check.errorEn || 'Unsupported file'
      );
      return;
    }

    if (check.category === 'text') {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : '';
        setAttachedFile({
          name: file.name,
          formattedSize: check.formattedSize,
          extractedText: text.slice(0, 6000),
        });
      };
      reader.readAsText(file);
    } else {
      setAttachedFile({
        name: file.name,
        formattedSize: check.formattedSize,
        extractedText: `[مرفق: ${file.name} (${check.formattedSize})]`,
      });
    }
  };

  const handleStartNewChat = async () => {
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      ownerId: userProfile.uid,
      title: language === 'ar' ? 'محادثة جديدة مع Lens AI' : 'New Lens AI Chat',
      linkedProjectId: linkedProjectId || undefined,
      updatedAt: new Date().toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          text:
            language === 'ar'
              ? `مرحباً ${userProfile.name || 'بك'}! أنا Lens AI في Firework AI. كيف يمكنني مساعدتك في تحليل مشروع، تسعير مرحلة، أو صياغة عقد اليوم؟`
              : `Hello ${userProfile.name || 'there'}! I am Lens AI in Firework AI. How can I help you analyze a project, price a milestone, or review a contract today?`,
          timestamp: language === 'ar' ? 'الآن' : 'Now',
          modelMode: 'استدلال وتفكير عميق',
        },
      ],
    };
    await saveChatSession(newSession);
    setActiveSessionId(newSession.id);
    setFailedPrompt(null);
  };

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsSending(false);
  };

  const sendPromptText = async (promptText: string) => {
    const combinedText = attachedFile
      ? `${promptText.trim()}\n\nمحتوى المرفق (${attachedFile.name}):\n${attachedFile.extractedText}`.trim()
      : promptText.trim();

    if (!combinedText || !currentSession || isSending) return;

    setFailedPrompt(null);
    isUserNearBottomRef.current = true;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      text: attachedFile
        ? `${promptText.trim() || `تحليل المرفق: ${attachedFile.name}`}\n📎 ${attachedFile.name} (${attachedFile.formattedSize})`
        : combinedText,
      timestamp: new Date().toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updatedWithUser: ChatSession = {
      ...currentSession,
      title:
        currentSession.messages.length <= 1
          ? userMsg.text.slice(0, 46)
          : currentSession.title,
      linkedProjectId: linkedProjectId || undefined,
      updatedAt: userMsg.timestamp,
      messages: [...currentSession.messages, userMsg],
    };

    await saveChatSession(updatedWithUser);
    setInput('');
    setAttachedFile(null);
    setIsSending(true);

    const linkedProject = projects.find((p) => p.id === linkedProjectId) || null;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/gemini/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: combinedText,
          channel: 'chat',
          language,
          history: updatedWithUser.messages,
          linkedProject,
          userProfile,
          projects,
          opportunities,
          proposals,
          financials,
          notifications,
          workStatus: userProfile.workStatus || 'work',
          mode,
        }),
      });
      if (!res.ok) {
        throw new Error('Request failed');
      }
      const data = await res.json();
      const resolvedIntent: VoiceTaskIntentResult | undefined = data.taskIntent;
      const isAction =
        resolvedIntent && resolvedIntent.actionType !== 'unknown';
      const needsConfirm = Boolean(
        isAction &&
          resolvedIntent?.requiresConfirmation &&
          !resolvedIntent?.confirmed
      );

      if (isAction && !needsConfirm && onExecuteTaskIntent) {
        onExecuteTaskIntent(resolvedIntent, combinedText, {
          skipNavigation: true,
        });
      }

      const assistantMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: 'assistant',
        text: data.reply || 'تم تحليل استفسارك بواسطة Lens AI.',
        timestamp: new Date().toLocaleTimeString('ar-SA', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        modelMode: data.modelMode || 'استدلال وتفكير عميق',
        agentMeta: isAction
          ? {
              actionType: resolvedIntent.actionType,
              executed: !needsConfirm,
              verified: !needsConfirm,
              requiresConfirmation: needsConfirm,
              targetView: resolvedIntent.targetView,
              pendingIntent: needsConfirm ? resolvedIntent : undefined,
              rawQuery: combinedText,
            }
          : undefined,
      };
      await saveChatSession({
        ...updatedWithUser,
        updatedAt: assistantMsg.timestamp,
        messages: [...updatedWithUser.messages, assistantMsg],
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setFailedPrompt(combinedText);
      } else {
        setFailedPrompt(combinedText);
        addNotification({
          title: 'تعذر إتمام رد Lens AI',
          message: 'يمكنك الضغط على زر إعادة المحاولة لإرسال رسالتك فوراً.',
          type: 'error',
        });
      }
    } finally {
      abortControllerRef.current = null;
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendPromptText(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPromptText(input);
    }
  };

  const handleCopyMessage = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.text);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 1800);
  };

  const handleVoiceDictation = () => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setInput('كيف أصيغ بند حماية النطاق في عقد تطوير برمجي؟');
      return;
    }
    if (isDictating) {
      setIsDictating(false);
      return;
    }
    setIsDictating(true);
    const rec = new SpeechRec();
    rec.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    rec.onresult = (ev: any) => {
      const text = ev.results?.[0]?.[0]?.transcript || '';
      if (text) setInput((prev) => `${prev ? prev + ' ' : ''}${text}`);
      setIsDictating(false);
    };
    rec.onerror = () => setIsDictating(false);
    rec.onend = () => setIsDictating(false);
    rec.start();
  };

  const handleSpeakMessage = async (msg: ChatMessage) => {
    if (speakingMsgId === msg.id) {
      setSpeakingMsgId(null);
      window.speechSynthesis?.cancel();
      return;
    }
    setSpeakingMsgId(msg.id);
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.text, voiceName: 'Kore' }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.onended = () => setSpeakingMsgId(null);
        await audio.play();
      } else {
        setSpeakingMsgId(null);
      }
    } catch {
      setSpeakingMsgId(null);
    }
  };

  return (
    <div className="relative flex flex-col lg:flex-row gap-4 h-[calc(100vh-8.2rem)] min-h-[540px] pb-16 lg:pb-0 max-w-5xl mx-auto">
      {/* Collapsible Clean Chat History Sidebar */}
      <AnimatePresence initial={false}>
        {isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0, x: reducedMotion ? 0 : 16 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { duration: reducedMotion ? 0.01 : 0.2, ease: EASE_OUT_EXPO },
            }}
            exit={{
              opacity: 0,
              x: reducedMotion ? 0 : 16,
              transition: { duration: reducedMotion ? 0.01 : 0.15, ease: EASE_OUT_EXPO },
            }}
            className="w-full lg:w-72 shrink-0 flex"
          >
            <div className="w-full p-4 rounded-2xl bg-white dark:bg-[#15171C] border border-[#E5E5EA] dark:border-[#262930] flex flex-col justify-between overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E5EA] dark:border-[#262930]">
                  <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {language === 'ar'
                      ? `المحادثات (${chatSessions.length})`
                      : `Conversations (${chatSessions.length})`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen(false)}
                    aria-label="إغلاق سجل المحادثات"
                    className="p-1 rounded-lg text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleStartNewChat}
                  className="spring-btn w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#0066CC] text-white font-semibold text-xs"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>
                    {language === 'ar' ? 'محادثة جديدة' : 'New Conversation'}
                  </span>
                </button>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#6E6E73] absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === 'ar' ? 'بحث في السجل...' : 'Search history...'
                    }
                    className="w-full pr-8 pl-3 py-1.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1E26] border border-[#E5E5EA] dark:border-[#262930] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#6E6E73] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto my-3 space-y-1.5 no-scrollbar">
                {filteredSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-2.5 rounded-xl border transition-colors flex items-center justify-between gap-2 ${
                      currentSession?.id === sess.id
                        ? 'bg-[#EFF6FF] dark:bg-[#1E293B] border-[#BFDBFE] dark:border-[#3B82F6]/40 text-[#0066CC] dark:text-[#60A5FA]'
                        : 'bg-[#F5F5F7]/60 dark:bg-[#1C1E26]/60 border-transparent text-[#515154] dark:text-[#A1A1A6]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveSessionId(sess.id)}
                      className="text-right flex-1 min-w-0"
                    >
                      <div className="text-xs font-semibold truncate">
                        {sess.title}
                      </div>
                      <div className="text-[10px] text-[#6E6E73] mt-0.5 font-mono">
                        {sess.messages.length} · {sess.updatedAt}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteChatSession(sess.id)}
                      aria-label={`حذف المحادثة ${sess.title}`}
                      className="p-1 rounded-lg text-[#6E6E73] hover:text-[#DC2626]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Clean Apple-Inspired Chat Surface */}
      <div className="relative flex-1 rounded-2xl bg-white dark:bg-[#15171C] border border-[#E5E5EA] dark:border-[#262930] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between overflow-hidden">
        {/* Clean Minimal Top Header */}
        <div className="px-4 py-3 border-b border-[#E5E5EA] dark:border-[#262930] bg-[#FAFAFC] dark:bg-[#111318] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
              Lens AI
            </span>

            <button
              type="button"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="spring-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#181B22] border border-[#E5E5EA] dark:border-[#262930] text-xs font-medium text-[#515154] dark:text-[#A1A1A6]"
            >
              <History className="w-3.5 h-3.5" />
              <span>
                {language === 'ar'
                  ? `السجل (${chatSessions.length})`
                  : `History (${chatSessions.length})`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleStartNewChat}
              className="spring-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#181B22] border border-[#E5E5EA] dark:border-[#262930] text-xs font-semibold text-[#0066CC] dark:text-[#60A5FA]"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'جديد' : 'New'}</span>
            </button>
          </div>

          {/* Project Context Selector & Reasoning Mode */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#181B22] border border-[#E5E5EA] dark:border-[#262930]">
              <FolderGit2 className="w-3.5 h-3.5 text-[#0066CC] dark:text-[#60A5FA] shrink-0" />
              <select
                aria-label="ربط المشروع بالحوار"
                value={linkedProjectId}
                onChange={(e) => setLinkedProjectId(e.target.value)}
                className="max-w-[160px] bg-transparent text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none truncate"
              >
                <option value="" className="bg-white dark:bg-[#15171C]">
                  {language === 'ar' ? 'سياق عام' : 'General context'}
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-[#15171C]">
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[#F5F5F7] dark:bg-[#1C1E26] border border-[#E5E5EA] dark:border-[#262930]">
              {[
                { id: 'fast', ar: 'سريع', en: 'Fast' },
                { id: 'balanced', ar: 'متوازن', en: 'Balanced' },
                { id: 'deep', ar: 'معمق', en: 'Deep' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id as any)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                    mode === m.id
                      ? 'bg-white dark:bg-[#262934] text-[#0066CC] dark:text-[#60A5FA] font-semibold shadow-2xs'
                      : 'text-[#6E6E73]'
                  }`}
                >
                  {language === 'ar' ? m.ar : m.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clean Conversation Area */}
        <div
          ref={messagesScrollRef}
          onScroll={handleScrollContainer}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4"
        >
          <AnimatePresence initial={false}>
            {currentSession?.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: reducedMotion ? 0.01 : 0.18, ease: EASE_OUT_EXPO },
                }}
                className={`flex ${
                  msg.role === 'user' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 space-y-2 border ${
                    msg.role === 'user'
                      ? 'bg-[#EFF6FF] dark:bg-[#1E293B] border-[#BFDBFE] dark:border-[#3B82F6]/35 text-[#1D1D1F] dark:text-[#F5F5F7]'
                      : 'bg-[#F5F5F7] dark:bg-[#1C1E26] border-[#E5E5EA] dark:border-[#262930] text-[#1D1D1F] dark:text-[#F5F5F7]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[11px] text-[#6E6E73]">
                    <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {msg.role === 'user'
                        ? userProfile.name || (language === 'ar' ? 'أنت' : 'You')
                        : 'Lens AI'}
                    </span>
                    <span className="font-mono text-[10px]">{msg.timestamp}</span>
                  </div>

                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {msg.text.replace(/\*\*/g, '')}
                  </div>

                  {msg.role === 'assistant' && msg.agentMeta?.actionType && (
                    <div className="pt-2 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                      {msg.agentMeta.requiresConfirmation && !msg.agentMeta.executed ? (
                        <div className="flex flex-wrap items-center gap-2 w-full justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#DC2626] dark:text-[#F87171]">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {language === 'ar'
                                ? 'إجراء حساس — بانتظار تأكيدك'
                                : 'Sensitive action — confirmation required'}
                            </span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              data-testid="chat-confirm-action"
                              onClick={async () => {
                                const pending = msg.agentMeta
                                  ?.pendingIntent as VoiceTaskIntentResult | undefined;
                                if (pending && onExecuteTaskIntent) {
                                  onExecuteTaskIntent(
                                    {
                                      ...pending,
                                      confirmed: true,
                                      executionTrace: [
                                        ...(pending.executionTrace || []),
                                        'USER_CONFIRMED',
                                        'EXECUTE',
                                        'VERIFY',
                                      ],
                                    },
                                    msg.agentMeta?.rawQuery || '',
                                    { skipNavigation: true }
                                  );
                                }
                                if (currentSession) {
                                  const nextMsgs = currentSession.messages.map((m) =>
                                    m.id === msg.id
                                      ? {
                                          ...m,
                                          agentMeta: {
                                            ...m.agentMeta,
                                            executed: true,
                                            verified: true,
                                            requiresConfirmation: false,
                                          },
                                        }
                                      : m
                                  );
                                  await saveChatSession({
                                    ...currentSession,
                                    messages: nextMsgs,
                                  });
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11px] font-bold"
                            >
                              {language === 'ar' ? 'تأكيد الحذف النهائي' : 'Confirm Delete'}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (currentSession) {
                                  const nextMsgs = currentSession.messages.map((m) =>
                                    m.id === msg.id
                                      ? {
                                          ...m,
                                          text:
                                            language === 'ar'
                                              ? `${m.text}\n\n[تم إلغاء الحذف بناءً على طلبك]`
                                              : `${m.text}\n\n[Action cancelled]`,
                                          agentMeta: undefined,
                                        }
                                      : m
                                  );
                                  await saveChatSession({
                                    ...currentSession,
                                    messages: nextMsgs,
                                  });
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#262934] border border-[#E5E5EA] dark:border-white/15 text-[11px] font-semibold text-[#515154] dark:text-[#CBD5E1]"
                            >
                              {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span
                            data-testid="chat-action-verified-badge"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold"
                          >
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span>
                              {language === 'ar'
                                ? `نُفِّذ وتحُقِّق (${msg.agentMeta.actionType})`
                                : `Executed & Verified (${msg.agentMeta.actionType})`}
                            </span>
                          </span>
                          {msg.agentMeta.targetView && onSelectView && (
                            <button
                              type="button"
                              onClick={() => onSelectView(msg.agentMeta!.targetView!)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0066CC]/10 hover:bg-[#0066CC]/20 text-[#0066CC] dark:text-[#60A5FA] text-[11px] font-bold"
                            >
                              <span>{language === 'ar' ? 'فتح القسم' : 'Open Section'}</span>
                              <ArrowUpLeft className="w-3 h-3" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {msg.role === 'assistant' && (
                    <div className="pt-1 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-[#6E6E73] hover:text-[#0066CC] dark:hover:text-[#60A5FA]"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#0066CC]" />
                            <span>{language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(msg)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-[#6E6E73] hover:text-[#0066CC] dark:hover:text-[#60A5FA]"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>
                          {speakingMsgId === msg.id
                            ? language === 'ar'
                              ? 'يقرأ...'
                              : 'Speaking...'
                            : language === 'ar'
                            ? 'استماع'
                            : 'Listen'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Suggested Prompts when conversation is new */}
          {currentSession?.messages.length <= 1 && (
            <div className="pt-2 space-y-2 max-w-2xl mx-auto">
              <div className="text-xs font-medium text-[#6E6E73] text-center">
                {language === 'ar'
                  ? 'اختر سؤالاً للبدء مع Lens AI:'
                  : 'Select a starter question:'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXPERT_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendPromptText(p)}
                    className="p-3 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1E26] border border-[#E5E5EA] dark:border-[#262930] hover:border-[#0066CC] text-right text-xs text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typing Indicator & Cancel Control */}
          {isSending && (
            <div className="p-3 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1E26] border border-[#E5E5EA] dark:border-[#262930] text-xs text-[#515154] dark:text-[#A1A1A6] flex items-center justify-between gap-3 max-w-md ml-auto">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC] animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#0066CC] animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#0066CC] animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
                <span>
                  {language === 'ar'
                    ? 'Lens AI يكتب الرد الآن...'
                    : 'Lens AI is responding...'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCancelRequest}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FEF2F2] text-[#DC2626] text-[11px] font-semibold"
              >
                <Square className="w-3 h-3" />
                <span>{language === 'ar' ? 'إيقاف' : 'Stop'}</span>
              </button>
            </div>
          )}

          {/* Retry Control on Error */}
          {failedPrompt && !isSending && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] dark:bg-rose-950/30 border border-[#FECACA] text-xs text-[#DC2626] flex items-center justify-between gap-3 max-w-md ml-auto">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'تم إيقاف الطلب أو تعذر الإرسال'
                    : 'Request stopped or failed'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => sendPromptText(failedPrompt)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#0066CC] text-white font-semibold text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{language === 'ar' ? 'إعادة المحاولة' : 'Retry'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Persistent Chat Composer with File Attachment Support */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-[#E5E5EA] dark:border-[#262930] bg-[#FAFAFC] dark:bg-[#111318] space-y-2"
        >
          {attachedFile && (
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#181B22] border border-[#E5E5EA] dark:border-[#262930] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-3.5 h-3.5 text-[#0066CC] shrink-0" />
                <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                  {attachedFile.name}
                </span>
                <span className="text-[10px] font-mono text-[#6E6E73]">
                  ({attachedFile.formattedSize})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-1 text-[#6E6E73] hover:text-[#DC2626]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {attachError && (
            <div className="text-[11px] text-[#DC2626] px-1">{attachError}</div>
          )}

          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="إرفاق ملف"
              title={language === 'ar' ? 'إرفاق ملف' : 'Attach file'}
              className="p-2.5 rounded-xl bg-white dark:bg-[#181B22] border border-[#E5E5EA] dark:border-[#262930] text-[#6E6E73] hover:text-[#0066CC] shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleVoiceDictation}
              aria-label="إملاء صوتي"
              className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
                isDictating
                  ? 'bg-[#DC2626] text-white border-[#DC2626]'
                  : 'bg-white dark:bg-[#181B22] border-[#E5E5EA] dark:border-[#262930] text-[#6E6E73] hover:text-[#0066CC]'
              }`}
            >
              <Radio className="w-4 h-4" />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                language === 'ar'
                  ? 'اسأل Lens AI عن تسعير مرحلة، صياغة عقد، أو التفاوض مع عميل...'
                  : 'Ask Lens AI about contract scope, pricing, or client negotiation...'
              }
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#181B22] border border-[#E5E5EA] dark:border-[#262930] text-xs sm:text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#6E6E73] focus:outline-none resize-none"
            />

            <button
              type="submit"
              disabled={isSending || (!input.trim() && !attachedFile)}
              className="spring-btn inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0066CC] hover:bg-[#0055B3] dark:bg-[#2563EB] text-white font-semibold text-xs disabled:opacity-45 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إرسال' : 'Send'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

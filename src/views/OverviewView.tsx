import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ScanSearch,
  FilePenLine,
  FolderKanban,
  CheckCircle2,
  ArrowUpLeft,
  Mic,
  MicOff,
  MessageSquareCode,
  Paperclip,
  FileText,
  FileImage,
  X,
  Clock,
  DollarSign,
  AlertTriangle,
  HelpCircle,
  BookmarkPlus,
  Volume2,
  RotateCcw,
  Square,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  UserCheck,
  BookOpen,
  Sparkles,
  Layers,
  Camera,
  Moon,
  User,
} from 'lucide-react';
import { MatchRing } from '../components/common/MatchRing';
import { StatusBadge } from '../components/common/StatusBadge';
import { useData } from '../context/DataContext';
import { useLanguage } from '../i18n/LanguageContext';
import { ProjectAnalysisResult, SavedProject, ViewId } from '../types';
import {
  calculateProfileCompleteness,
  calculateDashboardMetrics,
  validateComposerAttachment,
  resolveVoiceAgentTaskIntent,
  VoiceTaskIntentResult,
} from '../utils/calculations';
import { useMotionSystem, EASE_OUT_EXPO } from '../utils/motionVariants';
import { SiriOrbIcon } from '../components/voice/SiriOrbIcon';

interface OverviewViewProps {
  onSelectView: (view: ViewId) => void;
  onOpenVoiceModal: () => void;
  onOpenCommandPalette?: () => void;
  onExecuteTaskIntent?: (
    intent: VoiceTaskIntentResult,
    rawQuery: string
  ) => void;
}

interface AttachedFileState {
  name: string;
  mimeType: string;
  size: number;
  formattedSize: string;
  category: 'image' | 'pdf' | 'docx' | 'text';
  base64?: string;
  previewUrl?: string;
  extractedText?: string;
  statusLabelAr: string;
  statusLabelEn: string;
}

const QUICK_SAMPLE_BRIEFS = [
  {
    id: 'sample-saas',
    labelAr: 'مشروع تطوير لوحة تحكم SaaS',
    labelEn: 'SaaS Dashboard Brief',
    title: 'تطوير منصة SaaS لإدارة العقود وتقارير العملاء',
    platform: 'Upwork',
    text: 'نبحث عن مطور Full-Stack لبناء بوابة ويب تساعد الشركات الاستشارية على مراجعة مسودات العقود، متابعة مراحل التسليم، وتوليد ملخصات تنفيذية باللغتين العربية والإنجليزية. الميزانية المتوقعة $3,200 والمدة المطلوبة 4 أسابيع عمل مع إمكانية إضافة تحسينات لاحقة.',
  },
  {
    id: 'sample-mobile',
    labelAr: 'تطبيق تجارة إلكترونية بدون ميزانية محددة',
    labelEn: 'E-commerce App (No Stated Budget)',
    title: 'إعادة تصميم وتطوير واجهة متجر إلكتروني متجاوب',
    platform: 'Mostaql',
    text: 'نرغب في تحديث واجهة متجرنا الإلكتروني بالكامل لتحسين سرعة التصفح على الهواتف وربط بوابة دفع محلية ونظام تتبع الطلبات. نحتاج إلى تنفيذ سريع واحترافي مع تسليم الكود المصدري كاملاً.',
  },
  {
    id: 'sample-ai',
    labelAr: 'ربط مساعد ذكاء اصطناعي ببيانات شركة',
    labelEn: 'AI Assistant Integration',
    title: 'دمج مساعد ذكي لتحليل المستندات والرد على استفسارات العملاء',
    platform: 'Direct Client',
    text: 'مطلوب مهندس برمجيات لربط واجهة محادثة ذكية مع قاعدة بيانات المستندات الخاصة بنا (PDF وملفات نصية) بحيث يتمكن الفريق من البحث وطلب ملخصات دقيقة. المدة المقترحة 3 أسابيع.',
  },
];

export const OverviewView: React.FC<OverviewViewProps> = ({
  onSelectView,
  onOpenVoiceModal,
  onOpenCommandPalette,
  onExecuteTaskIntent,
}) => {
  const {
    userProfile,
    projects,
    proposals,
    financials,
    selectedProjectForAction,
    setSelectedProjectForAction,
    saveProject,
    addNotification,
  } = useData();
  const { language, theme, toggleFocusTimer, isFocusRunning } = useLanguage();
  const { staggerContainer, staggerItem, reducedMotion } = useMotionSystem();

  const [workSleepMode, setWorkSleepMode] = useState<'work' | 'sleep'>('work');

  const [projectTitle, setProjectTitle] = useState<string>(
    selectedProjectForAction?.title || ''
  );
  const [platform, setPlatform] = useState<string>(
    selectedProjectForAction?.platform || 'Upwork'
  );
  const [description, setDescription] = useState<string>(
    selectedProjectForAction?.description || ''
  );
  const [showMetaInputs, setShowMetaInputs] = useState<boolean>(
    Boolean(selectedProjectForAction?.title)
  );
  const [useHighThinking, setUseHighThinking] = useState<boolean>(true);

  const [attachment, setAttachment] = useState<AttachedFileState | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ProjectAnalysisResult | null>(
    selectedProjectForAction?.analysis || null
  );
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [savedProjectBanner, setSavedProjectBanner] = useState<boolean>(false);
  const [copiedQuestions, setCopiedQuestions] = useState<boolean>(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: true,
    skills: true,
    budget: true,
    risks: true,
    compatibility: true,
    nextSteps: true,
  });

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const dashboardMetrics = calculateDashboardMetrics({
    projects,
    proposals,
    financials,
  });

  const completenessScore = calculateProfileCompleteness({
    name: userProfile.name,
    title: userProfile.title,
    bio: userProfile.bio,
    hourlyRate: userProfile.hourlyRate,
    skillsCount: userProfile.skills.length,
    portfolioCount: userProfile.portfolio.length,
  });

  // Auto-resize textarea height cleanly as user types
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const nextHeight = Math.min(Math.max(el.scrollHeight, 112), 280);
    el.style.height = `${nextHeight}px`;
  }, [description]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Scroll-reveal observer that smoothly reveals .scroll-reveal-block elements while keeping them readable if scripts fail
  useEffect(() => {
    const blocks = document.querySelectorAll('.scroll-reveal-block');
    if (typeof IntersectionObserver === 'undefined') {
      blocks.forEach((b) => b.classList.add('is-revealed'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );
    blocks.forEach((block) => observer.observe(block));
    return () => observer.disconnect();
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const deriveProjectTitle = (rawText: string, fileName?: string): string => {
    if (projectTitle.trim()) return projectTitle.trim();
    if (rawText.trim()) {
      const firstLine = rawText
        .trim()
        .split(/\n|\.|،/)[0]
        .trim();
      if (firstLine.length >= 4) {
        return firstLine.slice(0, 80);
      }
    }
    if (fileName) {
      return fileName.replace(/\.[^/.]+$/, '');
    }
    return language === 'ar' ? 'مشروع عمل حر جديد' : 'New Freelance Project';
  };

  const handleProcessFile = (file: File) => {
    setAttachmentError(null);
    const validation = validateComposerAttachment({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.valid || validation.category === 'unsupported') {
      const msg =
        language === 'ar'
          ? validation.errorAr || 'ملف غير مدعوم'
          : validation.errorEn || 'Unsupported file';
      setAttachmentError(msg);
      addNotification({
        title: language === 'ar' ? 'تعذر إرفاق الملف' : 'Attachment Error',
        message: msg,
        type: 'error',
      });
      return;
    }

    setIsReadingFile(true);

    if (validation.category === 'text') {
      const textReader = new FileReader();
      textReader.onload = () => {
        const content = typeof textReader.result === 'string' ? textReader.result : '';
        setAttachment({
          name: file.name,
          mimeType: file.type || 'text/plain',
          size: file.size,
          formattedSize: validation.formattedSize,
          category: 'text',
          extractedText: content.slice(0, 12000),
          statusLabelAr: 'تم استخراج النص بالكامل',
          statusLabelEn: 'Text extracted',
        });
        if (!description.trim() && content.trim()) {
          setDescription(content.trim().slice(0, 3000));
        }
        setIsReadingFile(false);
      };
      textReader.onerror = () => {
        setIsReadingFile(false);
        setAttachmentError(
          language === 'ar'
            ? 'تعذر قراءة الملف النصي.'
            : 'Could not read text file.'
        );
      };
      textReader.readAsText(file);
      return;
    }

    // For PDF, DOCX, and Images: read base64 (and extract printable UTF-8 strings for DOCX/PDF as supplementary context)
    const dataUrlReader = new FileReader();
    dataUrlReader.onload = () => {
      const resultStr = typeof dataUrlReader.result === 'string' ? dataUrlReader.result : '';
      const base64 = resultStr.split(',')[1] || '';

      let extractedHint = '';
      try {
        if (validation.category === 'pdf' || validation.category === 'docx') {
          const decoded = atob(base64.slice(0, 60000));
          const readableChunks = decoded.match(/[A-Za-z0-9\u0600-\u06FF\s.,:;!?()-]{8,}/g);
          if (readableChunks && readableChunks.length > 0) {
            extractedHint = readableChunks.slice(0, 40).join(' ').slice(0, 4000);
          }
        }
      } catch {
        extractedHint = '';
      }

      const validCategory =
        validation.category === 'unsupported' ? 'text' : validation.category;

      setAttachment({
        name: file.name,
        mimeType:
          file.type ||
          (validCategory === 'pdf'
            ? 'application/pdf'
            : validCategory === 'docx'
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'image/png'),
        size: file.size,
        formattedSize: validation.formattedSize,
        category: validCategory,
        base64,
        previewUrl: validCategory === 'image' ? resultStr : undefined,
        extractedText:
          extractedHint ||
          `Attached document: ${file.name} (${validCategory.toUpperCase()}, ${validation.formattedSize})`,
        statusLabelAr:
          validCategory === 'image'
            ? 'صورة جاهزة للفحص البصري'
            : 'مستند جاهز للتحليل الذكي',
        statusLabelEn:
          validCategory === 'image'
            ? 'Image ready for vision analysis'
            : 'Document ready for AI analysis',
      });
      setIsReadingFile(false);
    };
    dataUrlReader.onerror = () => {
      setIsReadingFile(false);
      setAttachmentError(
        language === 'ar'
          ? 'تعذر قراءة الملف المرفق. يرجى المحاولة بملف آخر.'
          : 'Failed to read attached file. Please try another file.'
      );
    };
    dataUrlReader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleVoiceDictation = () => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setDescription((prev) =>
        prev
          ? `${prev}\nنرغب في تطوير تطبيق ويب متكامل مع تقسيم العمل إلى ثلاث مراحل تسليم واضحة.`
          : 'نرغب في تطوير تطبيق ويب متكامل مع تقسيم العمل إلى ثلاث مراحل تسليم واضحة.'
      );
      return;
    }

    if (isDictating) {
      setIsDictating(false);
      return;
    }

    setIsDictating(true);
    const rec = new SpeechRec();
    rec.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    rec.interimResults = false;
    rec.onresult = (event: any) => {
      const spoken = event.results?.[0]?.[0]?.transcript || '';
      if (spoken) {
        setDescription((prev) => `${prev ? prev + ' ' : ''}${spoken}`);
      }
      setIsDictating(false);
    };
    rec.onerror = () => setIsDictating(false);
    rec.onend = () => setIsDictating(false);
    rec.start();
  };

  const handleCancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsAnalyzing(false);
    setAnalysisError(
      language === 'ar'
        ? 'تم إيقاف عملية التحليل بناءً على طلبك. يمكنك التعديل أو إعادة المحاولة.'
        : 'Analysis stopped. You can edit your input or retry anytime.'
    );
  };

  const runWorkspaceAnalysis = async () => {
    const cleanDesc = description.trim();
    if (!cleanDesc && !attachment) {
      setAnalysisError(
        language === 'ar'
          ? 'يرجى لصق وصف المشروع أو إرفاق ملف مواصفات لبدء التحليل.'
          : 'Please paste a project description or attach a file to start analyzing.'
      );
      return;
    }
    if (isAnalyzing) return;

    const finalTitle = deriveProjectTitle(cleanDesc, attachment?.name);
    setProjectTitle(finalTitle);
    setIsAnalyzing(true);
    setAnalysisError(null);
    setSavedProjectBanner(false);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/gemini/analyze-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          title: finalTitle,
          description:
            cleanDesc ||
            (attachment
              ? `تحليل المرفق: ${attachment.name}`
              : ''),
          platform,
          userProfile,
          useHighThinking,
          modelChoice: useHighThinking ? 'deep' : 'balanced',
          attachment: attachment
            ? {
                fileName: attachment.name,
                mimeType: attachment.mimeType,
                base64: attachment.base64,
                extractedText: attachment.extractedText,
              }
            : null,
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis request failed');
      }

      const data: ProjectAnalysisResult = await res.json();
      setAnalysis(data);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }, 80);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setAnalysisError(
          language === 'ar'
            ? 'تعذر إتمام التحليل حالياً. يرجى الضغط على إعادة المحاولة.'
            : 'Could not complete analysis right now. Please click Retry.'
        );
      }
    } finally {
      abortControllerRef.current = null;
      setIsAnalyzing(false);
    }
  };

  const handleComposerKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      runWorkspaceAnalysis();
    }
  };

  const handleSaveToProjects = async (): Promise<SavedProject | null> => {
    const finalTitle = deriveProjectTitle(description, attachment?.name);
    const saved = await saveProject({
      id: selectedProjectForAction?.id,
      title: finalTitle,
      description:
        description.trim() ||
        (attachment ? `مرفق: ${attachment.name}` : finalTitle),
      platform,
      budget:
        analysis?.explicitBudget &&
        !analysis.explicitBudget.includes('غير مذكور') &&
        !analysis.explicitBudget.includes('غير محدد')
          ? analysis.explicitBudget
          : language === 'ar'
          ? 'غير محدد من العميل'
          : 'Not specified',
      deadline:
        analysis?.explicitDeadline &&
        !analysis.explicitDeadline.includes('غير محدد')
          ? analysis.explicitDeadline
          : language === 'ar'
          ? 'غير محدد من العميل'
          : 'Not specified',
      matchScore: analysis?.matchScore || (userProfile.skills.length > 0 ? 85 : 70),
      status: 'analyzed',
      analysis: analysis || undefined,
    });
    setSelectedProjectForAction(saved);
    setSavedProjectBanner(true);
    addNotification({
      title: language === 'ar' ? 'تم حفظ التحليل والمشروع' : 'Analysis Saved',
      message:
        language === 'ar'
          ? `تم حفظ "${saved.title}" في قائمة مشاريعك.`
          : `"${saved.title}" was saved to My Projects.`,
      type: 'success',
      targetView: 'saved-projects',
    });
    return saved;
  };

  const handleGenerateTailoredProposal = async () => {
    await handleSaveToProjects();
    onSelectView('proposal-studio');
  };

  const handleAskFollowUpInChat = async () => {
    await handleSaveToProjects();
    onSelectView('lens-chat');
  };

  const handleCopyClarifications = () => {
    if (!analysis?.clientClarifications?.length) return;
    const text = analysis.clientClarifications
      .map((q, idx) => `${idx + 1}. ${q}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2000);
  };

  const handleListenSummary = async () => {
    if (!analysis) return;
    if (isSpeaking) {
      setIsSpeaking(false);
      window.speechSynthesis?.cancel();
      return;
    }
    setIsSpeaking(true);
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${analysis.executiveSummary}. ${analysis.clientGoal}`,
          voiceName: 'Kore',
        }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch {
      setIsSpeaking(false);
    }
  };

  const isLight = theme === 'light';

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8 pb-24 lg:pb-12 pt-2 sm:pt-4"
    >
      {/* =====================================================================
          1. CALM APPLE-INSPIRED AI WORKSPACE HEADER & MAIN COMPOSER
         ===================================================================== */}
      <motion.section
        variants={staggerItem}
        aria-label="مساحة العمل الذكية وتحليل المشاريع"
        className="space-y-5"
      >
        {/* Minimalist Centered Welcome Heading + Apple WWDC25 Segmented Capsule Mode Bar */}
        <div className="text-center space-y-3 px-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full apple-capsule-bar text-xs font-semibold text-[#111827] dark:text-white">
            <span className="w-2 h-2 rounded-full bg-[#007AFF] dark:bg-[#60A5FA]" />
            <span>
              {language === 'ar'
                ? 'Firework AI · مساحة العمل الذكية للمستقلين'
                : 'Firework AI · Intelligent Freelance Workspace'}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#090E1A] dark:text-white">
            {language === 'ar'
              ? 'ما المشروع الذي تود تحليله أو العمل عليه اليوم؟'
              : 'What project would you like to analyze today?'}
          </h1>

          <p className="text-xs sm:text-sm font-medium text-[#1E293B] dark:text-[#CBD5E1] max-w-2xl mx-auto leading-relaxed">
            {language === 'ar'
              ? 'الصق وصف مشروع عمل حر أو رسالة عميل، أو ارفق ملف مواصفات (PDF, DOCX, TXT, صور) لاستخراج المتطلبات، كشف المخاطر، تقييم التوافق مع ملفك المهني، وصياغة عرض مخصص.'
              : 'Paste a freelance job description or attach client specs (PDF, DOCX, TXT, images) to extract deliverables, spot risks, evaluate profile compatibility, and generate a tailored proposal.'}
          </p>

          {/* Apple WWDC25 Segmented Capsule Mode Bar + Detached Circular Reset Button (Desktop/Tablet) */}
          <div className="hidden sm:flex pt-1 items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1 p-1 rounded-full apple-capsule-bar max-w-full overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => textareaRef.current?.focus()}
                className="px-3.5 py-1.5 rounded-full apple-capsule-active text-xs font-bold text-[#007AFF] dark:text-[#60A5FA] flex items-center gap-1.5 whitespace-nowrap"
              >
                <ScanSearch className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'محلل المشاريع' : 'Analyzer'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('lens-chat')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#374151] dark:text-[#CBD5E1] hover:text-[#111827] dark:hover:text-white flex items-center gap-1.5 whitespace-nowrap transition-colors"
              >
                <MessageSquareCode className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
                <span>Lens AI</span>
              </button>

              <button
                type="button"
                onClick={onOpenVoiceModal}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#374151] dark:text-[#CBD5E1] hover:text-[#111827] dark:hover:text-white flex items-center gap-1.5 whitespace-nowrap transition-colors"
              >
                <SiriOrbIcon size="xs" status="idle" />
                <span>Lens Voice</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('proposal-studio')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#374151] dark:text-[#CBD5E1] hover:text-[#111827] dark:hover:text-white flex items-center gap-1.5 whitespace-nowrap transition-colors"
              >
                <FilePenLine className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
                <span>{language === 'ar' ? 'العروض' : 'Proposals'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setProjectTitle('');
                setDescription('');
                setAttachment(null);
                setAnalysis(null);
                setAnalysisError(null);
                textareaRef.current?.focus();
              }}
              title={language === 'ar' ? 'مشروع جديد / مسح' : 'New Project / Clear'}
              className="spring-btn w-9 h-9 rounded-full apple-circle-glass flex items-center justify-center text-[#007AFF] dark:text-[#60A5FA] shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ===================================================================
            iOS COOL GLASS BENTO WIDGETS ROW
            Matches Video 4 (0b1ebd52.mp4: Ask/Camera/Voice Bento + Calendar/Events)
            and Video 2 (fff77936.mp4: Work / Sleep Liquid Glass Refractive Switch)
           =================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Widget 1: iOS Cool Glass "Ask" + Camera + Lens Voice Orb Widget (Video 4 left widget) */}
          <div className="relative rounded-[28px] cool-glass-bento-widget p-4 flex flex-col justify-between gap-3 overflow-hidden">
            <div className="cool-glass-diagonal-streak pointer-events-none" />
            {/* Top "Ask" Pill Button */}
            <button
              type="button"
              onClick={() =>
                onOpenCommandPalette
                  ? onOpenCommandPalette()
                  : onSelectView('lens-chat')
              }
              className="relative z-10 w-full px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 flex items-center justify-between gap-2 text-white transition-all shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <SiriOrbIcon size="xs" status="idle" />
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  Ask Lens AI
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/75">⌘K</span>
            </button>

            {/* Bottom Two Circular Glass Action Orbs: Camera (Vision) & Voice Waveform */}
            <div className="relative z-10 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title={
                  language === 'ar'
                    ? 'تحليل ملف أو صورة مشروع'
                    : 'Upload file or image'
                }
                className="spring-btn h-13 rounded-full bg-white/14 hover:bg-white/22 border border-white/25 flex items-center justify-center gap-2 text-white shadow-sm"
              >
                <Camera className="w-4 h-4 text-[#FDE68A]" />
                <span className="text-xs font-semibold">
                  {language === 'ar' ? 'ملف / صورة' : 'Vision'}
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenVoiceModal}
                title="Lens Voice Assistant"
                className="spring-btn h-13 rounded-full bg-white/14 hover:bg-white/22 border border-white/25 flex items-center justify-center gap-2 text-white shadow-sm"
              >
                <SiriOrbIcon size="xs" status="listening" audioLevel={0.45} />
                <span className="text-xs font-semibold">Lens Voice</span>
              </button>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[11px] text-white/80 px-1">
              <span>Lens AI &amp; Voice</span>
              <button
                type="button"
                onClick={() => {
                  const cmd =
                    'ابحث لي عن عمل مناسب مثلاً لكتابة أو نسخ أو ترجمة محتوى';
                  const intent = resolveVoiceAgentTaskIntent(cmd);
                  onExecuteTaskIntent?.(intent, cmd);
                }}
                className="text-[#FDE68A] hover:underline font-bold"
              >
                {language === 'ar'
                  ? 'ابحث عن عمل كتابة وترجمة ←'
                  : 'Find writing/translation jobs →'}
              </button>
            </div>
          </div>

          {/* Widget 2: Liquid Glass Work / Sleep Refractive Lens Switch (Matches Video 2 fff77936.mp4) */}
          <div className="relative rounded-[28px] cool-glass-bento-widget p-4 flex flex-col items-center justify-between gap-3 overflow-hidden">
            <div className="cool-glass-diagonal-streak pointer-events-none" />
            <div className="relative z-10 w-full flex items-center justify-between text-[11px] text-white/85 px-1">
              <span className="font-bold">
                {language === 'ar' ? 'نمط العمل والتركيز' : 'Workspace Mode'}
              </span>
              <span className="font-mono text-[10px] text-[#FDE68A]">
                {workSleepMode === 'work' ? 'WORK ACTIVE' : 'SLEEP / CALM'}
              </span>
            </div>

            {/* Interactive Work / Sleep Pill Switch with Oversized Sliding Refractive Crystal Lens */}
            <button
              type="button"
              onClick={() => {
                const next = workSleepMode === 'work' ? 'sleep' : 'work';
                setWorkSleepMode(next);
                if (next === 'work' && !isFocusRunning) {
                  toggleFocusTimer();
                } else if (next === 'sleep' && isFocusRunning) {
                  toggleFocusTimer();
                }
              }}
              aria-label="تبديل وضع العمل Work أو الهدوء Sleep"
              className={`relative z-10 w-48 h-14 rounded-full p-1.5 flex items-center justify-between transition-all duration-500 ${
                workSleepMode === 'work'
                  ? 'work-pill-glow'
                  : 'sleep-pill-glow'
              }`}
            >
              {/* Oversized Refractive Crystal Glass Lens Orb sliding smoothly */}
              <motion.span
                layout
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 28,
                }}
                className={`w-12 h-12 rounded-full refractive-crystal-lens flex items-center justify-center shadow-xl ${
                  workSleepMode === 'work' ? 'order-1' : 'order-2'
                }`}
              >
                {workSleepMode === 'work' ? (
                  <User className="w-5 h-5 text-white drop-shadow" />
                ) : (
                  <Moon className="w-5 h-5 text-white drop-shadow" />
                )}
              </motion.span>

              <span
                className={`flex-1 text-center font-display text-sm font-extrabold tracking-tight text-white drop-shadow ${
                  workSleepMode === 'work' ? 'order-2 pr-2' : 'order-1 pl-2'
                }`}
              >
                {workSleepMode === 'work' ? 'Work' : 'Sleep'}
              </span>
            </button>

            <div className="relative z-10 text-[11px] text-white/80 text-center">
              {workSleepMode === 'work'
                ? language === 'ar'
                  ? 'وضع العمل النشط · تتبع الأرباح والمشاريع'
                  : 'Active Work Mode · Live Focus & Earnings'
                : language === 'ar'
                ? 'وضع الراحة الهادئ · إيقاف مؤقت للتركيز'
                : 'Calm Sleep Mode · Focus Timer Paused'}
            </div>
          </div>

          {/* Widget 3: iOS Cool Glass Calendar & Active Projects Bento Widget (Matches Video 4 right widget) */}
          <div className="relative rounded-[28px] cool-glass-bento-widget p-4 flex flex-col justify-between gap-2 overflow-hidden">
            <div className="cool-glass-diagonal-streak pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-extrabold tracking-widest uppercase text-white/75">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div className="font-display text-3xl font-light text-white leading-none mt-0.5 tabular-nums">
                  {new Date().getDate()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectView('opportunities')}
                className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-[10px] font-bold text-[#FDE68A]"
              >
                {language === 'ar' ? 'رادار الفرص' : 'Opportunities'}
              </button>
            </div>

            <div className="relative z-10 pl-2.5 border-l-2 border-white/50 space-y-0.5 my-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                {language === 'ar' ? 'مهام ومشاريع نشطة' : 'ACTIVE WORKSPACE'}
              </div>
              <div className="text-xs font-bold text-white">
                {language === 'ar'
                  ? `${projects.length} مشاريع · ${proposals.length} عروض`
                  : `${projects.length} Projects · ${proposals.length} Proposals`}
              </div>
              <div className="text-[11px] text-white/80 font-mono">
                9:00AM – 6:30PM
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[11px] text-white/80 pt-1">
              <span>Calendar &amp; Kanban</span>
              <button
                type="button"
                onClick={() => onSelectView('saved-projects')}
                className="text-white hover:underline font-semibold"
              >
                {language === 'ar' ? 'فتح لوحة المشاريع ←' : 'Open Kanban →'}
              </button>
            </div>
          </div>
        </div>

        {/* Main AI Input Composer Surface (Optical Liquid Glass Hot Surface) */}
        <div
          id="tour-composer"
          data-tour-id="tour-composer"
          onDragOver={(e) => {
            e.preventDefault();
            if (!isDraggingOver) setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className={`rounded-[28px] glassmorphic-panel transition-all duration-200 overflow-hidden ${
            isDraggingOver
              ? 'liquid-glass-hot ring-2 ring-[#007AFF]/40 scale-[1.005]'
              : 'liquid-glass-hot'
          }`}
        >
          {/* Optional Project Title & Platform Bar (Collapsible / Clean) */}
          <div className="px-4 sm:px-5 py-3 border-b border-slate-300/85 dark:border-white/10 bg-white/55 dark:bg-black/15 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'عنوان المشروع (اختياري — يُستنتج تلقائياً من الوصف)...'
                    : 'Project title (optional — auto-inferred from description)...'
                }
                aria-label="عنوان المشروع"
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#090E1A] dark:text-white placeholder-[#334155] dark:placeholder-[#94A3B8] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                aria-label="منصة العمل الحر"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="px-3 py-1 rounded-full text-xs font-bold apple-capsule-bar text-[#090E1A] dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="Upwork" className="bg-white dark:bg-[#0F172A]">Upwork</option>
                <option value="Mostaql" className="bg-white dark:bg-[#0F172A]">مستقل (Mostaql)</option>
                <option value="Freelancer" className="bg-white dark:bg-[#0F172A]">Freelancer</option>
                <option value="Fiverr" className="bg-white dark:bg-[#0F172A]">Fiverr</option>
                <option value="Khamsat" className="bg-white dark:bg-[#0F172A]">خمسات (Khamsat)</option>
                <option value="LinkedIn" className="bg-white dark:bg-[#0F172A]">LinkedIn</option>
                <option value="Direct Client" className="bg-white dark:bg-[#0F172A]">
                  {language === 'ar' ? 'عميل مباشر' : 'Direct Client'}
                </option>
              </select>

              <button
                type="button"
                onClick={() => setShowMetaInputs((prev) => !prev)}
                className="spring-btn px-3 py-1 rounded-full apple-capsule-bar text-[11px] font-bold text-[#0055D4] dark:text-[#60A5FA]"
              >
                {showMetaInputs
                  ? language === 'ar'
                    ? 'إخفاء الأمثلة'
                    : 'Hide samples'
                  : language === 'ar'
                  ? 'أمثلة سريعة'
                  : 'Sample briefs'}
              </button>
            </div>
          </div>

          {/* Quick Sample Briefs Bar (Expandable on demand or when empty) */}
          <AnimatePresence initial={false}>
            {(showMetaInputs || (!description.trim() && !attachment && !analysis)) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-b border-slate-300/85 dark:border-white/10 bg-slate-100/65 dark:bg-black/20"
              >
                <div className="px-4 sm:px-5 py-2.5 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-[#1E293B] dark:text-[#94A3B8]">
                    {language === 'ar' ? 'تجربة سريعة:' : 'Try a sample:'}
                  </span>
                  {QUICK_SAMPLE_BRIEFS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => {
                        setProjectTitle(sample.title);
                        setPlatform(sample.platform);
                        setDescription(sample.text);
                        setAnalysisError(null);
                      }}
                      className="spring-btn px-3 py-1 rounded-full text-[11px] font-bold apple-capsule-bar text-[#090E1A] dark:text-white hover:text-[#0055D4] dark:hover:text-[#60A5FA]"
                    >
                      {language === 'ar' ? sample.labelAr : sample.labelEn}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Multiline Auto-Expanding Textarea */}
          <div className="p-4">
            <textarea
              ref={textareaRef}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder={
                language === 'ar'
                  ? 'الصق تفاصيل المشروع، متطلبات العميل، أو بنود العقد هنا... (اضغط Enter للتحليل، أو Shift+Enter لسطر جديد)'
                  : 'Paste the project description, client requirements, or contract terms here... (Press Enter to analyze, Shift+Enter for a new line)'
              }
              aria-label="وصف المشروع ومتطلبات العميل"
              className="w-full resize-none bg-transparent text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#6E6E73] leading-relaxed focus:outline-none"
            />

            {/* Attached File Preview Chip / Card inside Composer */}
            {isReadingFile && (
              <div className="mt-3 p-3 rounded-xl bg-[#F5F5F7] dark:bg-[#1E2028] border border-[#E5E5EA] dark:border-[#262930] flex items-center gap-3 text-xs">
                <div className="w-4 h-4 rounded-full border-2 border-[#0066CC] border-t-transparent animate-spin shrink-0" />
                <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {language === 'ar'
                    ? 'جاري فحص وقراءة الملف المرفق...'
                    : 'Reading and preparing attached file...'}
                </span>
              </div>
            )}

            {attachment && !isReadingFile && (
              <div className="mt-3 p-3 rounded-xl bg-[#F5F5F7] dark:bg-[#1E2028] border border-[#E5E5EA] dark:border-[#262930] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {attachment.previewUrl ? (
                    <img
                      src={attachment.previewUrl}
                      alt={attachment.name}
                      className="w-10 h-10 rounded-lg object-cover border border-[#E5E5EA] dark:border-[#262930] shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] dark:bg-[#1E293B] border border-[#BFDBFE] dark:border-[#3B82F6]/30 flex items-center justify-center shrink-0">
                      {attachment.category === 'image' ? (
                        <FileImage className="w-5 h-5 text-[#0066CC] dark:text-[#60A5FA]" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#0066CC] dark:text-[#60A5FA]" />
                      )}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                      {attachment.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6E6E73]">
                      <span className="font-mono">{attachment.formattedSize}</span>
                      <span>·</span>
                      <span className="text-[#0066CC] dark:text-[#60A5FA] font-medium">
                        {language === 'ar'
                          ? attachment.statusLabelAr
                          : attachment.statusLabelEn}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  aria-label={language === 'ar' ? 'إزالة الملف المرفق' : 'Remove attachment'}
                  className="p-1.5 rounded-lg text-[#6E6E73] hover:text-[#DC2626] hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {attachmentError && (
              <div
                role="alert"
                className="mt-3 p-3 rounded-xl bg-[#FEF2F2] dark:bg-rose-950/30 border border-[#FECACA] dark:border-rose-800/50 flex items-center justify-between gap-2 text-xs text-[#DC2626] dark:text-rose-300"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{attachmentError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachmentError(null)}
                  className="p-1 rounded hover:bg-black/5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Composer Bottom Action Bar */}
          <div className="px-4 sm:px-5 py-3 border-t border-slate-300/85 dark:border-white/10 bg-slate-100/70 dark:bg-black/20 flex flex-wrap items-center justify-between gap-3">
            {/* Left/Start Controls: File Upload, Voice Input, Deep Analysis Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.webp,application/pdf,text/plain,image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="spring-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full apple-capsule-bar text-xs font-bold text-[#090E1A] dark:text-white"
                title={
                  language === 'ar'
                    ? 'إرفاق ملف مواصفات (PDF, DOCX, TXT, PNG, JPG)'
                    : 'Attach project file (PDF, DOCX, TXT, PNG, JPG)'
                }
              >
                <Paperclip className="w-3.5 h-3.5 text-[#0055D4] dark:text-[#60A5FA]" />
                <span>{language === 'ar' ? 'إرفاق ملف' : 'Attach file'}</span>
              </button>

              <button
                type="button"
                onClick={handleVoiceDictation}
                className={`spring-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                  isDictating
                    ? 'bg-[#FF3B30] text-white shadow-sm'
                    : 'apple-capsule-bar text-[#090E1A] dark:text-white'
                }`}
              >
                {isDictating ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'جاري الاستماع...' : 'Listening...'}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-[#0055D4] dark:text-[#60A5FA]" />
                    <span>{language === 'ar' ? 'إملاء صوتي' : 'Dictate'}</span>
                  </>
                )}
              </button>

              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Composer control group separator"
              />

              <label className="spring-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full apple-capsule-bar text-xs font-bold text-[#090E1A] dark:text-[#CBD5E1] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useHighThinking}
                  onChange={(e) => setUseHighThinking(e.target.checked)}
                  className="accent-[#0055D4] rounded"
                />
                <span>{language === 'ar' ? 'تحليل معمق' : 'Deep analysis'}</span>
              </label>
            </div>

            {/* Right/End Primary Action: Analyze / Stop */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {isAnalyzing && (
                <button
                  type="button"
                  onClick={handleCancelAnalysis}
                  className="spring-btn inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full liquid-glass-danger text-xs font-bold text-[#DC2626] dark:text-rose-300"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'إيقاف' : 'Stop'}</span>
                </button>
              )}

              <button
                type="button"
                disabled={isAnalyzing || isReadingFile || (!description.trim() && !attachment)}
                onClick={runWorkspaceAnalysis}
                className="spring-btn flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 rounded-full bg-gradient-to-r from-[#0066EE] to-[#0047B3] text-white font-bold text-xs sm:text-sm shadow-[0_6px_18px_rgba(0,85,212,0.34),inset_0_1px_1px_rgba(255,255,255,0.45)] disabled:opacity-75 disabled:pointer-events-none"
              >
                <ScanSearch className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>
                  {isAnalyzing
                    ? language === 'ar'
                      ? 'جاري تحليل المشروع...'
                      : 'Analyzing project...'
                    : language === 'ar'
                    ? 'تحليل المشروع'
                    : 'Analyze Project'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Error / Retry Banner */}
        {analysisError && !isAnalyzing && (
          <div
            role="alert"
            className="p-4 rounded-2xl liquid-glass-danger flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5 text-xs font-medium text-[#DC2626] dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{analysisError}</span>
            </div>
            <button
              type="button"
              onClick={runWorkspaceAnalysis}
              className="spring-btn inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#007AFF] text-white text-xs font-semibold shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إعادة المحاولة' : 'Retry'}</span>
            </button>
          </div>
        )}

        {/* Honest Real Loading State */}
        {isAnalyzing && (
          <div className="p-6 rounded-[26px] liquid-glass space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#007AFF] border-t-transparent animate-spin shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-[#111827] dark:text-white">
                    {language === 'ar'
                      ? 'جاري قراءة متطلبات المشروع ومقارنتها مع ملفك المهني...'
                      : 'Analyzing project scope, risks, and compatibility with your profile...'}
                  </div>
                  <div className="text-xs text-[#5B6474] dark:text-[#94A3B8] mt-0.5">
                    {language === 'ar'
                      ? 'يتم استخراج المخرجات، المهارات المطلوبة، الميزانية، والمخاطر المحتملة.'
                      : 'Extracting deliverables, required skills, budget facts, and potential risks.'}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="h-16 rounded-2xl skeleton-shimmer" />
              <div className="h-16 rounded-2xl skeleton-shimmer" />
              <div className="h-16 rounded-2xl skeleton-shimmer" />
            </div>
          </div>
        )}
      </motion.section>

      {/* =====================================================================
          2. STRUCTURED AI ANALYSIS RESULTS (Liquid Glass Optical Surface)
         ===================================================================== */}
      {analysis && !isAnalyzing && (
        <motion.section
          ref={resultsRef}
          initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          aria-label="نتائج تحليل المشروع"
          className="rounded-[28px] liquid-glass overflow-hidden divide-y divide-white/60 dark:divide-white/10"
        >
          {/* Top Action & Status Bar */}
          <div className="p-5 sm:p-6 bg-white/40 dark:bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#007AFF] dark:text-[#60A5FA] font-semibold">
                <span>
                  {language === 'ar' ? 'تقرير تحليل المشروع' : 'Project Analysis Report'}
                </span>
                <span>·</span>
                <span>{platform}</span>
                {attachment && (
                  <>
                    <span>·</span>
                    <span>{attachment.name}</span>
                  </>
                )}
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {projectTitle || deriveProjectTitle(description, attachment?.name)}
              </h2>
            </div>

            {/* Primary Next-Step Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleListenSummary}
                className="spring-btn inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#181B22] border border-[#E5E5EA] dark:border-[#262930] text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#0066CC] dark:text-[#60A5FA]" />
                <span>
                  {isSpeaking
                    ? language === 'ar'
                      ? 'إيقاف الصوت'
                      : 'Stop audio'
                    : language === 'ar'
                    ? 'استماع'
                    : 'Listen'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSaveToProjects}
                className="spring-btn inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#181B22] border border-[#E5E5EA] dark:border-[#262930] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:border-[#0066CC]"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-[#0066CC] dark:text-[#60A5FA]" />
                <span>{language === 'ar' ? 'حفظ التحليل' : 'Save analysis'}</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateTailoredProposal}
                className="spring-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0066CC] hover:bg-[#0055B3] dark:bg-[#2563EB] text-white text-xs font-semibold shadow-sm"
              >
                <FilePenLine className="w-3.5 h-3.5" />
                <span>
                  {language === 'ar' ? 'توليد عرض مخصص' : 'Generate tailored proposal'}
                </span>
              </button>
            </div>
          </div>

          {savedProjectBanner && (
            <div className="px-6 py-3 bg-[#EFF6FF] dark:bg-[#1E293B]/60 text-xs text-[#0066CC] dark:text-[#60A5FA] flex items-center justify-between">
              <span>
                {language === 'ar'
                  ? 'تم حفظ هذا المشروع وتحليله في قسم "مشاريعي".'
                  : 'Project and analysis saved to My Projects.'}
              </span>
              <button
                type="button"
                onClick={() => onSelectView('saved-projects')}
                className="font-semibold underline"
              >
                {language === 'ar' ? 'عرض في مشاريعي' : 'Open My Projects'}
              </button>
            </div>
          )}

          {/* SECTION 1: Project Overview & Deliverables */}
          <div className="p-5 sm:p-6 space-y-4">
            <button
              type="button"
              onClick={() => toggleSection('overview')}
              className="w-full flex items-center justify-between text-right"
            >
              <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0066CC] dark:text-[#60A5FA]" />
                <span>
                  {language === 'ar'
                    ? '1. نظرة عامة على المشروع والمخرجات المطلوبة'
                    : '1. Project Overview & Expected Deliverables'}
                </span>
              </span>
              {openSections.overview ? (
                <ChevronUp className="w-4 h-4 text-[#6E6E73]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#6E6E73]" />
              )}
            </button>

            {openSections.overview && (
              <div className="space-y-4 pt-1 text-xs sm:text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                <p className="leading-relaxed text-[#515154] dark:text-[#D1D1D6]">
                  {analysis.executiveSummary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1E26]">
                    <div className="text-xs font-semibold text-[#0066CC] dark:text-[#60A5FA] mb-1">
                      {language === 'ar' ? 'هدف العميل الأساسي' : 'Primary Client Goal'}
                    </div>
                    <p className="text-xs leading-relaxed text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {analysis.clientGoal}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1E26]">
                    <div className="text-xs font-semibold text-[#515154] dark:text-[#A1A1A6] mb-1">
                      {language === 'ar' ? 'المشكلة المراد حلها' : 'Core Problem to Solve'}
                    </div>
                    <p className="text-xs leading-relaxed text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {analysis.businessProblem}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#6E6E73] mb-2">
                    {language === 'ar' ? 'المخرجات المتوقعة:' : 'Expected Deliverables:'}
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.deliverables.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F5F5F7]/70 dark:bg-[#1C1E26]/70 text-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#0066CC] dark:text-[#60A5FA] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Required Skills & Tech Stack */}
          <div className="p-5 sm:p-6 space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('skills')}
              className="w-full flex items-center justify-between text-right"
            >
              <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {language === 'ar'
                  ? '2. المهارات والتقنيات المطلوبة'
                  : '2. Required Skills & Technologies'}
              </span>
              {openSections.skills ? (
                <ChevronUp className="w-4 h-4 text-[#6E6E73]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#6E6E73]" />
              )}
            </button>

            {openSections.skills && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                <div className="space-y-1.5">
                  <div className="font-semibold text-[#6E6E73]">
                    {language === 'ar' ? 'مهارات أساسية:' : 'Essential Skills:'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.mandatorySkills.map((sk, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#F5F5F7] dark:bg-[#1C1E26] border border-[#E5E5EA] dark:border-[#262930] font-medium text-[#1D1D1F] dark:text-[#F5F5F7]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="font-semibold text-[#6E6E73]">
                    {language === 'ar' ? 'مهارات إضافية مفضلة:' : 'Optional / Preferred:'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(analysis.preferredSkills?.length
                      ? analysis.preferredSkills
                      : [language === 'ar' ? 'غير محددة' : 'None specified']
                    ).map((sk, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#F5F5F7] dark:bg-[#1C1E26] text-[#515154] dark:text-[#A1A1A6]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="font-semibold text-[#6E6E73]">
                    {language === 'ar' ? 'الأدوات وبيئة العمل:' : 'Tools & Tech Stack:'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.toolsAndStack.map((tool, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] dark:bg-[#1E293B] text-[#0066CC] dark:text-[#60A5FA] font-mono text-[11px]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Budget & Timeline (Honest Client Data vs Estimation) */}
          <div className="p-5 sm:p-6 space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('budget')}
              className="w-full flex items-center justify-between text-right"
            >
              <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {language === 'ar'
                  ? '3. الميزانية والجدول الزمني (بيانات العميل الصريحة)'
                  : '3. Budget & Timeline (Stated vs. Estimated)'}
              </span>
              {openSections.budget ? (
                <ChevronUp className="w-4 h-4 text-[#6E6E73]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#6E6E73]" />
              )}
            </button>

            {openSections.budget && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1E26] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6E6E73]">
                    <DollarSign className="w-3.5 h-3.5 text-[#0066CC] dark:text-[#60A5FA]" />
                    <span>
                      {language === 'ar'
                        ? 'الميزانية في نص العميل'
                        : 'Budget in Client Brief'}
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tabular-nums">
                    {analysis.explicitBudget}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1E26] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6E6E73]">
                    <Clock className="w-3.5 h-3.5 text-[#0066CC] dark:text-[#60A5FA]" />
                    <span>
                      {language === 'ar'
                        ? 'المدة الزمنية أو الموعد النهائي'
                        : 'Timeline / Deadline'}
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {analysis.explicitDeadline}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Complexity, Risks & Clarification Questions */}
          <div className="p-5 sm:p-6 space-y-4">
            <button
              type="button"
              onClick={() => toggleSection('risks')}
              className="w-full flex items-center justify-between text-right"
            >
              <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {language === 'ar'
                  ? `4. درجة التعقيد والمخاطر (${analysis.complexity})`
                  : `4. Complexity & Risks (${analysis.complexity})`}
              </span>
              {openSections.risks ? (
                <ChevronUp className="w-4 h-4 text-[#6E6E73]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#6E6E73]" />
              )}
            </button>

            {openSections.risks && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-[#B45309] dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>
                      {language === 'ar'
                        ? 'نقاط تحتاج انتباهاً لحماية النطاق:'
                        : 'Scope & Project Risks:'}
                    </span>
                  </div>
                  {analysis.risksAndRedFlags.map((risk, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#FFFBEB] dark:bg-amber-950/20 border border-[#FDE68A] dark:border-amber-800/40 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        <span>{risk.title}</span>
                        <span className="text-[11px] font-mono text-[#B45309] dark:text-amber-400">
                          {risk.severity === 'high'
                            ? language === 'ar'
                              ? 'أولوية عالية'
                              : 'High'
                            : language === 'ar'
                            ? 'متوسطة'
                            : 'Medium'}
                        </span>
                      </div>
                      <p className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">
                        {risk.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0066CC] dark:text-[#60A5FA] flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>
                        {language === 'ar'
                          ? 'أسئلة استيضاح مقترحة للعميل:'
                          : 'Clarification Questions for Client:'}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyClarifications}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0066CC] dark:text-[#60A5FA] hover:underline"
                    >
                      {copiedQuestions ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>{language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{language === 'ar' ? 'نسخ الأسئلة' : 'Copy questions'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {analysis.clientClarifications.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1E26] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed"
                      >
                        <span className="font-mono font-bold text-[#0066CC] dark:text-[#60A5FA] ml-1.5">
                          {idx + 1}.
                        </span>
                        {q}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: Freelancer Compatibility (Compared against Real User Profile) */}
          <div className="p-5 sm:p-6 space-y-4">
            <button
              type="button"
              onClick={() => toggleSection('compatibility')}
              className="w-full flex items-center justify-between text-right"
            >
              <span className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {language === 'ar'
                  ? '5. التوافق مع ملفك المهني ومهاراتك'
                  : '5. Freelancer Profile Compatibility'}
              </span>
              {openSections.compatibility ? (
                <ChevronUp className="w-4 h-4 text-[#6E6E73]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#6E6E73]" />
              )}
            </button>

            {openSections.compatibility && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pt-1">
                <div className="space-y-2 flex-1 text-xs">
                  {userProfile.skills.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-[#FFFBEB] dark:bg-amber-950/20 border border-[#FDE68A] dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {language === 'ar'
                            ? 'لم تقم بإضافة مهاراتك التفصيلية في ملفك المهني بعد'
                            : 'Your profile skills list is currently empty'}
                        </div>
                        <p className="text-[#515154] dark:text-[#A1A1A6]">
                          {language === 'ar'
                            ? 'تعتمد نسبة التوافق الحالية على مسماك المهني العام فقط. أضف مهاراتك وسيرتك الذاتية للحصول على مقارنة دقيقة.'
                            : 'Compatibility is currently estimated from your general title. Add your skills in My Profile for exact matching.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectView('profile')}
                        className="spring-btn px-3.5 py-2 rounded-xl bg-[#0066CC] text-white font-semibold whitespace-nowrap shrink-0"
                      >
                        {language === 'ar' ? 'إضافة مهاراتي الآن' : 'Update My Profile'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold text-[#6E6E73]">
                          {language === 'ar' ? 'نقاط القوة المتطابقة:' : 'Strong Matches:'}{' '}
                        </span>
                        <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">
                          {analysis.strongMatches.join(' · ')}
                        </span>
                      </div>
                      {analysis.missingSkills.length > 0 && (
                        <div>
                          <span className="font-semibold text-[#B45309] dark:text-amber-400">
                            {language === 'ar'
                              ? 'مهارات إضافية يفضل إبرازها في العرض:'
                              : 'Skills to highlight or address:'}{' '}
                          </span>
                          <span className="text-[#515154] dark:text-[#A1A1A6]">
                            {analysis.missingSkills.join(' · ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1E26] shrink-0">
                  <MatchRing
                    score={analysis.matchScore}
                    size={64}
                    strokeWidth={5}
                    label={language === 'ar' ? 'التوافق' : 'Match'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 6: Recommended Next Steps & Practical Actions */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {language === 'ar'
                ? '6. الخطوات العملية الموصى بها'
                : '6. Recommended Next Steps'}
            </div>

            <ul className="space-y-1.5 text-xs text-[#515154] dark:text-[#A1A1A6]">
              {analysis.recommendedNextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono font-bold text-[#0066CC] dark:text-[#60A5FA]">
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleGenerateTailoredProposal}
                className="spring-btn inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0066CC] hover:bg-[#0055B3] text-white text-xs font-semibold"
              >
                <FilePenLine className="w-4 h-4" />
                <span>
                  {language === 'ar'
                    ? 'توليد عرض مخصص لهذا المشروع'
                    : 'Generate tailored proposal'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleAskFollowUpInChat}
                className="spring-btn inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1E26] border border-[#E5E5EA] dark:border-[#262930] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:border-[#0066CC]"
              >
                <MessageSquareCode className="w-4 h-4 text-[#0066CC] dark:text-[#60A5FA]" />
                <span>
                  {language === 'ar'
                    ? 'مناقشة المشروع مع Lens AI'
                    : 'Ask Lens AI follow-up'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('profile')}
                className="spring-btn inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1E26] border border-[#E5E5EA] dark:border-[#262930] text-xs font-medium text-[#515154] dark:text-[#A1A1A6]"
              >
                <UserCheck className="w-4 h-4 text-[#0066CC] dark:text-[#60A5FA]" />
                <span>
                  {language === 'ar' ? 'مقارنة مع ملفي المهني' : 'Compare with profile'}
                </span>
              </button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Semantic HTML <hr> for thematic break between AI Composer and Workspace Summary */}
      <hr className="thematic-break" />

      {/* =====================================================================
          3. HONEST WORKSPACE SUMMARY & RECENT PROJECTS (Real Data Only)
         ===================================================================== */}
      <motion.section
        id="tour-metrics"
        data-tour-id="tour-metrics"
        variants={staggerItem}
        aria-label="المشاريع الأخيرة ونشاط مساحة العمل"
        className="scroll-reveal-block is-revealed space-y-4"
      >
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
            {language === 'ar'
              ? 'مشاريعك وتحليلاتك الأخيرة'
              : 'Recent Projects & Analyses'}
          </h2>

          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => onSelectView('saved-projects')}
              className="font-medium text-[#0066CC] dark:text-[#60A5FA] hover:underline flex items-center gap-1"
            >
              <span>
                {language === 'ar'
                  ? `عرض جميع المشاريع (${projects.length})`
                  : `View all projects (${projects.length})`}
              </span>
              <ArrowUpLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {projects.length === 0 && proposals.length === 0 ? (
          /* Clean, Honest Empty State with Liquid Glass Surface */
          <div className="p-8 rounded-[28px] liquid-glass text-center space-y-3">
            <div className="w-11 h-11 rounded-full apple-circle-glass flex items-center justify-center mx-auto">
              <FolderKanban className="w-5 h-5 text-[#007AFF] dark:text-[#60A5FA]" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-[#111827] dark:text-white">
                {language === 'ar' ? 'لا توجد مشاريع محفوظة بعد' : 'No projects yet'}
              </h3>
              <p className="text-xs text-[#374151] dark:text-[#CBD5E1] leading-relaxed">
                {language === 'ar'
                  ? 'ابدأ بلصق وصف مشروع عمل حر أو رفع مستند في مساحة العمل أعلاه لتحليله وحفظه في مسار مشاريعك.'
                  : 'Start by pasting a freelance project description or uploading a document above.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const sample = QUICK_SAMPLE_BRIEFS[0];
                  setProjectTitle(sample.title);
                  setPlatform(sample.platform);
                  setDescription(sample.text);
                  textareaRef.current?.focus();
                }}
                className="spring-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-full apple-capsule-bar text-xs font-semibold text-[#111827] dark:text-white"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
                <span>
                  {language === 'ar'
                    ? 'تجربة مثال مشروع جاهز'
                    : 'Load sample project'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('profile')}
                className="spring-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-full apple-capsule-bar text-xs font-semibold text-[#111827] dark:text-white"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
                <span>
                  {language === 'ar'
                    ? `إكمال الملف المهني (${completenessScore}%)`
                    : `Complete Profile (${completenessScore}%)`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('user-guide')}
                className="spring-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-full apple-capsule-bar text-xs font-semibold text-[#374151] dark:text-[#CBD5E1]"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
                <span>{language === 'ar' ? 'دليل الاستخدام' : 'User Guide'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Compact 4-Metric Summary Strip from Real Stored Data */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => onSelectView('saved-projects')}
                className="p-4 rounded-[24px] liquid-glass glass-card-hover text-right transition-all"
              >
                <div className="text-[11px] font-semibold text-[#5B6474] dark:text-[#94A3B8]">
                  {language === 'ar' ? 'إجمالي المشاريع' : 'Total Projects'}
                </div>
                <div className="font-mono text-lg font-bold text-[#111827] dark:text-white tabular-nums mt-0.5">
                  {dashboardMetrics.totalProjects}
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('saved-projects')}
                className="p-4 rounded-[24px] liquid-glass glass-card-hover text-right transition-all"
              >
                <div className="text-[11px] font-semibold text-[#5B6474] dark:text-[#94A3B8]">
                  {language === 'ar' ? 'مشاريع تم تحليلها' : 'Analyzed'}
                </div>
                <div className="font-mono text-lg font-bold text-[#007AFF] dark:text-[#60A5FA] tabular-nums mt-0.5">
                  {dashboardMetrics.projectsAnalyzed}
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('proposal-studio')}
                className="p-4 rounded-[24px] liquid-glass glass-card-hover text-right transition-all"
              >
                <div className="text-[11px] font-semibold text-[#5B6474] dark:text-[#94A3B8]">
                  {language === 'ar' ? 'العروض المحفوظة' : 'Proposals'}
                </div>
                <div className="font-mono text-lg font-bold text-[#111827] dark:text-white tabular-nums mt-0.5">
                  {proposals.length}
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('financials')}
                className="p-4 rounded-[24px] liquid-glass glass-card-hover text-right transition-all"
              >
                <div className="text-[11px] font-semibold text-[#5B6474] dark:text-[#94A3B8]">
                  {language === 'ar' ? 'الأرباح المسجلة' : 'Recorded Earnings'}
                </div>
                <div
                  dir="ltr"
                  className="font-mono text-lg font-bold text-[#111827] dark:text-white tabular-nums mt-0.5 text-right"
                >
                  ${dashboardMetrics.recordedEarnings.toLocaleString('en-US')}
                </div>
              </button>
            </div>

            {/* Clean List of Recent Real Projects in a Grouped Liquid Glass Container (Matches Image 2 grouped rows) */}
            <div className="rounded-[26px] liquid-glass divide-y divide-white/60 dark:divide-white/10 overflow-hidden">
              {projects.slice(0, 5).map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/40 dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#111827] dark:text-white truncate">
                        {proj.title}
                      </span>
                      <StatusBadge status={proj.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#5B6474] dark:text-[#94A3B8]">
                      <span>{proj.platform}</span>
                      <span>·</span>
                      <span className="font-mono">{proj.budget}</span>
                      <span>·</span>
                      <span>{proj.deadline}</span>
                      <span>·</span>
                      <span className="font-mono text-[#007AFF] dark:text-[#60A5FA] font-semibold">
                        {language === 'ar'
                          ? `توافق ${proj.matchScore}%`
                          : `${proj.matchScore}% match`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectForAction(proj);
                        setProjectTitle(proj.title);
                        setPlatform(proj.platform);
                        setDescription(proj.description);
                        if (proj.analysis) {
                          setAnalysis(proj.analysis);
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="spring-btn px-3.5 py-1.5 rounded-full apple-capsule-bar text-xs font-semibold text-[#111827] dark:text-white"
                    >
                      {language === 'ar' ? 'فتح في مساحة العمل' : 'Load in workspace'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProjectForAction(proj);
                        onSelectView('proposal-studio');
                      }}
                      className="spring-btn px-3.5 py-1.5 rounded-full bg-[#007AFF] text-white text-xs font-semibold shadow-xs"
                    >
                      {language === 'ar' ? 'عرض سعر' : 'Proposal'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.section>

      {/* Semantic HTML <hr> for thematic break before Sticky Stacking Cards */}
      <hr className="thematic-break" />

      {/* =====================================================================
          3B. STACKING STICKY WORKFLOW CARDS & DECORATIVE CSS BORDER-BLOCK-START
          Uses position: sticky with incrementally larger top offsets so each
          card pins and slides over the previous one during scroll.
         ===================================================================== */}
      <section
        id="tour-stack-cards"
        data-tour-id="tour-stack-cards"
        aria-label="Stacking AI Workflow Pipeline"
        className="scroll-reveal-block is-revealed space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-sm font-bold text-[#090E1A] dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#007AFF] dark:text-[#38BDF8]" />
              <span>
                {language === 'ar'
                  ? 'مراحل سير العمل الذكي المتراكبة (Sticky Workflow Stack)'
                  : 'Sticky AI Workflow Pipeline Cards'}
              </span>
            </h2>
            <p className="text-xs text-[#334155] dark:text-[#CBD5E1]">
              {language === 'ar'
                ? 'بطاقات زجاجية تلتصق تدريجياً أثناء التمرير لمراجعة التحليل، التسعير، والعرض المخصص'
                : 'Glassmorphic workflow cards with incremental sticky top offsets that stack smoothly as you scroll'}
            </p>
          </div>
        </div>

        <div className="relative space-y-4 pb-2">
          {[
            {
              step: '01',
              topOffset: '5.25rem',
              titleAr: '1. استخراج النطاق والمخاطر تلقائياً',
              titleEn: '1. Automated Scope & Risk Extraction',
              descAr:
                'يقوم محرك التحليل بفصل الحقائق المذكورة عن الميزانية المقترحة وتحديد البنود الغامضة في عقد العميل قبل بدء التنفيذ.',
              descEn:
                'Extracts explicit client requirements, identifies scope-creep triggers, and separates stated budget facts from AI recommendations.',
              actionLabelAr: 'فتح محلل المشاريع',
              actionLabelEn: 'Open Project Analyzer',
              targetView: 'project-analyzer' as ViewId,
            },
            {
              step: '02',
              topOffset: '6.5rem',
              titleAr: '2. هندسة التسعير ومراحل التسليم (Milestones)',
              titleEn: '2. Milestone & Pricing Architecture',
              descAr:
                'حساب التكلفة العادلة بناءً على تعقيد المخرجات ومعدلك بالساعة مع تقسيم الدفعات المالية لضمان التدفق النقدي.',
              descEn:
                'Calculates fair project pricing against your hourly rate and structures protected milestone payment schedules.',
              actionLabelAr: 'حاسبة التسعير الذكية',
              actionLabelEn: 'Open Pricing Calculator',
              targetView: 'pricing-calculator' as ViewId,
            },
            {
              step: '03',
              topOffset: '7.75rem',
              titleAr: '3. صياغة العرض الإقناعي المخصص',
              titleEn: '3. Persuasive Proposal Generation',
              descAr:
                'توليد عرض احترافي مخصص لمنصة العميل (Upwork / مستقل / عميل مباشر) مع أسئلة توضيحية جاهزة للنسخ.',
              descEn:
                'Generates platform-tailored proposals with ready-to-send client clarification questions and portfolio highlights.',
              actionLabelAr: 'استوديو العروض',
              actionLabelEn: 'Open Proposal Studio',
              targetView: 'proposal-studio' as ViewId,
            },
          ].map((card) => (
            <div
              key={card.step}
              data-testid={`sticky-stack-card-${card.step}`}
              style={{ position: 'sticky', top: card.topOffset }}
              className="rounded-[26px] glassmorphic-panel liquid-glass p-5 shadow-[0_20px_50px_rgba(15,23,42,0.18)] transition-transform duration-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-full bg-[#007AFF] text-white font-mono text-xs font-bold">
                    {card.step}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#090E1A] dark:text-white">
                    {language === 'ar' ? card.titleAr : card.titleEn}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectView(card.targetView)}
                  className="spring-btn px-3.5 py-1.5 rounded-full apple-capsule-bar text-xs font-bold text-[#007AFF] dark:text-[#38BDF8] flex items-center gap-1.5"
                >
                  <span>
                    {language === 'ar' ? card.actionLabelAr : card.actionLabelEn}
                  </span>
                  <ArrowUpLeft className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Purely decorative CSS line using border-block-start */}
              <div className="decorative-block-border mt-3 pt-3 text-xs sm:text-sm text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                {language === 'ar' ? card.descAr : card.descEn}
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="thematic-break" />

      {/* =====================================================================
          4. INTERACTIVE COOL GLASS MOTION & ATTACHED VIDEOS SHOWCASE
          Embeds the 4 user-attached Cool Glass videos directly with live triggers
         ===================================================================== */}
      <motion.section
        variants={staggerItem}
        aria-label="معرض حركات Cool Glass والدايناميك آيلاند التفاعلي"
        className="scroll-reveal-block is-revealed space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-sm font-bold text-[#090E1A] dark:text-white flex items-center gap-2">
              <SiriOrbIcon size="xs" status="idle" />
              <span>
                {language === 'ar'
                  ? 'أنماط Cool Glass والدايناميك آيلاند التفاعلية (Live Motion)'
                  : 'Interactive Cool Glass & Dynamic Island Showcase'}
              </span>
            </h2>
            <p className="text-xs text-[#334155] dark:text-[#CBD5E1]">
              {language === 'ar'
                ? 'شاهد الأنماط البصرية المدمجة أو اضغط على أي بطاقة لتجربة الحركة وتنفيذ المهام الصوتية فوراً'
                : 'Preview the integrated Cool Glass motion patterns or click any card to trigger it live'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const cmd =
                'ابحث لي عن عمل مناسب مثلاً لكتابة أو نسخ أو ترجمة محتوى';
              const intent = resolveVoiceAgentTaskIntent(cmd);
              onExecuteTaskIntent?.(intent, cmd);
            }}
            className="spring-btn px-3.5 py-1.5 rounded-full cool-glass-spotlight-bar text-xs font-bold text-white flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFB84D]" />
            <span>
              {language === 'ar'
                ? 'تجربة مهمة صوتية: بحث عن عمل كتابة وترجمة'
                : 'Test Voice Task: Find Writing & Translation Jobs'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            {
              id: 'vid-dynamic-island',
              titleAr: 'Dynamic Island & Siri Orb',
              titleEn: 'Dynamic Island & Siri Orb',
              descAr: 'تفاعل صوتي مباشر وبحث ذكي في أعلى الشاشة',
              descEn: 'Live top Dynamic Island with 3D Siri Orb',
              src: '/assets/aistudio/From_Klickpin.com-_Beautiful_bridal_shower_decor_ideas_that_are_worth_saving_if_you_love_elegant_details_and_creative_inspiration_for_busy_people_0b1ebd52.mp4',
              action: () => onOpenVoiceModal(),
            },
            {
              id: 'vid-thinking-pill',
              titleAr: 'Thinking · Searching · Planning',
              titleEn: 'Thinking · Searching · Planning',
              descAr: 'تحول سلس للزجاج المموج أثناء تنفيذ المهام',
              descEn: 'Multi-state aurora & fluted glass morphing',
              src: '/assets/aistudio/From_Klickpin.com-_Chic_tailoring_ideas_that_fit_modern_everyday_life_with_easy_charm_to_organize_your_craft_table-pin-id-606297168634589318_0a12ce78.mp4',
              action: () => {
                const cmd =
                  'ابحث لي عن عمل مناسب مثلاً لكتابة أو نسخ أو ترجمة محتوى';
                const intent = resolveVoiceAgentTaskIntent(cmd);
                onExecuteTaskIntent?.(intent, cmd);
              },
            },
            {
              id: 'vid-work-sleep',
              titleAr: 'Work / Sleep Refractive Lens',
              titleEn: 'Work / Sleep Refractive Lens',
              descAr: 'عدسة زجاجية منزلقة للتبديل بين العمل والراحة',
              descEn: 'Sliding crystal lens switch for Work & Sleep',
              src: '/assets/aistudio/From_Klickpin.com-_Recreate_this_clever_reception_ideas_roundup_youll_want_to_recreate_this_weekend_with_aesthetic_touches_that_photograph_beautif_fff77936.mp4',
              action: () =>
                setWorkSleepMode((prev) => (prev === 'work' ? 'sleep' : 'work')),
            },
            {
              id: 'vid-cool-capsule',
              titleAr: 'Cool Glass Capsule (+ O □)',
              titleEn: 'Cool Glass Capsule (+ O □)',
              descAr: 'انكسار الضوء الديناميكي على حواف الكبسولة الزجاجية',
              descEn: 'Dynamic edge refraction on smoked Cool Glass',
              src: '/assets/aistudio/From_Klickpin.com-_Must-Try_DIY_Gift_Ideas_for_a_Cozy_Vibe-pin-id-816629344971849642_70c4e39a.mp4',
              action: () =>
                onOpenCommandPalette
                  ? onOpenCommandPalette()
                  : onSelectView('opportunities'),
            },
          ].map((vid) => (
            <div
              key={vid.id}
              onClick={vid.action}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  vid.action();
                }
              }}
              className="group relative rounded-[24px] cool-glass-bento-widget overflow-hidden cursor-pointer glass-card-hover flex flex-col justify-between"
            >
              <div className="relative h-36 w-full bg-black/60 overflow-hidden">
                <video
                  src={vid.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-[10px] font-mono text-[#FDE68A]">
                  Cool Glass
                </span>
              </div>
              <div className="p-3.5 space-y-1">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{language === 'ar' ? vid.titleAr : vid.titleEn}</span>
                  <ArrowUpLeft className="w-3.5 h-3.5 text-[#FDE68A]" />
                </div>
                <p className="text-[11px] text-white/75 leading-snug">
                  {language === 'ar' ? vid.descAr : vid.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
};

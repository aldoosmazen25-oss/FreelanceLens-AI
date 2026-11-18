import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  ScanSearch,
  Mic,
  MicOff,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  FilePenLine,
  BookmarkPlus,
  Volume2,
  HelpCircle,
  Layers,
  Clock,
  DollarSign,
  Square,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { MatchRing } from '../components/common/MatchRing';
import { useData } from '../context/DataContext';
import { ProjectAnalysisResult, ViewId } from '../types';
import { useMotionSystem } from '../utils/motionVariants';

interface ProjectAnalyzerViewProps {
  onSelectView: (view: ViewId) => void;
}

export const ProjectAnalyzerView: React.FC<ProjectAnalyzerViewProps> = ({
  onSelectView,
}) => {
  const {
    userProfile,
    selectedProjectForAction,
    setSelectedProjectForAction,
    saveProject,
    addNotification,
  } = useData();
  const { staggerContainer, staggerItem } = useMotionSystem();

  const [title, setTitle] = useState<string>(
    selectedProjectForAction?.title ||
      'تطوير بوابة SaaS لتحليل العقود الذكية وأتمتة تقارير العملاء'
  );
  const [platform, setPlatform] = useState<string>(
    selectedProjectForAction?.platform || 'Upwork'
  );
  const [description, setDescription] = useState<string>(
    selectedProjectForAction?.description ||
      'نبحث عن مهندس برمجيات خبير لبناء منصة ويب متكاملة تساعد الشركات الاستشارية على مراجعة مسودات العقود، كشف بنود الخطر وتمدد النطاق، وتوليد ملخصات تنفيذية فورية باللغة العربية والإنجليزية. الميزانية التقديرية $3,500 - $4,500 والمدة المطلوبة 4 أسابيع عمل مع إمكانية إضافة تحسينات إضافية حسب الحاجة.'
  );
  const [useHighThinking, setUseHighThinking] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [savedBanner, setSavedBanner] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<ProjectAnalysisResult | null>(
    selectedProjectForAction?.analysis || null
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (selectedProjectForAction) {
      setTitle(selectedProjectForAction.title);
      setPlatform(selectedProjectForAction.platform);
      setDescription(selectedProjectForAction.description);
      if (selectedProjectForAction.analysis) {
        setAnalysis(selectedProjectForAction.analysis);
      }
    }
  }, [selectedProjectForAction]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleVoiceDictation = () => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setDescription(
        (prev) =>
          prev +
          '\n[إملاء صوتي]: يشمل المشروع بناء لوحة تحكم تفاعلية مع ربط كامل بواجهات الذكاء الاصطناعي وتسليم خلال ثلاثة أسابيع.'
      );
      return;
    }

    if (isDictating) {
      setIsDictating(false);
      return;
    }

    setIsDictating(true);
    const rec = new SpeechRec();
    rec.lang = 'ar-SA';
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
    setAnalysisError('تم إلغاء عملية التحليل بناءً على طلبك. يمكنك إعادة المحاولة في أي وقت.');
  };

  const runAnalysisRequest = async () => {
    if (!title.trim() || !description.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setSavedBanner(false);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/gemini/analyze-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          title,
          description,
          platform,
          userProfile,
          useHighThinking,
          modelChoice: useHighThinking ? 'deep' : 'balanced',
        }),
      });
      if (!res.ok) {
        throw new Error('Analysis request failed');
      }
      const data: ProjectAnalysisResult = await res.json();
      setAnalysis(data);
      addNotification({
        title: 'اكتمل تحليل المشروع بنجاح',
        message: `نسبة التوافق المحسوبة: ${data.matchScore}% — تم استخراج المخرجات والمخاطر.`,
        type: 'success',
      });
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setAnalysisError('تعذر إتمام التحليل في الوقت الحالي. يرجى الضغط على إعادة المحاولة.');
        addNotification({
          title: 'تعذر إتمام التحليل',
          message: 'يرجى التحقق من المدخلات والمحاولة مرة أخرى.',
          type: 'error',
        });
      }
    } finally {
      abortControllerRef.current = null;
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await runAnalysisRequest();
  };

  const handleSaveAnalyzedProject = async () => {
    if (!title.trim()) return;
    const saved = await saveProject({
      id: selectedProjectForAction?.id,
      title,
      description,
      platform,
      budget: analysis?.explicitBudget || '$3,500',
      deadline: analysis?.explicitDeadline || '4 أسابيع',
      matchScore: analysis?.matchScore || 90,
      status: 'analyzed',
      analysis: analysis || undefined,
    });
    setSelectedProjectForAction(saved);
    setSavedBanner(true);
    addNotification({
      title: 'تم حفظ المشروع المحلل في مسارك',
      message: `تمت إضافة "${title}" بنجاح مع درجة توافق ${saved.matchScore}%.`,
      type: 'success',
      targetView: 'saved-projects',
    });
  };

  const handleListenSummary = async () => {
    if (!analysis) return;
    setIsSpeaking(true);
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${analysis.executiveSummary}. هدف العميل: ${analysis.clientGoal}. نسبة التوافق مع ملفك: ${analysis.matchScore} بالمئة.`,
          voiceName: 'Kore',
        }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
      } else if ('speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(analysis.executiveSummary);
        utt.lang = 'ar-SA';
        utt.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utt);
      } else {
        setIsSpeaking(false);
      }
    } catch {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form Card */}
      <GlassCard hoverable={false} className="p-6">
        <form onSubmit={handleAnalyzeProject} className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-[#effaf4]">
                محلل المشاريع المتقدم وكاشف مخاطر النطاق (Scope Creep Radar)
              </h2>
              <p className="text-xs text-[#a4c2b4] mt-1">
                أدخل تفاصيل مشروع العميل لاستخراج الحقائق الصريحة، المخرجات، الأعلام الحمراء، ونسبة التوافق مع مهاراتك
              </p>
            </div>

            {/* Deep Reasoning Mode Toggle */}
            <label className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-[#62d9ff]/30 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={useHighThinking}
                onChange={(e) => setUseHighThinking(e.target.checked)}
                className="accent-[#62d9ff]"
              />
              <BrainCircuit className="w-4 h-4 text-[#62d9ff]" />
              <span className="text-xs font-semibold text-[#effaf4]">
                استدلال وتفكير عميق (Deep Reasoning)
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label
                htmlFor="project-title-input"
                className="block text-xs font-medium text-[#a4c2b4]"
              >
                عنوان المشروع
              </label>
              <input
                id="project-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: تطوير منصة SaaS لإدارة العقود الذكية..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-[#effaf4] placeholder-[#6c8a7d] focus:outline-none focus:border-[#2be38a]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="project-platform-select"
                className="block text-xs font-medium text-[#a4c2b4]"
              >
                منصة العمل الحر
              </label>
              <select
                id="project-platform-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-[#effaf4] focus:outline-none focus:border-[#2be38a]"
              >
                <option value="Upwork" className="bg-[#030706]">Upwork</option>
                <option value="Fiverr Pro" className="bg-[#030706]">Fiverr Pro</option>
                <option value="Freelancer.com" className="bg-[#030706]">Freelancer.com</option>
                <option value="مشروع مباشر" className="bg-[#030706]">مشروع مباشر (Direct Client)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="project-desc-textarea"
                className="block text-xs font-medium text-[#a4c2b4]"
              >
                وصف المشروع الصريح ومتطلبات العميل
              </label>
              <button
                type="button"
                onClick={handleVoiceDictation}
                className={`spring-btn flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isDictating
                    ? 'bg-[#ff6b7f] text-[#020504]'
                    : 'bg-white/[0.06] text-[#2be38a] hover:bg-white/[0.12]'
                }`}
              >
                {isDictating ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>جاري الإملاء الصوتي...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>إملاء صوتي للوصف</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              id="project-desc-textarea"
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="الصق تفاصيل المشروع أو رسالة العميل هنا لتحليلها بالكامل..."
              className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-[#effaf4] placeholder-[#6c8a7d] focus:outline-none focus:border-[#2be38a] leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-[#6c8a7d]">
              يقارن المحلل المتطلبات مع مهاراتك ({userProfile.skills.length} مهارة معتمدة) وسعر ساعتك (${userProfile.hourlyRate}/hr)
            </div>
            <div className="flex items-center gap-2">
              {isAnalyzing && (
                <button
                  type="button"
                  onClick={handleCancelAnalysis}
                  className="spring-btn flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#ff6b7f]/15 hover:bg-[#ff6b7f]/25 border border-[#ff6b7f]/40 text-xs font-bold text-[#ff6b7f]"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>إلغاء التحليل</span>
                </button>
              )}
              <button
                type="submit"
                disabled={isAnalyzing}
                className="spring-btn flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2be38a] to-[#62d9ff] text-[#020504] font-bold text-sm hover:brightness-110 transition-all shadow-[0_0_25px_rgba(43,227,138,0.3)] disabled:opacity-50"
              >
                <ScanSearch className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>
                  {isAnalyzing
                    ? 'جاري التحليل الاستخباراتي العميق...'
                    : 'بدء التحليل الاستخباراتي'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </GlassCard>

      {/* Error / Cancelled Retry Banner */}
      {analysisError && !isAnalyzing && (
        <GlassCard variant="danger" hoverable={false} className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-[#effaf4]">
            <AlertCircle className="w-4 h-4 text-[#ff6b7f] shrink-0" />
            <span>{analysisError}</span>
          </div>
          <button
            type="button"
            onClick={runAnalysisRequest}
            className="spring-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2be38a] text-[#020504] font-bold text-xs shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة الآن</span>
          </button>
        </GlassCard>
      )}

      {/* Real Loading & Step Progress State (No Fabricated Percentage Bar) */}
      {isAnalyzing && (
        <GlassCard hoverable={false} className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl border-2 border-[#2be38a] border-t-transparent animate-spin shrink-0" />
              <div>
                <div className="text-sm font-bold text-[#effaf4]">
                  يقوم محرك الاستخبارات بتفكيك بنود المشروع وكشف مخاطر تمدد النطاق...
                </div>
                <p className="text-xs text-[#a4c2b4] mt-0.5">
                  وضع النموذج النشط: {useHighThinking ? 'استدلال وتفكير عميق' : 'متوازن ودقيق'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancelAnalysis}
              className="spring-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-[#ff6b7f]/20 text-xs text-[#ff6b7f]"
            >
              <Square className="w-3.5 h-3.5" />
              <span>إيقاف</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl skeleton-shimmer border border-white/10 space-y-2">
              <div className="h-3 w-1/2 rounded bg-white/20" />
              <div className="h-2.5 w-4/5 rounded bg-white/10" />
            </div>
            <div className="p-3.5 rounded-2xl skeleton-shimmer border border-white/10 space-y-2">
              <div className="h-3 w-2/3 rounded bg-white/20" />
              <div className="h-2.5 w-3/4 rounded bg-white/10" />
            </div>
            <div className="p-3.5 rounded-2xl skeleton-shimmer border border-white/10 space-y-2">
              <div className="h-3 w-1/2 rounded bg-white/20" />
              <div className="h-2.5 w-5/6 rounded bg-white/10" />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Analysis Report Output — Progressive Staggered Sequence (Section 24.H) */}
      {analysis && !isAnalyzing && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Top Summary & MatchRing Card */}
          <motion.div variants={staggerItem}>
            <GlassCard variant="hot" hoverable={false} className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#2be38a]">
                    <span>تقرير الاستخبارات التنفيذي</span>
                    <span aria-hidden="true">·</span>
                    <span>الوضع: {analysis.modelMode || 'استدلال وتفكير عميق'}</span>
                    <span aria-hidden="true">·</span>
                    <span>درجة التعقيد المقدرة: {analysis.complexity}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#effaf4]">
                    {analysis.executiveSummary}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/10">
                      <div className="text-xs font-semibold text-[#62d9ff] mb-1">
                        هدف العميل الأساسي
                      </div>
                      <p className="text-xs text-[#effaf4] leading-relaxed">
                        {analysis.clientGoal}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/30 border border-white/10">
                      <div className="text-xs font-semibold text-[#ffc15a] mb-1">
                        مشكلة العمل الجذرية
                      </div>
                      <p className="text-xs text-[#effaf4] leading-relaxed">
                        {analysis.businessProblem}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/10 shrink-0">
                  <MatchRing
                    score={analysis.matchScore}
                    size={84}
                    strokeWidth={6}
                    label="نسبة التوافق الكلية"
                  />
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleListenSummary}
                      className="spring-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-[#effaf4]"
                    >
                      <Volume2
                        className={`w-3.5 h-3.5 ${
                          isSpeaking ? 'text-[#2be38a] animate-pulse' : 'text-[#62d9ff]'
                        }`}
                      />
                      <span>{isSpeaking ? 'يقرأ الآن...' : 'استماع للتقرير'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAnalyzedProject}
                      className="spring-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-xs font-semibold text-[#2be38a]"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>حفظ المشروع في المسار</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await handleSaveAnalyzedProject();
                        onSelectView('proposal-studio');
                      }}
                      className="spring-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2be38a] text-[#020504] font-bold text-xs hover:brightness-110"
                    >
                      <FilePenLine className="w-3.5 h-3.5" />
                      <span>توليد العرض التنافسي</span>
                    </button>
                  </div>
                </div>
              </div>
              {savedBanner && (
                <div className="mt-4 px-4 py-2.5 rounded-xl bg-[#2be38a]/15 border border-[#2be38a]/40 text-xs text-[#2be38a] flex items-center justify-between">
                  <span>
                    تم حفظ المشروع وتحديث حالته إلى "تم التحليل بـ AI" في لوحة كانبان.
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectView('saved-projects')}
                    className="underline font-semibold"
                  >
                    عرض في المسار
                  </button>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Budget, Deadline, Deliverables & Skills Comparison */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <GlassCard className="p-5 space-y-4">
              <h4 className="text-sm font-bold text-[#effaf4] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#2be38a]" />
                <span>حقائق العميل الصريحة مقابل التقدير</span>
              </h4>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between text-[11px] text-[#a4c2b4]">
                    <span>الميزانية المصرح بها نصاً</span>
                    <span className="text-[10px] text-[#2be38a]">نص العميل</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-[#2be38a] mt-1 tabular-nums">
                    {analysis.explicitBudget}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between text-[11px] text-[#a4c2b4]">
                    <span>الموعد النهائي للتسليم</span>
                    <span className="text-[10px] text-[#62d9ff]">نص العميل</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-[#62d9ff] mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{analysis.explicitDeadline}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-[11px] text-[#a4c2b4]">
                    الأدوات والتقنيات المستنتجة
                  </div>
                  <div className="text-xs text-[#effaf4] mt-1 font-mono">
                    {analysis.toolsAndStack.join(' · ')}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5 space-y-4">
              <h4 className="text-sm font-bold text-[#effaf4] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#62d9ff]" />
                <span>المخرجات المتوقعة (Deliverables)</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-[#effaf4]">
                {analysis.deliverables.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#2be38a] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-5 space-y-4">
              <h4 className="text-sm font-bold text-[#effaf4]">
                مصفوفة تطابق مهاراتك مع العميل
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[#2be38a] font-semibold mb-1">
                    نقاط تطابق قوية في ملفك:
                  </div>
                  <div className="text-[#effaf4] leading-relaxed">
                    {analysis.strongMatches.join(' · ') ||
                      'تطابق شامل مع التقنيات الأساسية'}
                  </div>
                </div>
                <div>
                  <div className="text-[#a4c2b4] font-semibold mb-1">
                    المهارات الإلزامية في المشروع:
                  </div>
                  <div className="text-[#effaf4]">
                    {analysis.mandatorySkills.join(' · ')}
                  </div>
                </div>
                {analysis.preferredSkills && analysis.preferredSkills.length > 0 && (
                  <div>
                    <div className="text-[#62d9ff] font-semibold mb-1">
                      مهارات مفضلة إضافية:
                    </div>
                    <div className="text-[#a4c2b4]">
                      {analysis.preferredSkills.join(' · ')}
                    </div>
                  </div>
                )}
                {analysis.missingSkills.length > 0 && (
                  <div>
                    <div className="text-[#ffc15a] font-semibold mb-1">
                      مهارات يفضل إبرازها في العرض:
                    </div>
                    <div className="text-[#a4c2b4]">
                      {analysis.missingSkills.join(' · ')}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Risks & Red Flags + Client Clarifications */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <GlassCard
              variant="danger"
              className="p-5 space-y-4 border-[#ff6b7f]/30"
            >
              <h4 className="text-sm font-bold text-[#ff6b7f] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>المخاطر والأعلام الحمراء (Red Flags & Scope Creep)</span>
              </h4>
              <div className="space-y-3">
                {analysis.risksAndRedFlags.map((risk, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#ff6b7f]/[0.06] border border-[#ff6b7f]/30 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#effaf4]">
                        {risk.title}
                      </span>
                      <span className="text-[11px] font-mono text-[#ff6b7f]">
                        خطورة: {risk.severity === 'high' ? 'مرتفعة' : 'متوسطة'}
                      </span>
                    </div>
                    <p className="text-xs text-[#a4c2b4] leading-relaxed">
                      {risk.description}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5 space-y-4">
              <h4 className="text-sm font-bold text-[#62d9ff] flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>أسئلة استكشافية مقترحة للعميل والخطوات التالية</span>
              </h4>
              <div className="space-y-2.5">
                {analysis.clientClarifications.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#effaf4] leading-relaxed"
                  >
                    <span className="font-mono text-[#62d9ff] ml-1.5">
                      س{idx + 1}:
                    </span>
                    {q}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="text-xs font-semibold text-[#2be38a] mb-1.5">
                  الخطوات التكتيكية الموصى بها:
                </div>
                <ul className="space-y-1 text-xs text-[#a4c2b4]">
                  {analysis.recommendedNextSteps.map((step, i) => (
                    <li key={i}>• {step}</li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

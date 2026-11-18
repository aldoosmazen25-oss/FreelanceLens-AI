import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  FilePenLine,
  Copy,
  Check,
  Download,
  Kanban,
  Volume2,
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { useData } from '../context/DataContext';
import { ViewId } from '../types';
import { useMotionSystem, EASE_OUT_EXPO } from '../utils/motionVariants';

interface ProposalStudioViewProps {
  onSelectView: (view: ViewId) => void;
}

const TONES = [
  'احترافي ودود',
  'مباشر وموجز',
  'استشاري موثوق',
  'تقني متطور',
];

const LENGTHS = [
  { id: 'short', label: 'موجز ومباشر' },
  { id: 'medium', label: 'قياسي متوازن' },
  { id: 'detailed', label: 'مفصل وشامل' },
];

export const ProposalStudioView: React.FC<ProposalStudioViewProps> = ({
  onSelectView,
}) => {
  const {
    projects,
    userProfile,
    selectedProjectForAction,
    saveProposal,
    updateProjectStatus,
    addNotification,
  } = useData();
  const { staggerContainer, staggerItem, reducedMotion } = useMotionSystem();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    selectedProjectForAction?.id || projects[0]?.id || 'custom'
  );
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDesc, setCustomDesc] = useState<string>('');
  const [tone, setTone] = useState<string>('استشاري موثوق');
  const [lengthMode, setLengthMode] = useState<string>('medium');
  const [budget, setBudget] = useState<string>(
    selectedProjectForAction?.budget || projects[0]?.budget || '$3,200'
  );
  const [duration, setDuration] = useState<string>(
    selectedProjectForAction?.deadline || projects[0]?.deadline || '3 أسابيع'
  );
  const [notes, setNotes] = useState<string>(
    'التركيز على حماية النطاق وتقسيم العمل إلى 3 مراحل تسليم واضحة.'
  );

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [statusUpdated, setStatusUpdated] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isEditorExpanded, setIsEditorExpanded] = useState<boolean>(false);

  const [generated, setGenerated] = useState<{
    hook: string;
    problemDiagnosis: string;
    proposedRoadmap: string[];
    outOfScope: string;
    callToAction: string;
    fullProposal: string;
    persuasionScore: number;
    modelMode?: string;
  } | null>(null);

  const activeProject =
    selectedProjectId === 'custom'
      ? {
          id: 'custom',
          title: customTitle || 'مشروع تطوير منصة رقمية متكاملة',
          description:
            customDesc || 'بناء تطبيق ويب سحابي مع لوحة تحكم وتكامل ذكاء اصطناعي.',
        }
      : projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleGenerateProposal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating) return;

    setIsGenerating(true);
    setStatusUpdated(false);
    try {
      const lengthLabel =
        LENGTHS.find((l) => l.id === lengthMode)?.label || 'قياسي متوازن';
      const res = await fetch('/api/gemini/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: activeProject,
          userProfile,
          budget,
          duration,
          tone: `${tone} (${lengthLabel})`,
          notes,
        }),
      });
      if (!res.ok) {
        throw new Error('Generation failed');
      }
      const data = await res.json();
      setGenerated(data);

      await saveProposal({
        projectId: activeProject?.id || 'custom',
        projectTitle: activeProject?.title || 'مشروع جديد',
        tone,
        proposedBudget: budget,
        duration,
        hook: data.hook,
        problemDiagnosis: data.problemDiagnosis,
        proposedRoadmap: data.proposedRoadmap || [],
        outOfScope: data.outOfScope,
        callToAction: data.callToAction,
        fullText: data.fullProposal,
        persuasionScore: data.persuasionScore || 94,
        status: 'sent',
        modelMode: data.modelMode,
      });

      addNotification({
        title: 'تم هندسة العرض التنافسي بنجاح',
        message: `تم صياغة عرض بنبرة "${tone}" وحفظه في سجل العروض.`,
        type: 'success',
      });
    } catch {
      // Preserve existing text when regeneration fails (Section 24.I)
      addNotification({
        title: 'تعذر توليد نسخة جديدة حالياً',
        message: generated
          ? 'تم الاحتفاظ بنص عرضك الحالي دون أي فقدان للبيانات.'
          : 'يرجى المحاولة مرة أخرى.',
        type: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const wordCount = generated?.fullProposal
    ? generated.fullProposal.trim().split(/\s+/).length
    : 0;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 160));

  const handleCopy = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated.fullProposal);
      setCopied(true);
      addNotification({
        title: 'تم نسخ العرض التنافسي للحافظة',
        message: 'النص الكامل جاهز للصق فوراً في منصة العمل الحر.',
        type: 'success',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addNotification({
        title: 'تعذر النسخ التلقائي',
        message: 'يرجى تحديد النص ونسخه يدوياً.',
        type: 'warning',
      });
    }
  };

  const handleDownloadTxt = () => {
    if (!generated) return;
    const blob = new Blob([generated.fullProposal], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMarkProjectProposed = async () => {
    if (activeProject && activeProject.id !== 'custom') {
      await updateProjectStatus(activeProject.id, 'proposed');
      setStatusUpdated(true);
      addNotification({
        title: 'تم تحديث حالة المشروع في كانبان',
        message: `تم نقل "${activeProject.title}" إلى عمود "تم تقديم العرض".`,
        type: 'success',
        targetView: 'saved-projects',
      });
    }
  };

  const handleListenProposal = async () => {
    if (!generated) return;
    setIsSpeaking(true);
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${generated.hook} ${generated.problemDiagnosis} ${generated.callToAction}`,
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Configuration Panel */}
        <GlassCard hoverable={false} className="lg:col-span-5 p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#effaf4]">
              مختبر صياغة العروض التنافسية (Proposal Studio)
            </h2>
            <p className="text-xs text-[#a4c2b4] mt-0.5">
              صمم عرضاً استراتيجياً مقسماً إلى خطاف، تشخيص، خارطة طريق، وحدود نطاق واضحة
            </p>
          </div>

          <form onSubmit={handleGenerateProposal} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="proposal-project-select"
                className="block text-xs font-medium text-[#a4c2b4]"
              >
                اختر مشروعاً محفوظاً أو مشروعاً جديداً
              </label>
              <select
                id="proposal-project-select"
                value={selectedProjectId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedProjectId(id);
                  const found = projects.find((p) => p.id === id);
                  if (found) {
                    setBudget(found.budget);
                    setDuration(found.deadline);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4] focus:outline-none focus:border-[#2be38a]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#030706]">
                    {p.title} ({p.budget})
                  </option>
                ))}
                <option value="custom" className="bg-[#030706]">
                  + إنشاء عرض لمشروع مخصص جديد
                </option>
              </select>
            </div>

            <AnimatePresence initial={false}>
              {selectedProjectId === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="عنوان المشروع الجديد..."
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-[#effaf4]"
                    />
                    <textarea
                      rows={3}
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      placeholder="ملخص متطلبات العميل..."
                      className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-xs text-[#effaf4]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tone Selector with Smooth Active Pill Transition */}
            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-[#a4c2b4]">
                النبرة الاستراتيجية للعرض
              </span>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((tItem) => {
                  const isSelected = tone === tItem;
                  return (
                    <button
                      key={tItem}
                      type="button"
                      onClick={() => setTone(tItem)}
                      className={`spring-btn relative px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-[#2be38a]/20 border-[#2be38a] text-[#effaf4] font-bold'
                          : 'bg-white/[0.03] border-white/10 text-[#a4c2b4] hover:text-[#effaf4]'
                      }`}
                    >
                      {tItem}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Length Selector */}
            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-[#a4c2b4]">
                طول وتفصيل العرض
              </span>
              <div className="grid grid-cols-3 gap-2">
                {LENGTHS.map((lItem) => {
                  const isSelected = lengthMode === lItem.id;
                  return (
                    <button
                      key={lItem.id}
                      type="button"
                      onClick={() => setLengthMode(lItem.id)}
                      className={`spring-btn px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-colors ${
                        isSelected
                          ? 'bg-[#62d9ff]/20 border-[#62d9ff] text-[#effaf4] font-bold'
                          : 'bg-white/[0.03] border-white/10 text-[#a4c2b4] hover:text-[#effaf4]'
                      }`}
                    >
                      {lItem.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="proposal-budget-input"
                  className="block text-xs font-medium text-[#a4c2b4]"
                >
                  الميزانية المقترحة
                </label>
                <input
                  id="proposal-budget-input"
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs text-[#effaf4]"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="proposal-duration-input"
                  className="block text-xs font-medium text-[#a4c2b4]"
                >
                  مدة التنفيذ
                </label>
                <input
                  id="proposal-duration-input"
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="proposal-notes-input"
                className="block text-xs font-medium text-[#a4c2b4]"
              >
                نقاط قوة خاصة أو شروط تود إبرازها
              </label>
              <textarea
                id="proposal-notes-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4]"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="spring-btn w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#62d9ff] to-[#1f7bff] text-[#effaf4] font-bold text-xs hover:brightness-110 transition-all shadow-[0_0_25px_rgba(98,217,255,0.25)] disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>
                {isGenerating
                  ? 'جاري هندسة العرض التنافسي...'
                  : generated
                  ? 'إعادة توليد بنبرة أو طول مختلف'
                  : 'توليد العرض التنافسي الآن'}
              </span>
            </button>
          </form>
        </GlassCard>

        {/* Generated Proposal Output */}
        <div className="lg:col-span-7 space-y-4">
          {!generated ? (
            <GlassCard hoverable={false} className="p-10 text-center space-y-3">
              <FilePenLine
                className={`w-10 h-10 text-[#62d9ff] mx-auto ${
                  isGenerating ? 'animate-pulse' : ''
                }`}
              />
              <div className="text-base font-bold text-[#effaf4]">
                {isGenerating
                  ? 'يقوم Lens AI بصياغة عرضك التنافسي المهيكل...'
                  : 'جاهز لصياغة عرضك التنافسي المهيكل'}
              </div>
              <p className="text-xs text-[#a4c2b4] max-w-md mx-auto leading-relaxed">
                اختر المشروع والنبرة الاستراتيجية ثم اضغط على "توليد العرض التنافسي الآن" للحصول على خطاف افتتاحي، تشخيص للمشكلة، خارطة طريق مرحلية، وبند حماية النطاق.
              </p>
            </GlassCard>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <GlassCard
                variant="hot"
                hoverable={false}
                className={`p-6 space-y-5 transition-opacity duration-200 ${
                  isGenerating ? 'opacity-75' : 'opacity-100'
                }`}
              >
                {/* Quick Stats Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3 text-xs text-[#a4c2b4]">
                    <span>
                      عدد الكلمات:{' '}
                      <strong className="font-mono text-[#effaf4] tabular-nums">
                        {wordCount}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      زمن القراءة:{' '}
                      <strong className="font-mono text-[#effaf4] tabular-nums">
                        {readingTimeMin} دقيقة
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      نسبة الإقناع:{' '}
                      <strong className="font-mono text-[#2be38a] tabular-nums">
                        {generated.persuasionScore}%
                      </strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleGenerateProposal()}
                      className="spring-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-[#effaf4] disabled:opacity-50"
                    >
                      <RotateCcw
                        className={`w-3.5 h-3.5 text-[#2be38a] ${
                          isGenerating ? 'animate-spin' : ''
                        }`}
                      />
                      <span>إعادة توليد</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleListenProposal}
                      className="spring-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-[#effaf4]"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#62d9ff]" />
                      <span>{isSpeaking ? 'يقرأ صوتياً...' : 'استماع'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="spring-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-[#effaf4]"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#2be38a]" />
                          <span className="text-[#2be38a] font-bold">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ للحافظة</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadTxt}
                      className="spring-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-[#effaf4]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل نصي</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleMarkProjectProposed}
                      className="spring-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2be38a] text-[#020504] font-bold text-xs hover:brightness-110"
                    >
                      <Kanban className="w-3.5 h-3.5" />
                      <span>تحديث الحالة إلى "تم تقديم العرض"</span>
                    </button>
                  </div>
                </div>

                {statusUpdated && (
                  <div className="px-4 py-2 rounded-xl bg-[#2be38a]/15 border border-[#2be38a]/40 text-xs text-[#2be38a] flex items-center justify-between">
                    <span>
                      تم تحديث حالة المشروع في لوحة كانبان إلى "تم تقديم العرض".
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectView('saved-projects')}
                      className="underline font-semibold"
                    >
                      الانتقال لكانبان
                    </button>
                  </div>
                )}

                {/* 5 Structured Proposal Cards */}
                <motion.div variants={staggerItem} className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-1">
                    <div className="font-bold text-[#2be38a]">
                      1. الخطاف الافتتاحي (The Hook)
                    </div>
                    <p className="text-[#effaf4] leading-relaxed">
                      {generated.hook}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-1">
                    <div className="font-bold text-[#62d9ff]">
                      2. تشخيص المشكلة (Problem Diagnosis)
                    </div>
                    <p className="text-[#effaf4] leading-relaxed">
                      {generated.problemDiagnosis}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-1.5">
                    <div className="font-bold text-[#2be38a]">
                      3. خارطة الطريق ومراحل التسليم (Milestones)
                    </div>
                    <ul className="space-y-1 text-[#effaf4]">
                      {generated.proposedRoadmap.map((step, i) => (
                        <li key={i}>• {step}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/30 border border-[#ffc15a]/30 space-y-1">
                    <div className="font-bold text-[#ffc15a]">
                      4. خارج النطاق لحماية وقتك (Out of Scope Guard)
                    </div>
                    <p className="text-[#effaf4] leading-relaxed">
                      {generated.outOfScope}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/10 space-y-1">
                    <div className="font-bold text-[#62d9ff]">
                      5. دعوة ذكية للعمل (Call to Action)
                    </div>
                    <p className="text-[#effaf4] leading-relaxed">
                      {generated.callToAction}
                    </p>
                  </div>
                </motion.div>

                {/* Editable Full Text Preview with Smooth Height Expansion */}
                <motion.div variants={staggerItem} className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="proposal-fulltext-editor"
                      className="block text-xs font-semibold text-[#a4c2b4]"
                    >
                      النص الكامل المنسق والجاهز للإرسال (قابل للتعديل):
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsEditorExpanded(!isEditorExpanded)}
                      className="spring-btn flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] text-[#62d9ff]"
                    >
                      {isEditorExpanded ? (
                        <>
                          <Minimize2 className="w-3 h-3" />
                          <span>تصغير المحرر</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3 h-3" />
                          <span>توسيع مساحة التحرير</span>
                        </>
                      )}
                    </button>
                  </div>
                  <motion.div
                    animate={{
                      height: isEditorExpanded ? 320 : 176,
                    }}
                    transition={{
                      duration: reducedMotion ? 0.01 : 0.22,
                      ease: EASE_OUT_EXPO,
                    }}
                    className="overflow-hidden rounded-xl"
                  >
                    <textarea
                      id="proposal-fulltext-editor"
                      value={generated.fullProposal}
                      onChange={(e) =>
                        setGenerated({
                          ...generated,
                          fullProposal: e.target.value,
                        })
                      }
                      className="w-full h-full p-4 rounded-xl bg-black/50 border border-white/10 text-xs text-[#effaf4] leading-relaxed focus:outline-none focus:border-[#2be38a] resize-none"
                    />
                  </motion.div>
                </motion.div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

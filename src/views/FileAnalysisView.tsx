import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileImage,
  Upload,
  Sparkles,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { useData } from '../context/DataContext';
import { useMotionSystem } from '../utils/motionVariants';

export const FileAnalysisView: React.FC = () => {
  const { addNotification } = useData();
  const { staggerContainer, staggerItem } = useMotionSystem();

  const [fileName, setFileName] = useState<string>('dashboard-ui-wireframe.png');
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [fileBase64, setFileBase64] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>(
    'أرغب في تقدير ساعات البرمجة اللازمة لتحويل هذا التصميم إلى تطبيق React متكامل.'
  );
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const [analysis, setAnalysis] = useState<{
    summary: string;
    detectedComponents: string[];
    uxEvaluation: string[];
    estimatedHours: number;
    suggestedBudgetRange: string;
    recommendedStack: string[];
    implementationRisks: string[];
    modelMode?: string;
  } | null>(null);

  const processSelectedFile = (file: File) => {
    setUploadError(null);
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/pdf',
      'text/plain',
    ];
    if (
      file.type &&
      !allowedTypes.includes(file.type) &&
      !file.type.startsWith('image/')
    ) {
      const msg = `صيغة الملف "${file.name}" غير مدعومة. يرجى رفع صورة (PNG, JPG, WebP) أو ملف PDF/TXT.`;
      setUploadError(msg);
      addNotification({
        title: 'صيغة ملف غير مدعومة',
        message: msg,
        type: 'error',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      const msg = 'حجم الملف يتجاوز الحد الأقصى المسموح به (10 ميجابايت).';
      setUploadError(msg);
      addNotification({
        title: 'حجم الملف كبير جداً',
        message: msg,
        type: 'error',
      });
      return;
    }

    setFileName(file.name);
    setMimeType(file.type || 'image/png');
    setIsReadingFile(true);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
        const base64 = reader.result.split(',')[1] || '';
        setFileBase64(base64);
      }
      setIsReadingFile(false);
      addNotification({
        title: 'تم تجهيز الملف للتحليل',
        message: `تم تحميل "${file.name}" بنجاح وجاهز للفحص الهندسي.`,
        type: 'info',
      });
    };
    reader.onerror = () => {
      setIsReadingFile(false);
      setUploadError('تعذر قراءة الملف المرفوع. يرجى المحاولة بملف آخر.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleAnalyzeFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setUploadError(null);
    try {
      const res = await fetch('/api/gemini/analyze-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64,
          mimeType,
          fileName,
          notes,
        }),
      });
      if (!res.ok) {
        throw new Error('File analysis failed');
      }
      const data = await res.json();
      setAnalysis(data);
      addNotification({
        title: 'اكتمل التحليل البصري والهندسي',
        message: `الجهد المقدر: ${data.estimatedHours} ساعة عمل (${data.suggestedBudgetRange}).`,
        type: 'success',
      });
    } catch {
      setUploadError('تعذر تحليل الملف حالياً. يرجى المحاولة مرة أخرى.');
      addNotification({
        title: 'خطأ أثناء تحليل المرفق',
        message: 'تعذر إتمام الفحص البصري، يرجى إعادة المحاولة.',
        type: 'error',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard hoverable={false} className="p-6">
        <form onSubmit={handleAnalyzeFile} className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#effaf4]">
              تحليل المستندات والتصاميم المتعددة الوسائط (Multimodal UI & Spec Analyzer)
            </h2>
            <p className="text-xs text-[#a4c2b4] mt-0.5">
              ارفع صور واجهات المستخدم (UI Mockups)، المخططات الهندسية، أو ملفات المواصفات لتقدير الجهد البرمجي والمكونات المطلوبة
            </p>
          </div>

          {uploadError && (
            <div className="p-3.5 rounded-xl bg-[#ff6b7f]/10 border border-[#ff6b7f]/35 flex items-center gap-2.5 text-xs text-[#ff6b7f]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isDraggingOver) setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center h-52 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 p-4 text-center ${
                  isDraggingOver
                    ? 'bg-[#2be38a]/15 border-[#2be38a] scale-[1.01] shadow-[0_0_30px_rgba(43,227,138,0.2)]'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/15 hover:border-[#62d9ff]/40'
                }`}
              >
                {isReadingFile ? (
                  <div className="space-y-2">
                    <div className="w-7 h-7 mx-auto rounded-full border-2 border-[#62d9ff] border-t-transparent animate-spin" />
                    <div className="text-xs font-bold text-[#effaf4]">
                      جاري قراءة وتجهيز المرفق...
                    </div>
                  </div>
                ) : previewUrl && mimeType.startsWith('image/') ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={previewUrl}
                    alt={fileName}
                    referrerPolicy="no-referrer"
                    className="max-h-40 rounded-xl object-contain"
                  />
                ) : (
                  <div className="space-y-2">
                    <Upload
                      className={`w-8 h-8 mx-auto transition-transform duration-200 ${
                        isDraggingOver
                          ? 'text-[#2be38a] -translate-y-1 scale-110'
                          : 'text-[#62d9ff]'
                      }`}
                    />
                    <div className="text-xs font-bold text-[#effaf4]">
                      {isDraggingOver
                        ? 'أفلت الملف الآن لبدء التجهيز الفوري'
                        : 'اسحب وأفلت صورة تصميم الواجهة (PNG, JPG, WebP) أو ملف PDF'}
                    </div>
                    <div className="text-[11px] text-[#6c8a7d] font-mono">
                      الملف المحدد: {fileName}
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*,application/pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="file-analysis-notes"
                  className="block text-xs font-medium text-[#a4c2b4]"
                >
                  ملاحظات أو أسئلة حول التصميم المرفق
                </label>
                <textarea
                  id="file-analysis-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4] leading-relaxed focus:outline-none focus:border-[#2be38a]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-[#6c8a7d]">
                  يستخدم محرك الرؤية المتقدم لتحليل المكونات وتجربة المستخدم
                </span>
                <button
                  type="submit"
                  disabled={isAnalyzing || isReadingFile}
                  className="spring-btn flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2be38a] to-[#62d9ff] text-[#020504] font-bold text-xs hover:brightness-110 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>
                    {isAnalyzing
                      ? 'جاري فحص التصميم والمكونات...'
                      : 'بدء التحليل البصري والهندسي'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </GlassCard>

      {isAnalyzing && (
        <GlassCard hoverable={false} className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl border-2 border-[#2be38a] border-t-transparent animate-spin shrink-0" />
            <div>
              <div className="text-sm font-bold text-[#effaf4]">
                جاري فحص المكونات البصرية وتقدير الساعات البرمجية للمرفق "{fileName}"...
              </div>
              <div className="text-xs text-[#a4c2b4]">
                يتم استخراج عناصر الواجهة وتقييم تجربة المستخدم والمخاطر التقنية
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {analysis && !isAnalyzing && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={staggerItem}>
            <GlassCard variant="hot" hoverable={false} className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-xs text-[#2be38a] font-medium">
                    ملخص التحليل الهندسي · الوضع: {analysis.modelMode}
                  </div>
                  <h3 className="text-base font-bold text-[#effaf4]">
                    {analysis.summary}
                  </h3>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-center">
                    <div className="text-[11px] text-[#a4c2b4]">
                      الجهد البرمجي المقدر
                    </div>
                    <div className="font-mono text-lg font-bold text-[#2be38a] tabular-nums flex items-center justify-center gap-1 mt-0.5">
                      <Clock className="w-4 h-4" />
                      <span>{analysis.estimatedHours} ساعة</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-center">
                    <div className="text-[11px] text-[#a4c2b4]">
                      التكلفة التقديرية
                    </div>
                    <div className="font-mono text-lg font-bold text-[#62d9ff] tabular-nums mt-0.5">
                      {analysis.suggestedBudgetRange}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <GlassCard className="p-5 space-y-3">
              <h4 className="text-sm font-bold text-[#effaf4] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2be38a]" />
                <span>المكونات البرمجية المكتشفة</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#effaf4]">
                {analysis.detectedComponents.map((c, i) => (
                  <li
                    key={i}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2be38a] shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-5 space-y-3">
              <h4 className="text-sm font-bold text-[#62d9ff] flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                <span>تقييم تجربة المستخدم (UX)</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#a4c2b4]">
                {analysis.uxEvaluation.map((u, i) => (
                  <li
                    key={i}
                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[#effaf4]"
                  >
                    • {u}
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-5 space-y-3">
              <h4 className="text-sm font-bold text-[#ffc15a] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>التقنيات وملاحظات التنفيذ</span>
              </h4>
              <div className="text-xs text-[#2be38a] font-mono">
                {analysis.recommendedStack.join(' · ')}
              </div>
              <div className="space-y-2 pt-2 text-xs text-[#a4c2b4]">
                {analysis.implementationRisks.map((r, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[#ffc15a]/[0.05] border border-[#ffc15a]/25 text-[#effaf4]"
                  >
                    {r}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

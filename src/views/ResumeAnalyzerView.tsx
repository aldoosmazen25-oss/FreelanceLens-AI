import React, { useState } from 'react';
import {
  FileUser,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { MatchRing } from '../components/common/MatchRing';
import { useData } from '../context/DataContext';

export const ResumeAnalyzerView: React.FC = () => {
  const { userProfile, addSkillsToProfile, addNotification } = useData();

  const [targetRole, setTargetRole] = useState<string>(
    'Senior Full-Stack & AI Solutions Architect'
  );
  const [resumeText, setResumeText] = useState<string>(
    `${userProfile.name} — ${userProfile.title}\n${userProfile.bio}\nالمهارات الأساسية: React, TypeScript, Node.js, Express, Gemini API, Firebase Firestore, Tailwind CSS, Google Workspace APIs.\nالخبرات: بناء منصات SaaS مالية وأنظمة أتمتة ذكية للشركات الناشئة والمتوسطة.`
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [importedSuccess, setImportedSuccess] = useState<boolean>(false);

  const [result, setResult] = useState<{
    matchScore: number;
    extractedSkills: Array<{ name: string; level: string }>;
    coreStrengths: string[];
    skillGaps: string[];
    improvementSteps: string[];
    executiveFeedback: string;
    modelMode?: string;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setResumeText(
          `[ملف مرفوع: ${file.name}]\n` +
            (reader.result.slice(0, 3000) || resumeText)
        );
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setImportedSuccess(false);
    try {
      const res = await fetch('/api/gemini/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, targetRole }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImportSkills = async () => {
    if (!result) return;
    await addSkillsToProfile(result.extractedSkills);
    setImportedSuccess(true);
    addNotification({
      title: 'تم استيراد المهارات إلى ملفك المهني',
      message: `تم تحديث قائمة مهاراتك المعتمدة (${result.extractedSkills.length} مهارات) بنجاح.`,
      type: 'success',
      targetView: 'profile',
    });
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <form onSubmit={handleAnalyze} className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#effaf4]">
              محلل السيرة الذاتية ومطابقة الأدوار التنافسية (Resume Intelligence)
            </h2>
            <p className="text-xs text-[#a4c2b4] mt-0.5">
              ارفع سيرتك الذاتية أو الصق محتواها لقياس نسبة التوافق مع التخصص المستهدف واستخراج المهارات المعتمدة
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-1.5">
              <label
                htmlFor="target-role-input"
                className="block text-xs font-medium text-[#a4c2b4]"
              >
                التخصص أو الدور الوظيفي المستهدف
              </label>
              <input
                id="target-role-input"
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4] focus:outline-none focus:border-[#2be38a]"
              />
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-[#a4c2b4]">
                رفع ملف السيرة (PDF / TXT)
              </span>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-dashed border-white/20 text-xs text-[#62d9ff] cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>اختر ملفاً أو اسحبه هنا</span>
                <input
                  type="file"
                  accept=".txt,.pdf,.md,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="resume-text-area"
              className="block text-xs font-medium text-[#a4c2b4]"
            >
              نص السيرة الذاتية والخبرات
            </label>
            <textarea
              id="resume-text-area"
              rows={5}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4] leading-relaxed focus:outline-none focus:border-[#2be38a]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2be38a] to-[#62d9ff] text-[#020504] font-bold text-xs hover:brightness-110 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isAnalyzing ? 'جاري تحليل السيرة الذاتية...' : 'بدء تحليل السيرة الذاتية'}
              </span>
            </button>
          </div>
        </form>
      </GlassCard>

      {result && (
        <div className="space-y-6">
          <GlassCard variant="hot" className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="text-xs text-[#2be38a] font-medium">
                  تقييم الجاهزية للدور المستهدف: {targetRole}
                </div>
                <h3 className="text-base font-bold text-[#effaf4]">
                  {result.executiveFeedback}
                </h3>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleImportSkills}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2be38a] text-[#020504] font-bold text-xs hover:brightness-110 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>استيراد المهارات المعتمدة إلى ملفي المهني</span>
                  </button>
                  {importedSuccess && (
                    <span className="text-xs text-[#2be38a] font-semibold">
                      ✓ تم تحديث ملفك المهني بنجاح!
                    </span>
                  )}
                </div>
              </div>

              <MatchRing score={result.matchScore} size={80} label="توافق السيرة" />
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-5 space-y-3">
              <h4 className="text-sm font-bold text-[#effaf4] flex items-center gap-2">
                <FileUser className="w-4 h-4 text-[#62d9ff]" />
                <span>المهارات التقنية المستخرجة</span>
              </h4>
              <div className="space-y-2">
                {result.extractedSkills.map((sk, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs"
                  >
                    <span className="font-semibold text-[#effaf4]">{sk.name}</span>
                    <span className="text-[#2be38a]">{sk.level}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5 space-y-3">
              <h4 className="text-sm font-bold text-[#2be38a] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>نقاط القوة التنافسية</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#effaf4]">
                {result.coreStrengths.map((st, i) => (
                  <li key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 leading-relaxed">
                    • {st}
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-5 space-y-3">
              <h4 className="text-sm font-bold text-[#ffc15a] flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>فجوات المهارات وخطوات التحسين</span>
              </h4>
              <div className="space-y-2 text-xs text-[#a4c2b4]">
                {result.skillGaps.map((gap, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#ffc15a]/[0.05] border border-[#ffc15a]/25 text-[#effaf4]">
                    {gap}
                  </div>
                ))}
                <div className="pt-2 text-[#62d9ff] font-semibold">خطوات مقترحة:</div>
                {result.improvementSteps.map((step, i) => (
                  <div key={i} className="text-[#a4c2b4]">
                    {i + 1}. {step}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

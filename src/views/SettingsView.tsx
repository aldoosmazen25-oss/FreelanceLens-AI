import React, { useState } from 'react';
import {
  Download,
  Cpu,
  ShieldCheck,
  Database,
  Check,
  Sun,
  Moon,
  Sliders,
  Palette,
  Sparkles,
  Globe,
  RotateCcw,
  Layers,
  Eye,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import {
  AccentPreset,
  CornerRadiusPreset,
  UIDensityPreset,
  AnimationSpeedPreset,
} from '../utils/calculations';

export const SettingsView: React.FC = () => {
  const { isFirestoreEligible, signInWithGoogleAccount } = useAuth();
  const { exportFullBackupJson } = useData();
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    uiSettings,
    updateUISettings,
    resetUISettings,
  } = useLanguage();
  const [exported, setExported] = useState(false);

  const handleDownloadBackup = () => {
    const json = exportFullBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firework-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  const accentOptions: Array<{
    id: AccentPreset;
    labelAr: string;
    labelEn: string;
    swatch: string;
  }> = [
    { id: 'emerald', labelAr: 'زمردي نيون', labelEn: 'Emerald Neon', swatch: 'bg-[#2be38a]' },
    { id: 'cyan', labelAr: 'سماوي سيبراني', labelEn: 'Cyber Cyan', swatch: 'bg-[#38bdf8]' },
    { id: 'violet', labelAr: 'بنفسجي ملكي', labelEn: 'Royal Violet', swatch: 'bg-[#a855f7]' },
    { id: 'amber', labelAr: 'ذهبي دافئ', labelEn: 'Warm Amber', swatch: 'bg-[#f59e0b]' },
    { id: 'rose', labelAr: 'ياقوتي مشع', labelEn: 'Neon Rose', swatch: 'bg-[#f43f5e]' },
  ];

  const radiusOptions: Array<{
    id: CornerRadiusPreset;
    labelAr: string;
    labelEn: string;
  }> = [
    { id: 'fluid', labelAr: 'دائري سائل (24px)', labelEn: 'Fluid Pill (24px)' },
    { id: 'modern', labelAr: 'عصري متوازن (16px)', labelEn: 'Modern (16px)' },
    { id: 'sharp', labelAr: 'هندسي حاد (10px)', labelEn: 'Sharp Studio (10px)' },
  ];

  const densityOptions: Array<{
    id: UIDensityPreset;
    labelAr: string;
    labelEn: string;
  }> = [
    { id: 'compact', labelAr: 'مدمج (Compact)', labelEn: 'Compact' },
    { id: 'comfortable', labelAr: 'مريح (الافتراضي)', labelEn: 'Comfortable' },
    { id: 'spacious', labelAr: 'واسع (Spacious)', labelEn: 'Spacious' },
  ];

  const animationOptions: Array<{
    id: AnimationSpeedPreset;
    labelAr: string;
    labelEn: string;
  }> = [
    { id: 'ultra', labelAr: 'فيزيائي فائق السلاسة', labelEn: 'Ultra Fluid Spring' },
    { id: 'snappy', labelAr: 'سريع واستجابي', labelEn: 'Snappy Fast' },
    { id: 'calm', labelAr: 'هادئ وناعم', labelEn: 'Calm Motion' },
  ];

  const aiEngines = [
    {
      name: 'وضع الاستدلال والتفكير العميق',
      domain: 'تحليل العقود المعقدة، كشف الأعلام الحمراء، وتحليل التصاميم البصرية',
      status: 'نشط ومفعل',
    },
    {
      name: 'الوضع المتوازن والدقيق',
      domain: 'صياغة العروض التنافسية، مطابقة السيرة الذاتية، واستشارات التسعير',
      status: 'نشط ومفعل',
    },
    {
      name: 'الوضع السريع والمباشر (Lens AI)',
      domain: 'الردود الفورية، التلخيص اللحظي، والاستشارات التعاقدية المباشرة',
      status: 'نشط ومفعل',
    },
    {
      name: 'محرك الصوت البشري المباشر (Lens Voice)',
      domain: 'تحويل الكلام إلى نص وتوليد الردود الصوتية الطبيعية ثنائية الاتجاه',
      status: 'نشط ومفعل',
    },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* القسم الأول: استوديو تخصيص الزجاج السائل، الشفافية، ونمط البرنامج (Liquid Glass & UI Studio) */}
      <GlassCard variant="hot" hoverable={false} className="p-5 sm:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2be38a]/20 border border-[#2be38a]/40 flex items-center justify-center text-[#2be38a]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#effaf4]">
                {language === 'ar'
                  ? 'استوديو الزجاج السائل وتخصيص نمط البرنامج والـ UI — Firework AI'
                  : 'Liquid Glass, Transparency & UI Customization Studio — Firework AI'}
              </h2>
              <p className="text-xs text-[#a4c2b4]">
                {language === 'ar'
                  ? 'تحكم كامل في درجة الشفافية، الضبابية، لون الهوية، استدارة الحواف، وسلاسة الأنيميشن'
                  : 'Customize glass transparency, backdrop blur, accent theme, corner radius, and spring motion'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetUISettings}
            className="spring-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-semibold text-[#effaf4]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#2be38a]" />
            <span>
              {language === 'ar' ? 'إعادة ضبط المظهر الافتراضي' : 'Reset Default UI'}
            </span>
          </button>
        </div>

        {/* Row 1: Sliders for Liquid Glass Opacity, Blur Intensity & Specular Rim */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Glass Transparency / Opacity */}
          <div className="p-4 rounded-2xl liquid-glass space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#effaf4]">
                {language === 'ar'
                  ? 'درجة شفافية وكثافة الزجاج السائل'
                  : 'Liquid Glass Opacity'}
              </span>
              <span className="font-mono font-bold text-[#2be38a]">
                {uiSettings.glassOpacity}%
              </span>
            </div>
            <input
              type="range"
              aria-label="درجة شفافية الزجاج السائل"
              min={20}
              max={95}
              value={uiSettings.glassOpacity}
              onChange={(e) =>
                updateUISettings({ glassOpacity: Number(e.target.value) })
              }
              className="w-full accent-[#2be38a] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#a4c2b4]">
              <span>{language === 'ar' ? 'شفاف جداً (20%)' : 'Ultra Clear'}</span>
              <span>{language === 'ar' ? 'بلوري كثيف (95%)' : 'Deep Frosted'}</span>
            </div>
          </div>

          {/* 2. Backdrop Blur Intensity */}
          <div className="p-4 rounded-2xl liquid-glass space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#effaf4]">
                {language === 'ar'
                  ? 'قوة الضبابية والانكسار (Blur)'
                  : 'Backdrop Blur Refraction'}
              </span>
              <span className="font-mono font-bold text-[#62d9ff]">
                {uiSettings.glassBlur}px
              </span>
            </div>
            <input
              type="range"
              aria-label="قوة ضبابية الزجاج السائل"
              min={16}
              max={72}
              value={uiSettings.glassBlur}
              onChange={(e) =>
                updateUISettings({ glassBlur: Number(e.target.value) })
              }
              className="w-full accent-[#62d9ff] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#a4c2b4]">
              <span>16px</span>
              <span>50px</span>
              <span>72px</span>
            </div>
          </div>

          {/* 3. Specular Rim & Border Glow */}
          <div className="p-4 rounded-2xl liquid-glass space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#effaf4]">
                {language === 'ar'
                  ? 'إضاءة الحواف والانعكاس البصري'
                  : 'Specular Rim & Border Glow'}
              </span>
              <span className="font-mono font-bold text-[#ffc15a]">
                {uiSettings.specularIntensity}%
              </span>
            </div>
            <input
              type="range"
              aria-label="إضاءة الحواف والانعكاس البصري"
              min={10}
              max={100}
              value={uiSettings.specularIntensity}
              onChange={(e) =>
                updateUISettings({ specularIntensity: Number(e.target.value) })
              }
              className="w-full accent-[#ffc15a] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#a4c2b4]">
              <span>{language === 'ar' ? 'هادئ (10%)' : 'Subtle'}</span>
              <span>{language === 'ar' ? 'مشع (100%)' : 'Luminous'}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Theme Mode (Dark/Light) + Primary Accent Palette */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Theme Mode */}
          <div className="lg:col-span-5 p-4 rounded-2xl liquid-glass space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#effaf4]">
              <Sun className="w-4 h-4 text-[#ffc15a]" />
              <span>
                {language === 'ar'
                  ? 'النمط الضوئي للبرنامج (داكن / فاتح)'
                  : 'Workspace Lighting Mode'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`spring-btn flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border ${
                  theme === 'dark'
                    ? 'bg-[#2be38a] text-[#020504] border-[#2be38a]'
                    : 'bg-white/[0.04] text-[#a4c2b4] border-white/10 hover:text-[#effaf4]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'النمط الداكن' : 'Dark Mode'}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`spring-btn flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold border ${
                  theme === 'light'
                    ? 'bg-[#ffc15a] text-[#020504] border-[#ffc15a]'
                    : 'bg-white/[0.04] text-[#a4c2b4] border-white/10 hover:text-[#effaf4]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'النمط الفاتح' : 'Light Mode'}</span>
              </button>
            </div>
          </div>

          {/* Accent Color Studio */}
          <div className="lg:col-span-7 p-4 rounded-2xl liquid-glass space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#effaf4]">
              <Palette className="w-4 h-4 text-[#2be38a]" />
              <span>
                {language === 'ar'
                  ? 'لون الهوية الأساسي للبرنامج (Accent Theme)'
                  : 'App Primary Accent Color'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {accentOptions.map((acc) => {
                const isSelected = uiSettings.accentPreset === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => updateUISettings({ accentPreset: acc.id })}
                    className={`spring-btn flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold ${
                      isSelected
                        ? 'liquid-glass-hot border-[#2be38a] text-[#effaf4] font-bold'
                        : 'bg-white/[0.03] border-white/10 text-[#a4c2b4] hover:text-[#effaf4]'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${acc.swatch}`} />
                    <span className="truncate">
                      {language === 'ar' ? acc.labelAr : acc.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Corner Radius, UI Density, Animation Speed & Workspace Element Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Corner Radius */}
          <div className="p-4 rounded-2xl liquid-glass space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#effaf4]">
              <Layers className="w-3.5 h-3.5 text-[#62d9ff]" />
              <span>
                {language === 'ar' ? 'شكل واستدارة الحواف' : 'Corner Radius'}
              </span>
            </div>
            <div className="space-y-1.5">
              {radiusOptions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => updateUISettings({ cornerRadius: r.id })}
                  className={`w-full text-right px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    uiSettings.cornerRadius === r.id
                      ? 'bg-[#2be38a] text-[#020504] font-bold'
                      : 'bg-white/[0.04] text-[#a4c2b4] hover:text-[#effaf4]'
                  }`}
                >
                  {language === 'ar' ? r.labelAr : r.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* UI Density */}
          <div className="p-4 rounded-2xl liquid-glass space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#effaf4]">
              <Sliders className="w-3.5 h-3.5 text-[#2be38a]" />
              <span>
                {language === 'ar' ? 'كثافة الواجهة وحجم الخط' : 'UI Density & Scale'}
              </span>
            </div>
            <div className="space-y-1.5">
              {densityOptions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => updateUISettings({ uiDensity: d.id })}
                  className={`w-full text-right px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    uiSettings.uiDensity === d.id
                      ? 'bg-[#2be38a] text-[#020504] font-bold'
                      : 'bg-white/[0.04] text-[#a4c2b4] hover:text-[#effaf4]'
                  }`}
                >
                  {language === 'ar' ? d.labelAr : d.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Physics Animation Speed */}
          <div className="p-4 rounded-2xl liquid-glass space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#effaf4]">
              <Sparkles className="w-3.5 h-3.5 text-[#ffc15a]" />
              <span>
                {language === 'ar' ? 'سرعة وسلاسة الأنيميشن' : 'Spring Motion Speed'}
              </span>
            </div>
            <div className="space-y-1.5">
              {animationOptions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => updateUISettings({ animationSpeed: a.id })}
                  className={`w-full text-right px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    uiSettings.animationSpeed === a.id
                      ? 'bg-[#2be38a] text-[#020504] font-bold'
                      : 'bg-white/[0.04] text-[#a4c2b4] hover:text-[#effaf4]'
                  }`}
                >
                  {language === 'ar' ? a.labelAr : a.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Workspace Visual Toggles */}
          <div className="p-4 rounded-2xl liquid-glass space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#effaf4]">
              <Eye className="w-3.5 h-3.5 text-[#62d9ff]" />
              <span>
                {language === 'ar' ? 'عناصر الواجهة التفاعلية' : 'Interactive UI Elements'}
              </span>
            </div>
            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/10 cursor-pointer text-xs text-[#effaf4]">
                <span>
                  {language === 'ar' ? 'الجزيرة الديناميكية العلوية' : 'Top Dynamic Island'}
                </span>
                <input
                  type="checkbox"
                  checked={uiSettings.showDynamicIsland}
                  onChange={(e) =>
                    updateUISettings({ showDynamicIsland: e.target.checked })
                  }
                  className="accent-[#2be38a] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/10 cursor-pointer text-xs text-[#effaf4]">
                <span>
                  {language === 'ar' ? 'الإضاءة السائلة الخلفية' : 'Ambient Liquid Orbs'}
                </span>
                <input
                  type="checkbox"
                  checked={uiSettings.showAmbientOrbs}
                  onChange={(e) =>
                    updateUISettings({ showAmbientOrbs: e.target.checked })
                  }
                  className="accent-[#2be38a] w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* القسم الثاني: اللغات العالمية الـ 12 (Global 12 Languages Hub) */}
      <GlassCard variant="cyan" hoverable={false} className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-[#62d9ff]" />
            <div>
              <h3 className="text-base font-bold text-[#effaf4]">
                {language === 'ar'
                  ? 'لغات الواجهة العالمية (12 لغة أساسية مدعومة بالكامل)'
                  : 'Global Interface Languages (12 Essential Languages)'}
              </h3>
              <p className="text-xs text-[#a4c2b4]">
                {language === 'ar'
                  ? 'اختر لغتك المفضلة لتحديث اتجاه الواجهة وعناوين المنصة فوراً'
                  : 'Select your preferred language to switch interface labels and direction'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#62d9ff]/15 border border-[#62d9ff]/35 font-mono text-xs font-bold text-[#62d9ff]">
            12 Languages
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`spring-btn p-3 rounded-2xl border text-right flex flex-col justify-between gap-1 ${
                  isSelected
                    ? 'liquid-glass-hot border-[#2be38a] text-[#effaf4]'
                    : 'liquid-glass text-[#a4c2b4] hover:text-[#effaf4]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-[#62d9ff]">
                    {lang.shortLabel}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#2be38a]" />}
                </div>
                <div className="text-xs font-bold text-[#effaf4] truncate mt-1">
                  {lang.nativeName}
                </div>
                <div className="text-[10px] text-[#a4c2b4] truncate">
                  {lang.nameAr}
                </div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* القسم الثالث: قواعد البيانات السحابية الحقيقية ومحركات الذكاء الاصطناعي */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <GlassCard className="lg:col-span-6 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Database className="w-5 h-5 text-[#2be38a]" />
            <div>
              <h3 className="text-base font-bold text-[#effaf4]">
                {language === 'ar'
                  ? 'مساحة العمل الحقيقية والنسخ الاحتياطي'
                  : 'Real Production Workspace & JSON Backup'}
              </h3>
              <p className="text-xs text-[#a4c2b4]">
                {language === 'ar'
                  ? 'يعمل Firework AI دائماً كمساحة عمل حقيقية متصلة ومحمية'
                  : 'Firework AI operates permanently as your real live workspace'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl liquid-glass-hot space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#effaf4]">
                {language === 'ar'
                  ? 'حالة مساحة العمل الحقيقية الدائمة'
                  : 'Permanent Real Workspace Status'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#2be38a]/20 border border-[#2be38a]/40 text-[11px] font-bold text-[#2be38a]">
                {language === 'ar' ? 'مساحة عمل حقيقية نشطة' : 'Live Real Workspace'}
              </span>
            </div>
            <p className="text-xs text-[#a4c2b4] leading-relaxed">
              {isFirestoreEligible
                ? 'متصل ومزامن لحظياً مع قاعدة بيانات Firebase Firestore السحابية وحساب Google الخاص بك.'
                : 'جميع مشاريعك وعروضك وملفك المهني تُحفظ فوراً في مساحة عملك الحقيقية ويمكنك ربطها سحابياً عبر Google في أي وقت.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="text-xs font-bold text-[#effaf4]">
              النسخ الاحتياطي الكامل للبيانات (Full JSON Export)
            </div>
            <p className="text-xs text-[#a4c2b4]">
              قم بتنزيل نسخة محلية كاملة تحتوي على جميع المشاريع، العروض، المعاملات المالية، وسجل استشارات Lens AI بصيغة JSON.
            </p>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="spring-btn w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2be38a] text-[#020504] font-bold text-xs hover:brightness-110 transition-all"
            >
              {exported ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم تصدير النسخة الاحتياطية بنجاح</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تصدير نسخة احتياطية كاملة (JSON)</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2be38a]" />
              <span className="text-xs font-bold text-[#effaf4]">
                أمان وحماية مصادقة Google Workspace و Firestore
              </span>
            </div>
            <p className="text-xs text-[#a4c2b4] leading-relaxed">
              تُعزل مسارات قاعدة البيانات السحابية بحيث لا يمكن قراءتها أو تعديلها إلا من حسابك الموثق.
            </p>
            <button
              type="button"
              onClick={signInWithGoogleAccount}
              className="spring-btn px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-[#effaf4]"
            >
              تحديث تفويض حساب Google Workspace
            </button>
          </div>
        </GlassCard>

        {/* AI Engines Card */}
        <GlassCard variant="cyan" className="lg:col-span-6 p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-[#62d9ff]" />
            <h3 className="text-base font-bold text-[#effaf4]">
              منظومة محركات الذكاء الاصطناعي الأربعة في Firework AI
            </h3>
          </div>

          <div className="space-y-2.5">
            {aiEngines.map((eng, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#effaf4]">{eng.name}</span>
                  <span className="text-[#2be38a] font-medium">{eng.status}</span>
                </div>
                <p className="text-[11px] text-[#a4c2b4]">{eng.domain}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

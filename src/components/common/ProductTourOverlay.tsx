import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface TourStepConfig {
  targetSelector: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

interface ProductTourOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  steps?: TourStepConfig[];
}

const DEFAULT_TOUR_STEPS: TourStepConfig[] = [
  {
    targetSelector: '[data-tour-id="tour-composer"]',
    titleAr: 'محلل العقود والمشاريع الذكي',
    titleEn: 'AI Project & Contract Analyzer',
    descriptionAr:
      'الصق وصف المشروع أو ارفق ملفات PDF/DOCX لتحليل المتطلبات والمخاطر ومطابقتها مع مهاراتك الحقيقية.',
    descriptionEn:
      'Paste any client brief or attach PDF/DOCX files to analyze scope risks and match against your real skills.',
  },
  {
    targetSelector: '[data-tour-id="tour-voice-orb"]',
    titleAr: 'المساعد الصوتي المباشر Lens Voice',
    titleEn: 'Lens Voice Live Assistant',
    descriptionAr:
      'تحدث مباشرة مع Lens Voice للبحث عن فرص عمل أو صياغة عروض احترافية وتنفيذ المهام صوتياً داخل التطبيق.',
    descriptionEn:
      'Speak naturally to Lens Voice to scout opportunities, draft proposals, and execute tasks inside the workspace.',
  },
  {
    targetSelector: '[data-tour-id="tour-metrics"]',
    titleAr: 'مؤشرات الأداء والمطابقة المهنية',
    titleEn: 'Live Workspace & Match Metrics',
    descriptionAr:
      'تابع المشاريع المحفوظة والعروض المرسلة وصافي التدفق المالي وجاهزية ملفك المهني في مكان واحد.',
    descriptionEn:
      'Track saved projects, submitted proposals, net cashflow, and your verified profile completeness in real time.',
  },
  {
    targetSelector: '[data-tour-id="tour-stack-cards"]',
    titleAr: 'بطاقات التدفق الذكي المتراكبة',
    titleEn: 'Stacking Workflow Intelligence',
    descriptionAr:
      'استعرض خطوات العمل المتسلسلة من فحص العقد إلى هندسة العرض التنافسي وحاسبة التسعير.',
    descriptionEn:
      'Navigate your end-to-end freelance workflow from contract diagnostics to proposal engineering and pricing.',
  },
];

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const ProductTourOverlay: React.FC<ProductTourOverlayProps> = ({
  isOpen,
  onClose,
  steps = DEFAULT_TOUR_STEPS,
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [rect, setRect] = useState<SpotlightRect>({
    top: 120,
    left: 120,
    width: 360,
    height: 160,
  });

  const PADDING = 10; // ~10px padding around target

  const measureTarget = useCallback(
    (stepIdx: number) => {
      const step = steps[stepIdx];
      if (!step) return;
      const el = document.querySelector(step.targetSelector) as HTMLElement | null;
      if (!el) return;

      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

      const updateBox = () => {
        const box = el.getBoundingClientRect();
        const top = Math.max(8, box.top - PADDING);
        const left = Math.max(8, box.left - PADDING);
        const width = Math.min(window.innerWidth - left - 8, box.width + PADDING * 2);
        const height = Math.min(window.innerHeight - top - 8, box.height + PADDING * 2);
        setRect({ top, left, width, height });
      };

      updateBox();
      const timer = window.setTimeout(updateBox, 260);
      return () => window.clearTimeout(timer);
    },
    [steps]
  );

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }
    const cleanup = measureTarget(currentStep);
    const handleResizeOrScroll = () => {
      const step = steps[currentStep];
      if (!step) return;
      const el = document.querySelector(step.targetSelector) as HTMLElement | null;
      if (!el) return;
      const box = el.getBoundingClientRect();
      setRect({
        top: Math.max(8, box.top - PADDING),
        left: Math.max(8, box.left - PADDING),
        width: Math.min(window.innerWidth - 16, box.width + PADDING * 2),
        height: Math.min(window.innerHeight - 16, box.height + PADDING * 2),
      });
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, { passive: true });
    return () => {
      cleanup?.();
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll);
    };
  }, [isOpen, currentStep, measureTarget, steps]);

  if (!isOpen) return null;

  const activeStep = steps[currentStep] || steps[0];
  const totalSteps = steps.length;

  // Determine whether bubble sits below or above the spotlight cutout
  const spaceBelow = window.innerHeight - (rect.top + rect.height);
  const placeBelow = spaceBelow >= 210 || rect.top < 200;
  const bubbleWidth = Math.min(340, window.innerWidth - 24);
  const bubbleLeft = Math.min(
    Math.max(12, rect.left + rect.width / 2 - bubbleWidth / 2),
    window.innerWidth - bubbleWidth - 12
  );
  const bubbleTop = placeBelow
    ? Math.min(window.innerHeight - 195, rect.top + rect.height + 14)
    : Math.max(12, rect.top - 190);

  const arrowLeftOffset = Math.min(
    Math.max(24, rect.left + rect.width / 2 - bubbleLeft),
    bubbleWidth - 24
  );

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Product Tour"
      data-testid="product-tour-overlay"
      className="fixed inset-0 z-50 pointer-events-none"
    >
      {/* Dimmed 50% black backdrop with rounded spotlight cutout (~10px padding) that glides between targets */}
      <div
        data-testid="product-tour-spotlight"
        style={{
          position: 'fixed',
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          borderRadius: '18px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.52)',
          border: '2px solid rgba(56, 189, 248, 0.85)',
          transition:
            'top 280ms cubic-bezier(0.22, 1, 0.36, 1), left 280ms cubic-bezier(0.22, 1, 0.36, 1), width 280ms cubic-bezier(0.22, 1, 0.36, 1), height 280ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="pointer-events-none"
      />

      {/* Target-anchored bubble with directional arrow, "2 of 4" step counter, Back, Next, and Skip */}
      <div
        data-testid="product-tour-bubble"
        style={{
          position: 'fixed',
          top: `${bubbleTop}px`,
          left: `${bubbleLeft}px`,
          width: `${bubbleWidth}px`,
          transition:
            'top 280ms cubic-bezier(0.22, 1, 0.36, 1), left 280ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="pointer-events-auto rounded-2xl bg-[#0F172A]/95 text-white border border-white/25 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl"
      >
        {/* Anchored Arrow */}
        <span
          aria-hidden="true"
          style={{
            left: `${arrowLeftOffset}px`,
          }}
          className={`absolute -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-[#0F172A] border-white/25 ${
            placeBelow
              ? '-top-2 border-t border-l'
              : '-bottom-2 border-b border-r'
          }`}
        />

        {/* Top row: Step counter ("1 of 4", "2 of 4", etc.) + Skip button */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            dir="ltr"
            data-testid="tour-step-counter"
            className="font-mono text-xs font-semibold text-[#38BDF8] tabular-nums"
          >
            {currentStep + 1} of {totalSteps}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-slate-300 hover:text-white transition-colors px-2 py-0.5 rounded-md hover:bg-white/10 whitespace-nowrap"
          >
            Skip
          </button>
        </div>

        {/* Step Title & Description */}
        <h3 className="text-sm font-bold text-white mb-1">
          {isAr ? activeStep.titleAr : activeStep.titleEn}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {isAr ? activeStep.descriptionAr : activeStep.descriptionEn}
        </p>

        {/* Bottom Navigation Controls: Back & Next */}
        <div className="flex items-center justify-between gap-2 pt-2 decorative-block-border">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white hover:bg-white/20 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap"
          >
            Back
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep ? 'w-4 bg-[#38BDF8]' : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              if (currentStep < totalSteps - 1) {
                setCurrentStep((prev) => prev + 1);
              } else {
                onClose();
              }
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#007AFF] hover:bg-[#0062CC] text-white transition-colors whitespace-nowrap"
          >
            {currentStep < totalSteps - 1 ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  );
};

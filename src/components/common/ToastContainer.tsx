import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ViewId } from '../../types';
import { useMotionSystem, EASE_OUT_EXPO } from '../../utils/motionVariants';

interface ToastContainerProps {
  onSelectView?: (view: ViewId) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  onSelectView,
}) => {
  const { activeToasts, dismissToast } = useData();
  const { reducedMotion } = useMotionSystem();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:right-auto sm:w-96 z-50 flex flex-col gap-2.5 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {activeToasts.map((toast) => {
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';
          const isSuccess = toast.type === 'success';
          const isOpportunity = toast.type === 'opportunity';

          const borderClass = isError
            ? 'border-[#ff6b7f]/45 bg-[#020504]/90'
            : isWarning
            ? 'border-[#ffc15a]/45 bg-[#020504]/90'
            : isSuccess
            ? 'border-[#2be38a]/45 bg-[#020504]/90'
            : 'border-[#62d9ff]/40 bg-[#020504]/90';

          const Icon = isError
            ? AlertOctagon
            : isWarning
            ? AlertTriangle
            : isSuccess
            ? CheckCircle2
            : isOpportunity
            ? Sparkles
            : Info;

          const iconColor = isError
            ? 'text-[#ff6b7f]'
            : isWarning
            ? 'text-[#ffc15a]'
            : isSuccess
            ? 'text-[#2be38a]'
            : 'text-[#62d9ff]';

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{
                opacity: 0,
                y: reducedMotion ? 0 : 18,
                scale: reducedMotion ? 1 : 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: reducedMotion ? 0.01 : 0.22, ease: EASE_OUT_EXPO },
              }}
              exit={{
                opacity: 0,
                y: reducedMotion ? 0 : 10,
                scale: reducedMotion ? 1 : 0.96,
                transition: { duration: reducedMotion ? 0.01 : 0.16, ease: EASE_OUT_EXPO },
              }}
              className={`pointer-events-auto rounded-2xl backdrop-blur-2xl border p-3.5 shadow-2xl flex items-start justify-between gap-3 ${borderClass}`}
            >
              <div
                onClick={() => {
                  if (toast.targetView && onSelectView) {
                    onSelectView(toast.targetView);
                    dismissToast(toast.id);
                  }
                }}
                className={`flex items-start gap-2.5 min-w-0 flex-1 ${
                  toast.targetView ? 'cursor-pointer' : ''
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="text-xs font-bold text-[#effaf4] truncate">
                    {toast.title}
                  </div>
                  <p className="text-[11px] text-[#a4c2b4] leading-snug line-clamp-2">
                    {toast.message}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="إغلاق الإشعار"
                className="p-1 rounded-lg text-[#a4c2b4] hover:text-[#effaf4] hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

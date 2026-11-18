import React, { useState, useEffect } from 'react';
import {
  Plus,
  ArrowUp,
  MessageSquareCode,
  ScanSearch,
  FilePenLine,
  Compass,
} from 'lucide-react';
import { ViewId } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface FloatingActionGroupProps {
  onSelectView: (view: ViewId) => void;
  onStartTour: () => void;
}

export const FloatingActionGroup: React.FC<FloatingActionGroupProps> = ({
  onSelectView,
  onStartTour,
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState<boolean>(false);
  const [showBackTop, setShowBackTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 400);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const speedDialActions = [
    {
      id: 'analyze',
      label: isAr ? 'تحليل مشروع' : 'Analyze Brief',
      icon: ScanSearch,
      onClick: () => {
        setIsSpeedDialOpen(false);
        onSelectView('project-analyzer');
      },
    },
    {
      id: 'proposal',
      label: isAr ? 'صياغة عرض' : 'Draft Proposal',
      icon: FilePenLine,
      onClick: () => {
        setIsSpeedDialOpen(false);
        onSelectView('proposal-studio');
      },
    },
    {
      id: 'tour',
      label: isAr ? 'جولة تعريفية' : 'Product Tour',
      icon: Compass,
      onClick: () => {
        setIsSpeedDialOpen(false);
        onStartTour();
      },
    },
  ];

  return (
    <div
      role="group"
      aria-label="Floating Action Button Group"
      data-testid="float-button-group"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.25rem)',
      }}
      className="fixed right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-none"
    >
      {/* 1. Back-to-Top Button (FloatButton.BackTop) — Shown ONLY past 400px of scroll */}
      {showBackTop && (
        <button
          type="button"
          onClick={handleBackToTop}
          aria-label="Back to top"
          data-testid="back-to-top-btn"
          className="pointer-events-auto spring-btn w-11 h-11 rounded-full glassmorphic-panel text-[#090E1A] dark:text-white flex items-center justify-center shadow-lg hover:border-[#007AFF]"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* 2. Stacked Chat Launcher Button */}
      <button
        type="button"
        onClick={() => onSelectView('lens-chat')}
        aria-label="Open Lens AI Chat"
        data-testid="fab-chat-launcher"
        className="pointer-events-auto spring-btn w-11 h-11 rounded-full glassmorphic-panel text-[#007AFF] dark:text-[#38BDF8] flex items-center justify-center shadow-lg hover:border-[#007AFF]"
      >
        <MessageSquareCode className="w-4 h-4" />
      </button>

      {/* 3. SpeedDial Actions (3 small labeled actions above the FAB) */}
      {isSpeedDialOpen && (
        <div
          role="menu"
          aria-label="Speed Dial Actions"
          data-testid="fab-speed-dial"
          className="pointer-events-auto flex flex-col items-end gap-2 mb-1"
        >
          {speedDialActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                onClick={action.onClick}
                className="spring-btn flex items-center gap-2.5 px-3.5 py-2 rounded-full glassmorphic-panel text-xs font-semibold text-[#090E1A] dark:text-white shadow-md whitespace-nowrap"
              >
                <span>{action.label}</span>
                <span className="w-7 h-7 rounded-full bg-[#007AFF] text-white flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Primary Round Accent FAB with a White Plus */}
      <button
        type="button"
        onClick={() => setIsSpeedDialOpen((prev) => !prev)}
        aria-expanded={isSpeedDialOpen}
        aria-label={isSpeedDialOpen ? 'Close speed dial' : 'Open speed dial actions'}
        data-testid="primary-fab-plus"
        className="pointer-events-auto spring-btn w-13 h-13 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white flex items-center justify-center shadow-[0_12px_30px_rgba(0,122,255,0.45)] border border-white/30"
      >
        <Plus
          className={`w-6 h-6 text-white transition-transform duration-200 ${
            isSpeedDialOpen ? 'rotate-45' : 'rotate-0'
          }`}
        />
      </button>
    </div>
  );
};

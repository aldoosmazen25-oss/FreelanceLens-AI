import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Search,
  Mic,
  ScanSearch,
  FilePenLine,
  Calculator,
  Kanban,
  Wallet,
  Compass,
  Download,
  X,
  ArrowUpLeft,
} from 'lucide-react';
import { ViewId } from '../../types';
import { useData } from '../../context/DataContext';
import { useMotionSystem } from '../../utils/motionVariants';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: ViewId) => void;
  onOpenVoiceModal: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: React.FC<{ className?: string }>;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onOpenVoiceModal,
}) => {
  const [query, setQuery] = useState('');
  const { exportFullBackupJson } = useData();
  const { modalOverlayVariants, modalDialogVariants } = useMotionSystem();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const commands: CommandItem[] = [
    {
      id: 'cmd-guide',
      title: 'دليل المستخدمين الجدد وشرح وظائف الموقع',
      subtitle: 'جولة تعريفية تفاعلية وشرح مهام وأدوات كل قسم في المنصة',
      category: 'الدليل والمساعدة',
      icon: Compass,
      action: () => {
        onSelectView('user-guide');
        onClose();
      },
    },
    {
      id: 'cmd-analyze',
      title: 'تحليل مشروع جديد بالذكاء الاصطناعي',
      subtitle: 'كشف مخاطر العقود وتمدد النطاق وقياس نسبة التوافق',
      category: 'إجراءات سريعة',
      icon: ScanSearch,
      action: () => {
        onSelectView('project-analyzer');
        onClose();
      },
    },
    {
      id: 'cmd-proposal',
      title: 'كتابة عرض تنافسي احترافي',
      subtitle: 'توليد خطاف افتتاحي وخارطة طريق ومراحل تسليم',
      category: 'إجراءات سريعة',
      icon: FilePenLine,
      action: () => {
        onSelectView('proposal-studio');
        onClose();
      },
    },
    {
      id: 'cmd-voice',
      title: 'بدء محادثة صوتية حية مع لينز إيه آي',
      subtitle: 'حوار صوتي ثنائي الاتجاه مع سجل المحادثات الصوتية المحفوظ',
      category: 'إجراءات سريعة',
      icon: Mic,
      action: () => {
        onClose();
        onOpenVoiceModal();
      },
    },
    {
      id: 'cmd-pricing',
      title: 'حساب تسعير مشروع والربح الصافي',
      subtitle: 'حاسبة الساعات، التعقيد، المراجعات، وعمولة المنصة',
      category: 'إجراءات سريعة',
      icon: Calculator,
      action: () => {
        onSelectView('pricing-calculator');
        onClose();
      },
    },
    {
      id: 'cmd-kanban',
      title: 'فتح لوحة مسار المشاريع (Kanban)',
      subtitle: 'تتبع حالة العقود من الطلب الجديد وحتى الإغلاق',
      category: 'التنقل السريع',
      icon: Kanban,
      action: () => {
        onSelectView('saved-projects');
        onClose();
      },
    },
    {
      id: 'cmd-opportunities',
      title: 'استكشاف فرص العمل الحر عالية التوافق',
      subtitle: 'تصفح الفرص المطابقة لمهاراتك (+85%)',
      category: 'التنقل السريع',
      icon: Compass,
      action: () => {
        onSelectView('opportunities');
        onClose();
      },
    },
    {
      id: 'cmd-financials',
      title: 'الإدارة المالية والتدفقات النقدية',
      subtitle: 'متابعة الدفعات المستلمة والمعلقة والمصروفات',
      category: 'التنقل السريع',
      icon: Wallet,
      action: () => {
        onSelectView('financials');
        onClose();
      },
    },
    {
      id: 'cmd-backup',
      title: 'تصدير نسخة احتياطية كاملة (JSON)',
      subtitle: 'تنزيل كافة المشاريع والعروض والمعاملات فوراً',
      category: 'البيانات والأمان',
      icon: Download,
      action: () => {
        const json = exportFullBackupJson();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `firework-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        onClose();
      },
    },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalOverlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 bg-black/65 backdrop-blur-2xl p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Search or Ask — لوحة الأوامر والبحث الذكي"
        >
          <motion.div
            variants={modalDialogVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl space-y-3"
          >
            {/* Top Smoked Titanium Cool Glass Search Capsule (Matches Image 2 _______4__3ed9dc6a.jpg) */}
            <div className="relative rounded-full cool-glass-spotlight-bar px-5 py-3.5 flex items-center justify-between gap-3 shadow-[0_24px_60px_rgba(0,0,0,0.75)] overflow-hidden">
              <div className="cool-glass-diagonal-streak pointer-events-none" />
              <div className="relative z-10 flex items-center gap-2.5 flex-1 min-w-0">
                <span className="w-[2.5px] h-5 rounded-full bg-[#FFFDF9] shadow-[0_0_10px_#FFB84D,0_0_18px_#FFFFFF] animate-pulse shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search or Ask (ابحث أو اطلب مهمة صوتية مثل: ابحث لي عن عمل لكتابة أو ترجمة محتوى)..."
                  className="w-full bg-transparent text-sm sm:text-base font-medium text-[#FAF7F2] placeholder-[#C8C0B4] focus:outline-none"
                />
              </div>

              <div className="relative z-10 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVoiceModal();
                  }}
                  title="Lens Voice"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-[#FAF7F2]"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="إغلاق لوحة الأوامر"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#D6CFC5] hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Frosted Cool Glass Panel with Diagonal Specular Refraction (Matches Image 2) */}
            <div className="relative rounded-[28px] cool-glass-dropdown-panel p-3.5 shadow-[0_28px_75px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="cool-glass-diagonal-streak pointer-events-none" />

              {/* 4 Signature Cool Glass Rows: Applications ⌘& | Files ⌘é | Actions ⌘" | Clipboard ⌘' */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pb-3 mb-2 border-b border-white/15">
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('project-analyzer');
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-[#FAF7F2]"
                >
                  <span>Applications</span>
                  <kbd className="font-mono text-[10px] text-[#D6CFC5]">⌘&amp;</kbd>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('file-analysis');
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-[#FAF7F2]"
                >
                  <span>Files</span>
                  <kbd className="font-mono text-[10px] text-[#D6CFC5]">⌘é</kbd>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('opportunities');
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-[#FAF7F2]"
                >
                  <span>Actions</span>
                  <kbd className="font-mono text-[10px] text-[#D6CFC5]">⌘&quot;</kbd>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('overview');
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-[#FAF7F2]"
                >
                  <span>Clipboard</span>
                  <kbd className="font-mono text-[10px] text-[#D6CFC5]">⌘&apos;</kbd>
                </button>
              </div>

              <div className="relative z-10 max-h-80 overflow-y-auto space-y-1">
                {filtered.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#D6CFC5]">
                    لا توجد أوامر مطابقة لبحثك &quot;{query}&quot;
                  </div>
                ) : (
                  filtered.map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        onClick={cmd.action}
                        className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-white/15 text-right transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-[#FFB84D] group-hover:border-[#FFB84D]/50">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="text-sm font-semibold text-[#FAF7F2] truncate">
                              {cmd.title}
                            </div>
                            <div className="text-xs text-[#D6CFC5] truncate">
                              {cmd.subtitle}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-[#D6CFC5]">
                            {cmd.category}
                          </span>
                          <ArrowUpLeft className="w-4 h-4 text-[#D6CFC5] group-hover:text-white" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


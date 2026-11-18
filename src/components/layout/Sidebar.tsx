import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Sparkles,
  ScanSearch,
  FilePenLine,
  MessageSquareCode,
  Kanban,
  Compass,
  FileUser,
  Briefcase,
  FileImage,
  FileSpreadsheet,
  Calculator,
  Wallet,
  BarChart3,
  Link2,
  UserCheck,
  Bell,
  Settings,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Plus,
  Sliders,
} from 'lucide-react';
import { ViewId } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import { useMotionSystem, EASE_OUT_EXPO } from '../../utils/motionVariants';
import { AppLogoIcon } from '../common/AppLogoIcon';

interface SidebarProps {
  activeView: ViewId;
  onSelectView: (view: ViewId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ViewId;
  labelAr: string;
  labelEn: string;
  icon: React.FC<{ className?: string }>;
  badgeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { isRTL, language } = useLanguage();
  const { projects, proposals, notifications } = useData();
  const { reducedMotion } = useMotionSystem();

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const secondaryIds: ViewId[] = [
    'project-analyzer',
    'pricing-calculator',
    'financials',
    'opportunities',
    'resume-analyzer',
    'portfolio',
    'file-analysis',
    'proposal-analytics',
    'google-forms',
    'platform-connections',
    'notifications',
    'user-guide',
  ];

  const [showMoreTools, setShowMoreTools] = useState<boolean>(
    secondaryIds.includes(activeView)
  );

  // 6 Core Primary Destinations + Clean Collapsible Secondary Tools
  const primaryNavItems: NavItem[] = [
    {
      id: 'overview',
      labelAr: 'مساحة العمل الذكية',
      labelEn: 'AI Workspace',
      icon: Sparkles,
    },
    {
      id: 'saved-projects',
      labelAr: 'مشاريعي (كانبان)',
      labelEn: 'My Projects',
      icon: Kanban,
      badgeCount: projects.length > 0 ? projects.length : undefined,
    },
    {
      id: 'proposal-studio',
      labelAr: 'العروض التنافسية',
      labelEn: 'Proposals',
      icon: FilePenLine,
      badgeCount: proposals.length > 0 ? proposals.length : undefined,
    },
    {
      id: 'profile',
      labelAr: 'الملف المهني والأعمال',
      labelEn: 'My Profile & Portfolio',
      icon: UserCheck,
    },
    {
      id: 'lens-chat',
      labelAr: 'Lens AI',
      labelEn: 'Lens AI',
      icon: MessageSquareCode,
    },
    {
      id: 'settings',
      labelAr: 'الإعدادات والزجاج السائل',
      labelEn: 'Liquid Glass & Settings',
      icon: Settings,
    },
  ];

  const secondaryNavItems: NavItem[] = [
    {
      id: 'project-analyzer',
      labelAr: 'محلل العقود المتقدم',
      labelEn: 'Contract Analyzer',
      icon: ScanSearch,
    },
    {
      id: 'pricing-calculator',
      labelAr: 'حاسبة التسعير',
      labelEn: 'Pricing Calculator',
      icon: Calculator,
    },
    {
      id: 'financials',
      labelAr: 'الأرباح والمالية',
      labelEn: 'Earnings & Finance',
      icon: Wallet,
    },
    {
      id: 'opportunities',
      labelAr: 'رادار الفرص',
      labelEn: 'Opportunities',
      icon: Compass,
    },
    {
      id: 'resume-analyzer',
      labelAr: 'محلل السيرة (CV)',
      labelEn: 'CV Analyzer',
      icon: FileUser,
    },
    {
      id: 'portfolio',
      labelAr: 'معرض الأعمال',
      labelEn: 'Portfolio',
      icon: Briefcase,
    },
    {
      id: 'file-analysis',
      labelAr: 'تحليل الملفات والصور',
      labelEn: 'File & Vision AI',
      icon: FileImage,
    },
    {
      id: 'proposal-analytics',
      labelAr: 'تحليلات العروض',
      labelEn: 'Proposal Analytics',
      icon: BarChart3,
    },
    {
      id: 'google-forms',
      labelAr: 'Google Workspace',
      labelEn: 'Google Workspace',
      icon: FileSpreadsheet,
    },
    {
      id: 'platform-connections',
      labelAr: 'ربط المنصات',
      labelEn: 'Platforms',
      icon: Link2,
    },
    {
      id: 'notifications',
      labelAr: 'التنبيهات',
      labelEn: 'Notifications',
      icon: Bell,
      badgeCount: unreadNotifs > 0 ? unreadNotifs : undefined,
    },
    {
      id: 'user-guide',
      labelAr: 'دليل الاستخدام',
      labelEn: 'User Guide',
      icon: BookOpen,
    },
  ];

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;
    const label = language === 'ar' ? item.labelAr : item.labelEn;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          onSelectView(item.id);
          onCloseMobile();
        }}
        title={isCollapsed ? label : undefined}
        className={`spring-btn relative w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-2xl text-xs whitespace-nowrap ${
          isActive
            ? 'text-white font-bold'
            : 'text-[#0F172A] dark:text-[#CBD5E1] font-semibold hover:text-[#090E1A] dark:hover:text-white hover:bg-white/75 dark:hover:bg-white/10'
        }`}
      >
        {isActive && (
          <motion.span
            layoutId="sidebar-active-pill"
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0066EE] to-[#0051D5] shadow-[0_6px_16px_rgba(0,102,204,0.34),inset_0_1px_1px_rgba(255,255,255,0.45)] -z-0"
          />
        )}
        <div className="relative z-10 flex items-center gap-2.5 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 ${
              isActive
                ? 'text-white'
                : 'text-[#0055D4] dark:text-[#60A5FA]'
            }`}
          />
          {!isCollapsed && <span className="truncate">{label}</span>}
        </div>
        {!isCollapsed && item.badgeCount !== undefined && (
          <span
            className={`relative z-10 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold tabular-nums ${
              isActive
                ? 'bg-white/25 text-white'
                : 'bg-[#0055D4]/15 dark:bg-[#60A5FA]/20 text-[#0055D4] dark:text-[#60A5FA]'
            }`}
          >
            {item.badgeCount}
          </span>
        )}
      </button>
    );
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full rounded-[26px] liquid-glass overflow-hidden select-none">
      {/* macOS Tahoe 26 Inspired Floating Sidebar Header (Matches Image 5) */}
      <div className="px-3.5 pt-3 pb-2.5 border-b border-slate-300/80 dark:border-white/10 space-y-2.5 shrink-0">
        {/* Top Window Dots & Collapse Toggle Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-2xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-2xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-2xs" />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={
                isCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'
              }
              className="hidden lg:flex p-1.5 rounded-xl text-[#334155] dark:text-[#94A3B8] hover:text-[#090E1A] dark:hover:text-white hover:bg-white/75 dark:hover:bg-white/10 transition-colors"
            >
              {isRTL ? (
                isCollapsed ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              ) : isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="إغلاق القائمة"
              className="lg:hidden p-1.5 rounded-xl text-[#334155] dark:text-[#94A3B8] hover:text-[#090E1A] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Brand Identity Button */}
        <button
          type="button"
          onClick={() => {
            onSelectView('overview');
            onCloseMobile();
          }}
          className="w-full flex items-center gap-2.5 text-right ltr:text-left focus:outline-none min-w-0"
        >
          <AppLogoIcon size="md" />

          {!isCollapsed && (
            <div className="truncate">
              <div className="font-display font-extrabold text-sm text-[#090E1A] dark:text-white tracking-tight truncate">
                Firework AI
              </div>
              <div className="text-[11px] font-semibold text-[#334155] dark:text-[#94A3B8] truncate">
                {language === 'ar' ? 'مساحة العمل الذكية' : 'AI Workspace'}
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Primary 6 Destinations + Clean Collapsible Secondary Tools */}
      <nav
        aria-label="التنقل الرئيسي"
        className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4 no-scrollbar"
      >
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#334155] dark:text-[#94A3B8]">
              {language === 'ar' ? 'مساحة العمل الأساسية' : 'Workspace'}
            </div>
          )}
          {primaryNavItems.map(renderNavItem)}
        </div>

        {/* Secondary / Specialized Tools Section */}
        <div className="pt-2.5 border-t border-slate-300/80 dark:border-white/10 space-y-1">
          {!isCollapsed ? (
            <button
              type="button"
              onClick={() => setShowMoreTools((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-bold text-[#1E293B] dark:text-[#94A3B8] hover:text-[#090E1A] dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
            >
              <span>
                {language === 'ar' ? 'الأدوات المتخصصة والدليل' : 'Tools & Guide'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showMoreTools ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
          ) : null}

          {(isCollapsed || showMoreTools) && (
            <div className="space-y-1 pt-0.5">
              {secondaryNavItems.map(renderNavItem)}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom macOS Tahoe Inspector / Quick Action Footer (Matches Image 5 bottom + / - bar) */}
      <div className="px-3 py-2.5 border-t border-slate-300/80 dark:border-white/10 flex items-center justify-between gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            onSelectView('overview');
            onCloseMobile();
          }}
          title={language === 'ar' ? 'تحليل مشروع جديد' : 'Analyze New Project'}
          className="spring-btn flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-full apple-capsule-bar text-[11px] font-semibold text-[#111827] dark:text-white"
        >
          <Plus className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
          {!isCollapsed && (
            <span className="truncate">
              {language === 'ar' ? 'تحليل جديد' : 'New Analysis'}
            </span>
          )}
        </button>

        {!isCollapsed && (
          <button
            type="button"
            onClick={() => {
              onSelectView('settings');
              onCloseMobile();
            }}
            title={language === 'ar' ? 'خصائص الزجاج السائل' : 'Liquid Glass Inspector'}
            className="spring-btn w-8 h-8 rounded-full apple-circle-glass flex items-center justify-center text-[#007AFF] dark:text-[#60A5FA] shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Floating Glass Sidebar (macOS Tahoe 26 Window Style) */}
      <aside
        className={`hidden lg:block shrink-0 p-2.5 transition-[width] duration-200 ease-out ${
          isCollapsed ? 'w-[84px]' : 'w-[262px]'
        }`}
      >
        <div className="sticky top-2.5 h-[calc(100vh-20px)]">
          {renderSidebarContent()}
        </div>
      </aside>

      {/* Mobile Floating Glass Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex p-2.5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: reducedMotion ? 0.01 : 0.18 } }}
              exit={{ opacity: 0, transition: { duration: reducedMotion ? 0.01 : 0.15 } }}
              className="fixed inset-0 bg-black/35 backdrop-blur-sm"
              onClick={onCloseMobile}
            />
            <motion.div
              initial={{
                opacity: 0,
                x: reducedMotion ? 0 : isRTL ? 40 : -40,
              }}
              animate={{
                opacity: 1,
                x: 0,
                transition: { duration: reducedMotion ? 0.01 : 0.22, ease: EASE_OUT_EXPO },
              }}
              exit={{
                opacity: 0,
                x: reducedMotion ? 0 : isRTL ? 40 : -40,
                transition: { duration: reducedMotion ? 0.01 : 0.16, ease: EASE_OUT_EXPO },
              }}
              className="relative w-68 max-w-[84vw] h-full z-10"
            >
              {renderSidebarContent()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

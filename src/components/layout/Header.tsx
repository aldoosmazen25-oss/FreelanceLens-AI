import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Search,
  Mic,
  Bell,
  Globe,
  Menu,
  UserCheck,
  BookOpen,
  MessageSquareCode,
  Sun,
  Moon,
  Timer,
  SlidersHorizontal,
  Sparkles,
  Calculator,
  RotateCcw,
  Eye,
  Volume2,
  X,
  ScanSearch,
  Kanban,
  FilePenLine,
  Settings,
  Compass,
  Plus,
} from 'lucide-react';
import { ViewId } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, Language } from '../../i18n/translations';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { calculateLiveSessionEarnings, VoiceTaskIntentResult } from '../../utils/calculations';
import { SiriOrbIcon } from '../voice/SiriOrbIcon';
import { AppLogoIcon } from '../common/AppLogoIcon';
import { DynamicIslandBar, DynamicIslandPhase } from './DynamicIslandBar';

interface HeaderProps {
  activeView: ViewId;
  onSelectView: (view: ViewId) => void;
  onOpenCommandPalette: () => void;
  onOpenVoiceModal: () => void;
  onToggleMobileMenu: () => void;
  onExecuteTaskIntent: (intent: VoiceTaskIntentResult, rawQuery: string) => void;
  dynamicIslandPhase?: DynamicIslandPhase | null;
  dynamicIslandMessage?: string | null;
  onStartTour?: () => void;
}

const VIEW_TITLES: Record<ViewId, { ar: string; en: string }> = {
  overview: { ar: 'مساحة العمل الذكية', en: 'AI Workspace' },
  'user-guide': { ar: 'دليل الاستخدام', en: 'User Guide' },
  'project-analyzer': { ar: 'محلل المشاريع والعقود', en: 'Contract Analyzer' },
  'proposal-studio': { ar: 'العروض التنافسية', en: 'Proposals' },
  'lens-chat': { ar: 'Lens AI', en: 'Lens AI' },
  'saved-projects': { ar: 'مشاريعي (كانبان)', en: 'My Projects' },
  opportunities: { ar: 'رادار الفرص', en: 'Opportunities' },
  'resume-analyzer': { ar: 'محلل السيرة (CV)', en: 'CV Analyzer' },
  portfolio: { ar: 'معرض الأعمال', en: 'Portfolio' },
  'file-analysis': { ar: 'تحليل الملفات والصور', en: 'File & Vision AI' },
  'google-forms': { ar: 'Google Workspace', en: 'Workspace' },
  'pricing-calculator': { ar: 'حاسبة التسعير', en: 'Pricing' },
  financials: { ar: 'الأرباح والمالية', en: 'Financials' },
  'proposal-analytics': { ar: 'تحليلات العروض', en: 'Proposal Analytics' },
  'platform-connections': { ar: 'ربط المنصات', en: 'Platforms' },
  profile: { ar: 'الملف المهني والأعمال', en: 'My Profile' },
  notifications: { ar: 'الإشعارات', en: 'Notifications' },
  settings: { ar: 'الإعدادات والزجاج السائل', en: 'Liquid Glass & Settings' },
};

const CONTEXTUAL_TABS: Array<{
  views: ViewId[];
  tabs: Array<{ id: ViewId; ar: string; en: string }>;
}> = [
  {
    views: ['saved-projects', 'opportunities', 'pricing-calculator', 'financials', 'google-forms'],
    tabs: [
      { id: 'saved-projects', ar: 'لوحة كانبان', en: 'Kanban' },
      { id: 'opportunities', ar: 'الفرص', en: 'Leads' },
      { id: 'pricing-calculator', ar: 'حاسبة التسعير', en: 'Pricing' },
      { id: 'financials', ar: 'المالية', en: 'Finance' },
      { id: 'google-forms', ar: 'Workspace', en: 'Workspace' },
    ],
  },
  {
    views: ['profile', 'portfolio', 'resume-analyzer'],
    tabs: [
      { id: 'profile', ar: 'الملف والمهارات', en: 'Profile & Skills' },
      { id: 'portfolio', ar: 'معرض الأعمال', en: 'Portfolio' },
      { id: 'resume-analyzer', ar: 'محلل السيرة CV', en: 'CV Analyzer' },
    ],
  },
  {
    views: ['proposal-studio', 'proposal-analytics'],
    tabs: [
      { id: 'proposal-studio', ar: 'توليد العروض', en: 'Proposal Studio' },
      { id: 'proposal-analytics', ar: 'تحليلات القبول', en: 'Analytics' },
    ],
  },
  {
    views: ['lens-chat', 'file-analysis'],
    tabs: [
      { id: 'lens-chat', ar: 'Lens AI Chat', en: 'Lens AI Chat' },
      { id: 'file-analysis', ar: 'تحليل الملفات والصور', en: 'File & Vision AI' },
    ],
  },
  {
    views: ['settings', 'platform-connections', 'user-guide'],
    tabs: [
      { id: 'settings', ar: 'الزجاج السائل والإعدادات', en: 'Liquid Glass' },
      { id: 'platform-connections', ar: 'ربط المنصات', en: 'Platforms' },
      { id: 'user-guide', ar: 'دليل الاستخدام', en: 'User Guide' },
    ],
  },
];

const NATIVE_WINDOW_TABS: Array<{ id: ViewId; ar: string; en: string }> = [
  { id: 'overview', ar: 'الرئيسية', en: 'Workspace' },
  { id: 'project-analyzer', ar: 'المحلل', en: 'Analyzer' },
  { id: 'proposal-studio', ar: 'العروض', en: 'Proposals' },
  { id: 'lens-chat', ar: 'Lens AI', en: 'Lens AI' },
  { id: 'profile', ar: 'الملف المهني', en: 'Profile' },
];

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  onOpenCommandPalette,
  onOpenVoiceModal,
  onToggleMobileMenu,
  onExecuteTaskIntent,
  dynamicIslandPhase,
  dynamicIslandMessage,
  onStartTour,
}) => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    focusSeconds,
    isFocusRunning,
    toggleFocusTimer,
    resetFocusTimer,
    uiSettings,
    updateUISettings,
    resetUISettings,
  } = useLanguage();
  const { notifications, userProfile, projects, setWorkStatus } = useData();
  const { setIsAccountModalOpen } = useAuth();

  const [isControlCenterOpen, setIsControlCenterOpen] = useState<boolean>(false);
  const [specularEnabled, setSpecularEnabled] = useState<boolean>(true);
  const [isHiddenOnScroll, setIsHiddenOnScroll] = useState<boolean>(false);
  const lastScrollYRef = useRef<number>(0);
  const controlCenterRef = useRef<HTMLDivElement | null>(null);

  // Top mobile capsule bar drag-to-scroll refs
  const topMobileScrollRef = useRef<HTMLDivElement | null>(null);
  const isTopDragging = useRef<boolean>(false);
  const topDragStartX = useRef<number>(0);
  const topScrollStartLeft = useRef<number>(0);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentTitle =
    language === 'ar'
      ? VIEW_TITLES[activeView]?.ar || VIEW_TITLES.overview.ar
      : VIEW_TITLES[activeView]?.en || VIEW_TITLES.overview.en;

  const liveSession = calculateLiveSessionEarnings(
    focusSeconds,
    userProfile.hourlyRate
  );

  const activeTabGroup = CONTEXTUAL_TABS.find((group) =>
    group.views.includes(activeView)
  );

  // Hide-on-scroll header: slides out (translateY(-100%)) on scroll down and back on any scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const prevY = lastScrollYRef.current;
      if (currentY > 90 && currentY > prevY + 6 && !isControlCenterOpen) {
        setIsHiddenOnScroll(true);
      } else if (currentY < prevY - 4 || currentY <= 60) {
        setIsHiddenOnScroll(false);
      }
      lastScrollYRef.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isControlCenterOpen]);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-specular',
      specularEnabled ? 'on' : 'off'
    );
  }, [specularEnabled]);

  useEffect(() => {
    if (!isControlCenterOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        controlCenterRef.current &&
        !controlCenterRef.current.contains(e.target as Node)
      ) {
        setIsControlCenterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isControlCenterOpen]);

  const handleTopBarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!topMobileScrollRef.current) return;
    isTopDragging.current = true;
    topDragStartX.current = e.clientX;
    topScrollStartLeft.current = topMobileScrollRef.current.scrollLeft;
  };

  const handleTopBarPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTopDragging.current || !topMobileScrollRef.current) return;
    const dx = e.clientX - topDragStartX.current;
    topMobileScrollRef.current.scrollLeft = topScrollStartLeft.current - dx;
  };

  const handleTopBarPointerUp = () => {
    isTopDragging.current = false;
  };

  const mobileTopCapsules: Array<{
    id: ViewId | 'voice';
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }> = [
    {
      id: 'overview',
      label: language === 'ar' ? 'الرئيسية' : 'Workspace',
      icon: Sparkles,
    },
    {
      id: 'project-analyzer',
      label: language === 'ar' ? 'المحلل' : 'Analyzer',
      icon: ScanSearch,
    },
    {
      id: 'voice',
      label: 'Lens Voice',
      icon: Mic,
    },
    {
      id: 'lens-chat',
      label: 'Lens AI',
      icon: MessageSquareCode,
    },
    {
      id: 'saved-projects',
      label: language === 'ar' ? 'مشاريعي' : 'Projects',
      icon: Kanban,
      badge: projects.length > 0 ? projects.length : undefined,
    },
    {
      id: 'proposal-studio',
      label: language === 'ar' ? 'العروض' : 'Proposals',
      icon: FilePenLine,
    },
    {
      id: 'user-guide',
      label: language === 'ar' ? 'الدليل' : 'Guide',
      icon: BookOpen,
    },
    {
      id: 'profile',
      label: language === 'ar' ? 'ملفي' : 'Profile',
      icon: UserCheck,
    },
    {
      id: 'settings',
      label: language === 'ar' ? 'الإعدادات' : 'Settings',
      icon: Settings,
    },
  ];

  return (
    <header
      data-testid="hide-on-scroll-header"
      className={`sticky top-0 z-30 px-2.5 sm:px-5 lg:px-7 pt-2 pb-1.5 max-w-[1440px] w-full mx-auto space-y-2 transition-transform duration-200 ${
        isHiddenOnScroll ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Top Center iOS Dynamic Island with Integrated Cool Glass Search & Voice Task Execution */}
      <DynamicIslandBar
        activeView={activeView}
        onSelectView={onSelectView}
        onOpenVoiceModal={onOpenVoiceModal}
        onExecuteTaskIntent={onExecuteTaskIntent}
        externalPhase={dynamicIslandPhase}
        externalMessage={dynamicIslandMessage}
      />

      {/* =====================================================================
          NATIVE MAC WINDOW CHROME (NSWindow Titlebar + NSToolbar + NSTitlebarAccessoryViewController)
         ===================================================================== */}
      <div className="rounded-2xl glassmorphic-panel liquid-glass overflow-visible">
        {/* 1. Draggable NSWindow Title-Bar Region distinguished from NSWindow.title + Native Window Tabs */}
        <div
          data-window-drag-region="true"
          className="nswindow-titlebar-drag hidden sm:flex items-center justify-between gap-4 px-3.5 py-1.5 border-b border-black/10 dark:border-white/20 text-xs"
        >
          {/* Traffic Light Window Controls + NSWindow.title */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              aria-label="macOS Window Controls"
              className="nswindow-no-drag flex items-center gap-1.5 shrink-0"
            >
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/15 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/15 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/15 inline-block" />
            </div>

            <div role="separator" aria-orientation="vertical" />

            <span
              data-testid="nswindow-title"
              className="font-semibold text-[#090E1A] dark:text-white truncate"
            >
              Firework AI — {currentTitle}
            </span>
          </div>

          {/* Native Window Tab Bar (Preserves native window tabs) */}
          <div
            role="tablist"
            aria-label="Window Tabs"
            className="nswindow-no-drag flex items-center gap-1 overflow-x-auto no-scrollbar"
          >
            {NATIVE_WINDOW_TABS.map((wTab) => {
              const isTabActive = activeView === wTab.id;
              return (
                <button
                  key={wTab.id}
                  type="button"
                  role="tab"
                  aria-selected={isTabActive}
                  onClick={() => onSelectView(wTab.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isTabActive
                      ? 'bg-white/90 dark:bg-white/15 text-[#007AFF] dark:text-[#38BDF8] shadow-2xs'
                      : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#090E1A] dark:hover:text-white'
                  }`}
                >
                  {language === 'ar' ? wTab.ar : wTab.en}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onSelectView('project-analyzer')}
              aria-label="New Window Tab"
              className="p-1 rounded-md text-[#475569] dark:text-[#94A3B8] hover:text-[#090E1A] dark:hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* NSTitlebarAccessoryViewController Custom Titlebar Accessory Controls */}
          <div
            data-testid="nstitlebar-accessory"
            className="nswindow-no-drag flex items-center gap-2 shrink-0"
          >
            {onStartTour && (
              <button
                type="button"
                onClick={onStartTour}
                data-tour-id="tour-launch"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#007AFF]/15 hover:bg-[#007AFF]/25 text-[#0055D4] dark:text-[#38BDF8] text-[11px] font-semibold transition-colors whitespace-nowrap"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'جولة تعريفية' : 'Product Tour'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Unified NSToolbar Chrome with structural role="separator" between control groups */}
        <div
          role="toolbar"
          aria-label="Unified Workspace Toolbar"
          className="relative px-2.5 sm:px-4 py-1.5 flex items-center justify-between gap-2"
        >
          {/* Start: Mobile Drawer Button + Current View Pill (never overlaps right controls) */}
          <div className="flex items-center gap-2 min-w-0 shrink">
            <button
              type="button"
              onClick={onToggleMobileMenu}
              aria-label="فتح القائمة الجانبية"
              className="lg:hidden w-9 h-9 rounded-full apple-circle-glass flex items-center justify-center text-[#111827] dark:text-white shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 min-w-0 px-1.5 py-1 rounded-full">
              <button
                type="button"
                onClick={() => onSelectView('overview')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007AFF] dark:text-[#60A5FA] hover:underline whitespace-nowrap shrink-0"
              >
                <AppLogoIcon size="xs" />
                <span className="hidden sm:inline">Firework AI</span>
              </button>
              <span className="text-[#5B6474] dark:text-[#94A3B8] hidden md:inline shrink-0">·</span>
              <h1 className="font-display font-bold text-xs sm:text-sm text-[#111827] dark:text-white truncate max-w-[140px] md:max-w-[190px]">
                {currentTitle}
              </h1>
            </div>
          </div>

          {/* End: NSToolbar Control Groups separated by role="separator" — fits cleanly on 1440px without clipping */}
          <div className="flex items-center gap-1.5 shrink-0 py-0.5">
            {/* Group 1: Search & AI Assistants */}
            <button
              type="button"
              onClick={onOpenCommandPalette}
              aria-label="البحث السريع"
              className="spring-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full apple-capsule-active text-xs text-[#374151] dark:text-[#CBD5E1] hover:text-[#111827] dark:hover:text-white whitespace-nowrap shrink-0"
            >
              <Search className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
              <span className="hidden 2xl:inline font-medium">
                {language === 'ar' ? 'بحث في مساحة العمل...' : 'Search workspace...'}
              </span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.1] font-mono text-[10px] text-[#5B6474] dark:text-[#94A3B8]">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={onOpenVoiceModal}
              data-tour-id="tour-voice-orb"
              aria-label="Open Lens Voice Live Assistant"
              className="spring-btn inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1 rounded-full cool-glass-spotlight-bar text-white font-bold text-xs whitespace-nowrap shrink-0 shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
            >
              <SiriOrbIcon size="xs" status="idle" />
              <span>Lens Voice</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView('lens-chat')}
              aria-label="Open Lens AI Smart Chat"
              className={`spring-btn hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${
                activeView === 'lens-chat'
                  ? 'apple-capsule-active text-[#007AFF] dark:text-[#60A5FA]'
                  : 'apple-circle-glass text-[#111827] dark:text-white'
              }`}
            >
              <MessageSquareCode className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
              <span>Lens AI</span>
            </button>

            {/* Structural Separator between AI group and Appearance/System group */}
            <div role="separator" aria-orientation="vertical" className="hidden sm:block mx-0.5" />

            {/* Group 2: Language, Appearance & Glass Control */}
            <div className="hidden sm:inline-flex items-center rounded-full apple-circle-glass px-2.5 py-1 shrink-0">
              <Globe className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA] shrink-0 mx-1" />
              <select
                aria-label="اختيار لغة الواجهة"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-semibold text-[#111827] dark:text-white focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className="bg-white dark:bg-[#0F172A] text-[#111827] dark:text-white"
                  >
                    {lang.shortLabel} · {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark' ? 'التبديل إلى النمط الفاتح' : 'التبديل إلى النمط الداكن'
              }
              className="spring-btn w-8 h-8 rounded-full apple-circle-glass flex items-center justify-center text-[#111827] dark:text-white shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#007AFF]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsControlCenterOpen((prev) => !prev)}
              aria-label="مركز التحكم وخصائص الزجاج السائل"
              title={language === 'ar' ? 'مركز التحكم والزجاج السائل' : 'Liquid Glass Control Center'}
              className={`spring-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold shrink-0 ${
                isControlCenterOpen
                  ? 'bg-[#007AFF] text-white shadow-[0_4px_12px_rgba(0,122,255,0.35)]'
                  : 'apple-circle-glass text-[#111827] dark:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden 2xl:inline">
                {language === 'ar' ? 'الزجاج والتحكم' : 'Glass Control'}
              </span>
            </button>

            {/* Structural Separator between System group and Account/Notifications group */}
            <div role="separator" aria-orientation="vertical" className="hidden sm:block mx-0.5" />

            {/* Group 3: Work/Sleep Live Mode, Notifications & User Account */}
            <button
              type="button"
              data-testid="header-work-status-pill"
              onClick={() =>
                void setWorkStatus(
                  userProfile.workStatus === 'sleep' ? 'work' : 'sleep'
                )
              }
              aria-label={
                userProfile.workStatus === 'sleep'
                  ? 'وضع الهدوء Sleep — انقر للتبديل إلى Work'
                  : 'وضع العمل Work — انقر للتبديل إلى Sleep'
              }
              className={`spring-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 border transition-colors ${
                userProfile.workStatus === 'sleep'
                  ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-700 dark:text-indigo-300'
                  : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  userProfile.workStatus === 'sleep'
                    ? 'bg-indigo-400'
                    : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span>
                {userProfile.workStatus === 'sleep' ? 'Sleep' : 'Work'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView('notifications')}
              aria-label={`الإشعارات (${unreadCount})`}
              className="spring-btn relative w-8 h-8 rounded-full apple-circle-glass flex items-center justify-center text-[#111827] dark:text-white shrink-0"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 min-w-[16px] h-4 rounded-full bg-[#FF3B30] text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsAccountModalOpen(true)}
              aria-label="إعدادات الحساب"
              className="spring-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full apple-circle-glass text-xs font-semibold text-[#111827] dark:text-white whitespace-nowrap shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
              <span className="max-w-[78px] truncate hidden md:inline">
                {userProfile.name || (language === 'ar' ? 'حسابي' : 'Account')}
              </span>
            </button>
          </div>

        {/* ===================================================================
            macOS TAHOE 26 CONTROL CENTER & LIQUID GLASS INSPECTOR POPOVER
            Directly inspired by Image 5 (Liquid Glass Inspector) & Image 6 (Tahoe Control Center)
           =================================================================== */}
        <AnimatePresence>
          {isControlCenterOpen && (
            <motion.div
              ref={controlCenterRef}
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute top-[calc(100%+10px)] left-2 ltr:left-auto ltr:right-2 w-[330px] sm:w-[360px] rounded-[30px] liquid-glass-hot p-4 z-50 space-y-3.5 shadow-[0_24px_60px_rgba(15,35,75,0.28)]"
            >
              {/* Popover Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#007AFF] dark:text-[#60A5FA]" />
                  <span className="text-xs font-bold text-[#111827] dark:text-white">
                    {language === 'ar'
                      ? 'مركز التحكم · الزجاج السائل'
                      : 'Control Center · Liquid Glass'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsControlCenterOpen(false)}
                  className="w-7 h-7 rounded-full apple-circle-glass flex items-center justify-center text-[#5B6474] dark:text-[#94A3B8]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Top Bento Tiles (Matches Image 6 Wi-Fi / Focus / Circular Toggles) */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Focus Session Pill Tile */}
                <button
                  type="button"
                  onClick={toggleFocusTimer}
                  className="p-3 rounded-[22px] apple-capsule-bar flex items-center gap-2.5 text-right ltr:text-left"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isFocusRunning
                        ? 'bg-[#007AFF] text-white'
                        : 'bg-white/80 dark:bg-white/15 text-[#007AFF] dark:text-[#60A5FA]'
                    }`}
                  >
                    <Timer className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#111827] dark:text-white truncate">
                      {language === 'ar' ? 'التركيز Focus' : 'Focus Timer'}
                    </div>
                    <div className="font-mono text-[11px] text-[#007AFF] dark:text-[#60A5FA]">
                      {liveSession.formattedTime}
                    </div>
                  </div>
                </button>

                {/* Lens Voice Live Tile */}
                <button
                  type="button"
                  onClick={() => {
                    setIsControlCenterOpen(false);
                    onOpenVoiceModal();
                  }}
                  className="p-3 rounded-[22px] apple-capsule-bar flex items-center gap-2.5 text-right ltr:text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-[#007AFF] text-white flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#111827] dark:text-white truncate">
                      Lens Voice
                    </div>
                    <div className="text-[10px] text-[#5B6474] dark:text-[#94A3B8] truncate">
                      {language === 'ar' ? 'صوت مباشر' : 'Live Audio'}
                    </div>
                  </div>
                </button>
              </div>

              {/* Apple Icon Composer Liquid Glass Inspector Controls (Matches Image 5 & Image 6 Sliders) */}
              <div className="p-3.5 rounded-[24px] apple-capsule-bar space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#111827] dark:text-white">
                  <span>
                    {language === 'ar' ? 'خصائص الزجاج السائل (Liquid Glass)' : 'Liquid Glass Physics'}
                  </span>
                  <span className="font-mono text-[10px] text-[#007AFF] dark:text-[#60A5FA]">
                    Individual
                  </span>
                </div>

                {/* Specular Toggle Row */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#374151] dark:text-[#CBD5E1] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
                    <span>{language === 'ar' ? 'انعكاس الحواف (Specular)' : 'Specular Rim'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSpecularEnabled((prev) => !prev)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                      specularEnabled ? 'bg-[#007AFF]' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        specularEnabled
                          ? language === 'ar'
                            ? '-translate-x-5'
                            : 'translate-x-5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Blur Pill Slider (Matches Image 6 "Display" slider) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#374151] dark:text-[#CBD5E1]">
                      {language === 'ar' ? 'الضبابية (Blur)' : 'Blur Refraction'}
                    </span>
                    <span className="font-mono font-bold text-[#007AFF] dark:text-[#60A5FA]">
                      {uiSettings.glassBlur}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={72}
                    value={uiSettings.glassBlur}
                    onChange={(e) =>
                      updateUISettings({ glassBlur: Number(e.target.value) })
                    }
                    className="w-full accent-[#007AFF] cursor-pointer h-2 rounded-full"
                  />
                </div>

                {/* Translucency Pill Slider (Matches Image 5 "Translucency 50%") */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#374151] dark:text-[#CBD5E1]">
                      {language === 'ar' ? 'الشفافية (Translucency)' : 'Translucency'}
                    </span>
                    <span className="font-mono font-bold text-[#007AFF] dark:text-[#60A5FA]">
                      {uiSettings.glassOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={95}
                    value={uiSettings.glassOpacity}
                    onChange={(e) =>
                      updateUISettings({ glassOpacity: Number(e.target.value) })
                    }
                    className="w-full accent-[#007AFF] cursor-pointer h-2 rounded-full"
                  />
                </div>
              </div>

              {/* Bottom 4 Circular Glass Action Orbs (Matches bottom of Image 6 Control Center) */}
              <div className="grid grid-cols-4 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={language === 'ar' ? 'تبديل الإضاءة' : 'Toggle Theme'}
                  className="h-11 rounded-full apple-circle-glass flex items-center justify-center text-[#007AFF] dark:text-[#60A5FA]"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsControlCenterOpen(false);
                    onSelectView('pricing-calculator');
                  }}
                  title={language === 'ar' ? 'حاسبة التسعير' : 'Pricing Calculator'}
                  className="h-11 rounded-full apple-circle-glass flex items-center justify-center text-[#007AFF] dark:text-[#60A5FA]"
                >
                  <Calculator className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={resetFocusTimer}
                  title={language === 'ar' ? 'تصفير المؤقت' : 'Reset Timer'}
                  className="h-11 rounded-full apple-circle-glass flex items-center justify-center text-[#007AFF] dark:text-[#60A5FA]"
                >
                  <Timer className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={resetUISettings}
                  title={language === 'ar' ? 'إعادة ضبط الزجاج' : 'Reset Glass'}
                  className="h-11 rounded-full apple-circle-glass flex items-center justify-center text-[#007AFF] dark:text-[#60A5FA]"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom "Edit Controls" Pill Button (Matches Image 6) */}
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsControlCenterOpen(false);
                    onSelectView('settings');
                  }}
                  className="px-4 py-1 rounded-full apple-capsule-bar text-[11px] font-semibold text-[#007AFF] dark:text-[#60A5FA] hover:underline"
                >
                  {language === 'ar'
                    ? 'فتح استوديو الإعدادات الكامل'
                    : 'Edit Liquid Glass & UI Controls'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      {/* =====================================================================
          TOP MOBILE / TABLET SCROLLABLE LIQUID GLASS CAPSULE STRIP
          ("السكرول في نسخة الهاتف التي فوق" + Matches Image 2 segmented pills)
         ===================================================================== */}
      <div className="lg:hidden mt-2">
        <div
          ref={topMobileScrollRef}
          onPointerDown={handleTopBarPointerDown}
          onPointerMove={handleTopBarPointerMove}
          onPointerUp={handleTopBarPointerUp}
          onPointerLeave={handleTopBarPointerUp}
          aria-label="شريط التنقل العلوي القابل للتمرير للهاتف"
          className="w-full rounded-full apple-capsule-bar p-1 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x select-none"
        >
          {mobileTopCapsules.map((item) => {
            const Icon = item.icon;
            const isSelected =
              item.id !== 'voice' && activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'voice') {
                    onOpenVoiceModal();
                  } else {
                    onSelectView(item.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? 'apple-capsule-active text-[#007AFF] dark:text-[#60A5FA] shadow-xs'
                    : item.id === 'voice'
                    ? 'bg-[#007AFF]/12 dark:bg-[#60A5FA]/20 text-[#007AFF] dark:text-[#60A5FA]'
                    : 'text-[#374151] dark:text-[#CBD5E1]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#007AFF] text-white font-mono text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Contextual Sub-Tabs when inside a multi-view group */}
      {activeTabGroup && (
        <div className="hidden lg:flex mt-2 rounded-full apple-capsule-bar p-1 items-center gap-1 overflow-x-auto no-scrollbar w-fit">
          {activeTabGroup.tabs.map((tab) => {
            const isSelected = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectView(tab.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? 'apple-capsule-active text-[#007AFF] dark:text-[#60A5FA]'
                    : 'text-[#5B6474] dark:text-[#94A3B8]'
                }`}
              >
                {language === 'ar' ? tab.ar : tab.en}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

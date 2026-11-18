import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Sparkles,
  ScanSearch,
  FilePenLine,
  Calculator,
  MessageSquareCode,
  BookOpen,
  UserCheck,
  Search,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Moon,
  Globe,
  Wallet,
  Activity,
} from 'lucide-react';
import { ViewId } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  calculateLiveSessionEarnings,
  calculateFinancialSummary,
  resolveSwipeDirection,
} from '../../utils/calculations';

interface DynamicIslandProps {
  activeView: ViewId;
  onSelectView: (view: ViewId) => void;
  onOpenVoiceModal: () => void;
  onOpenCommandPalette: () => void;
}

type IslandTab = 'launch' | 'timer' | 'pulse' | 'theme';

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  activeView,
  onSelectView,
  onOpenVoiceModal,
  onOpenCommandPalette,
}) => {
  const {
    t,
    language,
    toggleLanguage,
    theme,
    setTheme,
    toggleTheme,
    focusSeconds,
    isFocusRunning,
    toggleFocusTimer,
    resetFocusTimer,
    uiSettings,
  } = useLanguage();
  const { userProfile, projects, opportunities, financials } = useData();
  const { setIsAccountModalOpen } = useAuth();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<IslandTab>('launch');
  const [recentTransitionLabel, setRecentTransitionLabel] = useState<string | null>(
    null
  );

  const gestureStart = useRef<{ x: number; y: number } | null>(null);

  // Morph briefly when activeView changes
  useEffect(() => {
    const viewKey = `nav_${activeView.replace(/-/g, '_')}`;
    const label = t(viewKey);
    setRecentTransitionLabel(label);
    const timer = setTimeout(() => {
      setRecentTransitionLabel(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, [activeView, language]);

  if (!uiSettings.showDynamicIsland) return null;

  const activeProjectsCount = projects.filter(
    (p) => p.status === 'in_progress' || p.status === 'proposed'
  ).length;

  const liveSession = calculateLiveSessionEarnings(
    focusSeconds,
    userProfile.hourlyRate
  );
  const finSummary = calculateFinancialSummary(financials);

  const islandQuickActions = [
    {
      id: 'overview' as ViewId,
      labelAr: 'الرئيسية',
      labelEn: 'Home',
      icon: LayoutDashboard,
      color: 'text-[#2be38a]',
      onClick: () => {
        onSelectView('overview');
        setIsExpanded(false);
      },
    },
    {
      id: 'voice',
      labelAr: 'Lens Voice',
      labelEn: 'Lens Voice',
      icon: Mic,
      color: 'text-[#ff6b7f]',
      onClick: () => {
        setIsExpanded(false);
        onOpenVoiceModal();
      },
    },
    {
      id: 'project-analyzer' as ViewId,
      labelAr: 'محلل العقود',
      labelEn: 'Analyzer',
      icon: ScanSearch,
      color: 'text-[#2be38a]',
      onClick: () => {
        onSelectView('project-analyzer');
        setIsExpanded(false);
      },
    },
    {
      id: 'lens-chat' as ViewId,
      labelAr: 'Lens AI',
      labelEn: 'Lens AI',
      icon: MessageSquareCode,
      color: 'text-[#62d9ff]',
      onClick: () => {
        onSelectView('lens-chat');
        setIsExpanded(false);
      },
    },
    {
      id: 'proposal-studio' as ViewId,
      labelAr: 'العروض',
      labelEn: 'Proposals',
      icon: FilePenLine,
      color: 'text-[#ffc15a]',
      onClick: () => {
        onSelectView('proposal-studio');
        setIsExpanded(false);
      },
    },
    {
      id: 'pricing-calculator' as ViewId,
      labelAr: 'التسعير',
      labelEn: 'Pricing',
      icon: Calculator,
      color: 'text-[#2be38a]',
      onClick: () => {
        onSelectView('pricing-calculator');
        setIsExpanded(false);
      },
    },
    {
      id: 'user-guide' as ViewId,
      labelAr: 'الدليل',
      labelEn: 'Guide',
      icon: BookOpen,
      color: 'text-[#62d9ff]',
      onClick: () => {
        onSelectView('user-guide');
        setIsExpanded(false);
      },
    },
    {
      id: 'cmd',
      labelAr: 'الأوامر',
      labelEn: 'Search',
      icon: Search,
      color: 'text-[#effaf4]',
      onClick: () => {
        setIsExpanded(false);
        onOpenCommandPalette();
      },
    },
  ];

  const tabsOrder: IslandTab[] = ['launch', 'timer', 'pulse', 'theme'];

  const handlePointerDown = (e: React.PointerEvent) => {
    gestureStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!gestureStart.current) return;
    const dx = e.clientX - gestureStart.current.x;
    const dy = e.clientY - gestureStart.current.y;
    gestureStart.current = null;
    const dir = resolveSwipeDirection(dx, dy, 32);
    if (dir === 'down' && !isExpanded) {
      setIsExpanded(true);
    } else if (dir === 'up' && isExpanded) {
      setIsExpanded(false);
    } else if (isExpanded && (dir === 'left' || dir === 'right')) {
      const idx = tabsOrder.indexOf(activeTab);
      const nextIdx =
        dir === 'left'
          ? (idx + 1) % tabsOrder.length
          : (idx - 1 + tabsOrder.length) % tabsOrder.length;
      setActiveTab(tabsOrder[nextIdx]);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center pt-2.5 pb-1 px-3 z-30 select-none">
      {/* Multi-Island Floating Cluster */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-full">
        {/* Left Mini Dynamic Island: Live Rate & Focus Timer */}
        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            setActiveTab('timer');
          }}
          className="spring-btn hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full dynamic-island-glass text-[11px] text-[#a4c2b4] hover:text-[#effaf4]"
        >
          <Timer
            className={`w-3.5 h-3.5 ${
              isFocusRunning ? 'text-[#2be38a] animate-spin' : 'text-[#2be38a]'
            }`}
          />
          <span dir="ltr" className="font-mono font-bold text-[#2be38a]">
            {focusSeconds > 0
              ? `${liveSession.formattedTime} ($${liveSession.earnedUsd})`
              : `$${userProfile.hourlyRate}/hr`}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {language === 'ar'
              ? `${activeProjectsCount} مشاريع نشطة`
              : `${activeProjectsCount} Active`}
          </span>
        </button>

        {/* Center Main Morphing Dynamic Island with Gesture Support */}
        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className={`dynamic-island-glass ${
            theme === 'dark' ? 'animate-island-glow' : ''
          } overflow-hidden transition-all duration-200 ${
            isExpanded
              ? 'rounded-3xl px-4 py-3.5 w-[94vw] max-w-2xl'
              : 'rounded-full px-4 py-1.5'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2.5 text-right flex-1"
            >
              {/* Living Mini Lens Orb inside Dynamic Island */}
              <div className="relative w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#2be38a] via-[#62d9ff] to-[#07120d] animate-[spin_6s_linear_infinite]" />
                <div className="relative w-3 h-3 rounded-full bg-[#020504] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white animate-lens-glint" />
                </div>
              </div>

              {recentTransitionLabel ? (
                <div
                  key={recentTransitionLabel}
                  className="animate-view-enter flex items-center gap-1.5 text-xs font-bold text-[#2be38a] whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{recentTransitionLabel}</span>
                </div>
              ) : (
                <div className="animate-view-enter flex items-center gap-1.5 text-xs font-semibold text-[#effaf4] whitespace-nowrap">
                  <span className="text-[#2be38a] font-bold">
                    Lens AI
                  </span>
                  <span className="text-[#6c8a7d]">|</span>
                  <span className="text-[11px] text-[#effaf4]">
                    {!userProfile.name || userProfile.name === 'مازن الدوس'
                      ? language === 'ar'
                        ? 'مازن الدوس'
                        : 'Mazen Aldoos'
                      : userProfile.name}
                  </span>
                  {focusSeconds > 0 && (
                    <span className="font-mono text-[10px] text-[#62d9ff] px-1.5 py-0.5 rounded-full bg-white/[0.06]">
                      {liveSession.formattedTime}
                    </span>
                  )}
                </div>
              )}
            </button>

            {/* Quick Voice + Theme + Expand Toggle */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  theme === 'dark'
                    ? 'تحويل للنمط الفاتح من الجزيرة الديناميكية'
                    : 'تحويل للنمط الداكن من الجزيرة الديناميكية'
                }
                className="p-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-[#ffc15a] transition-all"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3 h-3" />
                ) : (
                  <Moon className="w-3 h-3 text-[#0369a1]" />
                )}
              </button>

              <button
                type="button"
                onClick={onOpenVoiceModal}
                aria-label="تشغيل لينز إيه آي الصوتي"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2be38a]/20 hover:bg-[#2be38a] text-[#2be38a] hover:text-[#020504] text-[10px] font-bold transition-all"
              >
                <Mic className="w-3 h-3" />
                <span className="hidden xs:inline">
                  {language === 'ar' ? 'صوتي' : 'Voice'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={
                  isExpanded
                    ? 'طي الجزيرة الديناميكية'
                    : 'توسيع الجزيرة الديناميكية'
                }
                className="p-1 rounded-full bg-white/[0.06] hover:bg-white/[0.14] text-[#a4c2b4] hover:text-[#effaf4]"
              >
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Expanded Multi-Mode Dynamic Island Hub */}
          {isExpanded && (
            <div className="animate-view-enter pt-3.5 mt-3 border-t border-white/15 space-y-3">
              {/* Segmented Mode Switcher inside Dynamic Island */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/35 border border-white/10">
                  {[
                    {
                      id: 'launch' as IslandTab,
                      labelAr: 'الإطلاق السريع',
                      labelEn: 'Quick Launch',
                      icon: LayoutDashboard,
                    },
                    {
                      id: 'timer' as IslandTab,
                      labelAr: 'مؤقت التركيز والأجر',
                      labelEn: 'Focus & Rate Timer',
                      icon: Timer,
                    },
                    {
                      id: 'pulse' as IslandTab,
                      labelAr: 'النبض المالي والذكي',
                      labelEn: 'AI & Cash Pulse',
                      icon: Activity,
                    },
                    {
                      id: 'theme' as IslandTab,
                      labelAr: 'النمط واللغة',
                      labelEn: 'Theme & Lang',
                      icon: Sun,
                    },
                  ].map((tb) => {
                    const TabIcon = tb.icon;
                    const isAct = activeTab === tb.id;
                    return (
                      <button
                        key={tb.id}
                        type="button"
                        onClick={() => setActiveTab(tb.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap ${
                          isAct
                            ? 'bg-[#2be38a] text-[#020504] font-bold shadow-sm'
                            : 'text-[#a4c2b4] hover:text-[#effaf4]'
                        }`}
                      >
                        <TabIcon className="w-3 h-3" />
                        <span>{language === 'ar' ? tb.labelAr : tb.labelEn}</span>
                      </button>
                    );
                  })}
                </div>

                <span className="font-mono text-[11px] text-[#2be38a]">
                  {projects.length}{' '}
                  {language === 'ar' ? 'مشاريع' : 'Projects'} ·{' '}
                  {opportunities.length}{' '}
                  {language === 'ar' ? 'فرص' : 'Leads'}
                </span>
              </div>

              {/* Mode 1: Quick Launch Grid */}
              {activeTab === 'launch' && (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 animate-view-enter">
                  {islandQuickActions.map((act) => {
                    const Icon = act.icon;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={act.onClick}
                        className="spring-icon-tile flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-2xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10"
                      >
                        <Icon className={`w-4 h-4 ${act.color}`} />
                        <span className="text-[10px] font-medium text-[#effaf4] whitespace-nowrap leading-tight">
                          {language === 'ar' ? act.labelAr : act.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Mode 2: Live Focus & Billable Earnings Timer */}
              {activeTab === 'timer' && (
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/12 flex flex-col sm:flex-row items-center justify-between gap-4 animate-view-enter">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#2be38a]/20 border border-[#2be38a]/40 flex items-center justify-center text-[#2be38a]">
                      <Timer className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#effaf4]">
                        {language === 'ar'
                          ? 'مؤقت جلسة العمل الحر وحساب الأجر الفوري'
                          : 'Live Freelance Focus & Billable Timer'}
                      </div>
                      <div className="flex items-center gap-3 mt-1 font-mono text-sm">
                        <span className="text-[#2be38a] font-bold">
                          {liveSession.formattedTime}
                        </span>
                        <span className="text-[#6c8a7d]">·</span>
                        <span dir="ltr" className="text-[#62d9ff] font-bold">
                          ${liveSession.earnedUsd.toFixed(2)} USD
                        </span>
                        <span className="text-[11px] text-[#a4c2b4]">
                          (${userProfile.hourlyRate}/hr)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleFocusTimer}
                      className="spring-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2be38a] text-[#020504] font-bold text-xs"
                    >
                      {isFocusRunning ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'إيقاف مؤقت' : 'Pause'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>
                            {language === 'ar' ? 'بدء الجلسة' : 'Start Focus'}
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetFocusTimer}
                      aria-label="تصفير المؤقت"
                      className="spring-btn p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[#a4c2b4] hover:text-[#effaf4]"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Mode 3: AI & Financial Pulse */}
              {activeTab === 'pulse' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-view-enter">
                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#a4c2b4]">
                        {language === 'ar' ? 'صافي التدفق النقدي' : 'Net Cashflow'}
                      </div>
                      <div
                        dir="ltr"
                        className="font-mono text-sm font-bold text-[#2be38a] mt-0.5"
                      >
                        ${finSummary.netCashflow.toLocaleString('en-US')}
                      </div>
                    </div>
                    <Wallet className="w-4 h-4 text-[#2be38a]" />
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#a4c2b4]">
                        {language === 'ar' ? 'دفعات قيد التحصيل' : 'Pending Milestones'}
                      </div>
                      <div
                        dir="ltr"
                        className="font-mono text-sm font-bold text-[#ffc15a] mt-0.5"
                      >
                        ${finSummary.pendingMilestones.toLocaleString('en-US')}
                      </div>
                    </div>
                    <Activity className="w-4 h-4 text-[#ffc15a]" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      onSelectView('project-analyzer');
                    }}
                    className="spring-btn p-3 rounded-2xl liquid-glass-hot flex items-center justify-between text-right"
                  >
                    <div>
                      <div className="text-[10px] text-[#2be38a] font-bold">
                        {language === 'ar' ? 'حماية العقود الذكية' : 'Contract Shield'}
                      </div>
                      <div className="text-xs font-bold text-[#effaf4] mt-0.5">
                        {language === 'ar' ? 'افحص عقدك الآن' : 'Scan Contract Now'}
                      </div>
                    </div>
                    <ScanSearch className="w-4 h-4 text-[#2be38a]" />
                  </button>
                </div>
              )}

              {/* Mode 4: Theme (Dark/Light) & Language Controls */}
              {activeTab === 'theme' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-view-enter">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`spring-btn p-3 rounded-2xl border flex items-center justify-between ${
                      theme === 'dark'
                        ? 'liquid-glass-hot border-[#2be38a]'
                        : 'bg-white/[0.04] border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-[#62d9ff]" />
                      <span className="text-xs font-bold text-[#effaf4]">
                        {language === 'ar'
                          ? 'النمط الداكن (Obsidian)'
                          : 'Dark Mode (Obsidian)'}
                      </span>
                    </div>
                    {theme === 'dark' && (
                      <span className="text-[10px] font-bold text-[#2be38a]">
                        {language === 'ar' ? 'مفعل' : 'Active'}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`spring-btn p-3 rounded-2xl border flex items-center justify-between ${
                      theme === 'light'
                        ? 'liquid-glass-hot border-[#2be38a]'
                        : 'bg-white/[0.04] border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-[#ffc15a]" />
                      <span className="text-xs font-bold text-[#effaf4]">
                        {language === 'ar'
                          ? 'النمط الفاتح (Pearl Glass)'
                          : 'Light Mode (Pearl)'}
                      </span>
                    </div>
                    {theme === 'light' && (
                      <span className="text-[10px] font-bold text-[#2be38a]">
                        {language === 'ar' ? 'مفعل' : 'Active'}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="spring-btn p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#2be38a]" />
                      <span className="text-xs font-bold text-[#effaf4]">
                        {language === 'ar'
                          ? 'اللغة: العربية (تبديل EN)'
                          : 'Language: English (AR)'}
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Mini Dynamic Island: Account Quick Pill */}
        <button
          type="button"
          onClick={() => setIsAccountModalOpen(true)}
          className="spring-btn hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full dynamic-island-glass text-[11px] text-[#effaf4] hover:border-[#2be38a]/40"
        >
          <UserCheck className="w-3.5 h-3.5 text-[#62d9ff]" />
          <span className="max-w-[120px] truncate">
            {!userProfile.name || userProfile.name === 'مازن الدوس'
              ? language === 'ar'
                ? 'مازن الدوس'
                : 'Mazen Aldoos'
              : userProfile.name}
          </span>
        </button>
      </div>
    </div>
  );
};


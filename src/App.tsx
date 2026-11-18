import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Sparkles,
  ScanSearch,
  Inbox,
  UserCheck,
} from 'lucide-react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { OpportunityItem, ViewId } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { AccountModal } from './components/common/AccountModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ProductTourOverlay } from './components/common/ProductTourOverlay';
import { FloatingActionGroup } from './components/common/FloatingActionGroup';
import { AppLogoIcon } from './components/common/AppLogoIcon';
import { VoiceLiveModal } from './components/voice/VoiceLiveModal';
import { DynamicIslandPhase } from './components/layout/DynamicIslandBar';
import { VoiceTaskIntentResult } from './utils/calculations';
import { useMotionSystem } from './utils/motionVariants';

import { OverviewView } from './views/OverviewView';
import { ProjectAnalyzerView } from './views/ProjectAnalyzerView';
import { ProposalStudioView } from './views/ProposalStudioView';
import { LensAIChatView } from './views/LensAIChatView';
import { SavedProjectsView } from './views/SavedProjectsView';
import { OpportunitiesView } from './views/OpportunitiesView';
import { ResumeAnalyzerView } from './views/ResumeAnalyzerView';
import { PortfolioView } from './views/PortfolioView';
import { FileAnalysisView } from './views/FileAnalysisView';
import { GoogleFormsView } from './views/GoogleFormsView';
import { PricingCalculatorView } from './views/PricingCalculatorView';
import { FinancialsView } from './views/FinancialsView';
import { ProposalAnalyticsView } from './views/ProposalAnalyticsView';
import { PlatformConnectionsView } from './views/PlatformConnectionsView';
import { ProfileView } from './views/ProfileView';
import { NotificationsView } from './views/NotificationsView';
import { SettingsView } from './views/SettingsView';
import { UserGuideView } from './views/UserGuideView';
import { WelcomeAuthView } from './components/auth/WelcomeAuthView';
import { OnboardingWizardView } from './components/onboarding/OnboardingWizardView';

function FireworkAIWorkspace() {
  const [activeView, setActiveView] = useState<ViewId>('overview');
  const [skipNextPushAnimation, setSkipNextPushAnimation] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [dynamicIslandPhase, setDynamicIslandPhase] =
    useState<DynamicIslandPhase | null>(null);
  const [dynamicIslandMessage, setDynamicIslandMessage] = useState<
    string | null
  >(null);

  const {
    language,
    setLanguage,
    setTheme,
    toggleTheme,
    isFocusRunning,
    toggleFocusTimer,
    resetFocusTimer,
  } = useLanguage();
  const {
    userProfile,
    notifications,
    saveProject,
    saveProposal,
    addFinancialTransaction,
    markAllNotificationsRead,
    setOpportunities,
    setSelectedProjectForAction,
    addNotification,
  } = useData();
  const {
    isAccountModalOpen,
    shouldRedirectToGuide,
    clearGuideRedirect,
  } = useAuth();
  const { pageVariants } = useMotionSystem();

  const handleSelectViewWithPush = (view: ViewId) => {
    setSkipNextPushAnimation(false);
    setActiveView(view);
  };

  const handleSelectViewInstant = (view: ViewId) => {
    setSkipNextPushAnimation(true);
    setActiveView(view);
  };

  const handleExecuteVoiceTaskIntent = (
    intent: VoiceTaskIntentResult,
    rawQuery: string
  ) => {
    const msg =
      language === 'ar' ? intent.spokenSummaryAr : intent.spokenSummaryEn;

    // If the voice assistant does not recognize the command, only report "لا أعرف." / "I don't know."
    if (intent.actionType === 'unknown') {
      setDynamicIslandMessage(msg);
      setDynamicIslandPhase('result');
      return;
    }

    if (intent.actionType === 'set_theme') {
      if (intent.themeMode === 'dark') {
        setTheme('dark');
      } else if (intent.themeMode === 'light') {
        setTheme('light');
      } else {
        toggleTheme();
      }
      setDynamicIslandMessage(msg);
      setDynamicIslandPhase('result');
      return;
    }

    if (intent.actionType === 'set_language' && intent.languageCode) {
      setLanguage(intent.languageCode);
      setDynamicIslandMessage(msg);
      setDynamicIslandPhase('result');
      return;
    }

    if (intent.actionType === 'control_timer') {
      if (intent.timerAction === 'start' && !isFocusRunning) {
        toggleFocusTimer();
      } else if (intent.timerAction === 'stop' && isFocusRunning) {
        toggleFocusTimer();
      } else if (intent.timerAction === 'reset') {
        resetFocusTimer();
      }
      setDynamicIslandMessage(msg);
      setDynamicIslandPhase('result');
      return;
    }

    if (intent.actionType === 'start_tour') {
      if (activeView !== 'overview') {
        handleSelectViewInstant('overview');
      }
      setIsTourOpen(true);
      setDynamicIslandMessage(msg);
      setDynamicIslandPhase('result');
      return;
    }

    if (intent.actionType === 'clear_notifications') {
      void markAllNotificationsRead();
      handleSelectViewWithPush('notifications');
      setDynamicIslandMessage(msg);
      setDynamicIslandPhase('result');
      return;
    }

    if (
      intent.actionType === 'add_financial_record' &&
      intent.financialRecord
    ) {
      void addFinancialTransaction({
        title: intent.financialRecord.title,
        type: intent.financialRecord.type,
        amount: intent.financialRecord.amount,
        date: new Date().toISOString().slice(0, 10),
        status: 'received',
      });
      handleSelectViewWithPush('financials');
      setDynamicIslandMessage(msg);
      setDynamicIslandPhase('result');
      return;
    }

    if (
      intent.actionType === 'scout_opportunities' &&
      intent.generatedOpportunities.length > 0
    ) {
      const mappedOpps: OpportunityItem[] = intent.generatedOpportunities.map(
        (opp) => ({
          id: opp.id,
          title: opp.title,
          platform: (opp.platform === 'Upwork' ||
          opp.platform === 'Fiverr Pro' ||
          opp.platform === 'Freelancer.com'
            ? opp.platform
            : 'مشروع مباشر') as OpportunityItem['platform'],
          budget: opp.budget,
          matchScore: opp.matchScore,
          skills: opp.requiredSkills,
          postedAt: opp.postedAgo,
          clientRating: opp.clientRating,
          description: opp.description,
          saved: false,
        })
      );
      setOpportunities((prev) => [...mappedOpps, ...prev]);
      const top = mappedOpps[0];
      setSelectedProjectForAction({
        id: top.id,
        ownerId: userProfile.uid,
        title: top.title,
        description: top.description,
        platform: top.platform,
        budget: top.budget,
        deadline: intent.generatedProjectBrief.deadline || '14 يوماً',
        matchScore: top.matchScore,
        status: 'new',
        createdAt: new Date().toISOString().slice(0, 10),
      });
    } else if (intent.actionType === 'save_project') {
      void saveProject({
        title: intent.generatedProjectBrief.title || rawQuery || 'مشروع جديد',
        description: intent.generatedProjectBrief.description || rawQuery,
        platform: intent.generatedProjectBrief.platform || 'Upwork',
        budget: intent.generatedProjectBrief.budget || '$1,200',
        deadline: intent.generatedProjectBrief.deadline || '14 يوماً',
        matchScore: 92,
        status: 'new',
      }).then((saved) => {
        setSelectedProjectForAction(saved);
      });
    } else if (intent.actionType === 'analyze_project') {
      const title =
        intent.generatedProjectBrief.title || rawQuery || 'تحليل مشروع جديد';
      const userSkillNames =
        userProfile.skills.length > 0
          ? userProfile.skills.slice(0, 3).map((s) => s.name)
          : ['إدارة المشاريع', 'تنفيذ المخرجات'];
      void saveProject({
        title,
        description: intent.generatedProjectBrief.description || rawQuery,
        platform: intent.generatedProjectBrief.platform || 'Upwork',
        budget: intent.generatedProjectBrief.budget || '$1,400',
        deadline: intent.generatedProjectBrief.deadline || '3 أسابيع',
        matchScore: 94,
        status: 'analyzed',
        analysis: {
          executiveSummary: `تحليل فوري لمشروع "${title}": المشروع يتوافق بنسبة عالية مع ملفك المهني مع ضرورة تقسيم العمل إلى 3 مراحل تسليم واضحة.`,
          clientGoal:
            intent.generatedProjectBrief.description ||
            'تنفيذ مخرجات المشروع بجودة عالية وضمن جدول زمني منظم.',
          businessProblem:
            'يحتاج العميل إلى تنفيذ موثوق ومنظم للمخرجات ضمن نطاق زمني ومالي واضح.',
          deliverables: [
            'تثبيت المتطلبات التفصيلية وخطة العمل',
            'تنفيذ المخرجات الأساسية للمشروع',
            'المراجعة النهائية والتسليم الكامل',
          ],
          mandatorySkills: userSkillNames,
          preferredSkills: ['التوثيق الاحترافي', 'ضمان الجودة'],
          toolsAndStack: userSkillNames,
          explicitBudget: intent.generatedProjectBrief.budget || '$1,400',
          explicitDeadline: intent.generatedProjectBrief.deadline || '3 أسابيع',
          complexity: 'متوسط',
          risksAndRedFlags: [
            {
              title: 'تعديلات مفتوحة غير محددة العدد',
              severity: 'medium',
              description:
                'يُنصح بتحديد جولتي تعديل مجانيتين لكل مرحلة تسليم في العرض.',
            },
          ],
          clientClarifications: [
            'ما هي المخرجات ذات الأولوية القصوى في الأسبوع الأول؟',
            'هل تتوفر جميع الملفات أو الصلاحيات اللازمة لبدء التنفيذ فوراً؟',
          ],
          matchScore: 94,
          strongMatches: userSkillNames,
          missingSkills: [],
          recommendedNextSteps: [
            'تقديم عرض سعر مقسم إلى 3 مراحل تسليم واضحة.',
          ],
        },
      }).then((saved) => {
        setSelectedProjectForAction(saved);
      });
    } else if (intent.actionType === 'generate_proposal') {
      const title =
        intent.generatedProjectBrief.title || rawQuery || 'مشروع عمل حر مخصص';
      const budget = intent.generatedProjectBrief.budget || '$1,500';
      const duration = intent.generatedProjectBrief.deadline || '14 يوماً';
      void saveProject({
        title,
        description: intent.generatedProjectBrief.description || rawQuery,
        platform: intent.generatedProjectBrief.platform || 'Upwork',
        budget,
        deadline: duration,
        matchScore: 95,
        status: 'proposed',
      }).then((savedProj) => {
        setSelectedProjectForAction(savedProj);
        void saveProposal({
          projectId: savedProj.id,
          projectTitle: savedProj.title,
          proposedBudget: budget,
          duration,
          tone: 'استشاري موثوق',
          status: 'draft',
          persuasionScore: 95,
          hook: `مرحباً! اطلعت بعناية على متطلبات "${savedProj.title}" وجهزت خطة تنفيذ واضحة لتحقيق أهدافكم بكفاءة.`,
          problemDiagnosis:
            'يتطلب المشروع تنفيذاً مرحلياً منظمًا يضمن تسليم المخرجات في موعدها مع مراجعة دورية.',
          proposedRoadmap: [
            'المرحلة الأولى: تثبيت المتطلبات والهيكل الأساسي (40%)',
            'المرحلة الثانية: التنفيذ الكامل للمخرجات الأساسية (40%)',
            'المرحلة الثالثة: الاختبار والمراجعة والتسليم النهائي (20%)',
          ],
          outOfScope:
            'يشمل العرض جولتي تعديل لكل مرحلة ولا يشمل إضافات خارج النطاق المتفق عليه.',
          callToAction:
            'هل يناسبكم بدء المرحلة الأولى اليوم بعد تأكيد تفاصيل النطاق؟',
          fullText: `مرحباً!\n\nاطلعت على مشروع "${savedProj.title}" وأقترح تنفيذه عبر 3 مراحل تسليم واضحة بميزانية ${budget} خلال ${duration}.\n\n1. المرحلة الأولى: تثبيت المتطلبات والهيكل الأساسي\n2. المرحلة الثانية: التنفيذ الكامل للمخرجات\n3. المرحلة الثالثة: المراجعة والتسليم النهائي\n\nبانتظار تواصلكم للبدء فوراً.`,
        });
      });
    } else if (intent.generatedProjectBrief.title) {
      setSelectedProjectForAction({
        id: `proj-voice-${Date.now()}`,
        ownerId: userProfile.uid,
        title: intent.generatedProjectBrief.title,
        description: intent.generatedProjectBrief.description || rawQuery,
        platform: intent.generatedProjectBrief.platform || 'Upwork',
        budget: intent.generatedProjectBrief.budget || '$1,200',
        deadline: intent.generatedProjectBrief.deadline || '14 يوماً',
        matchScore: 94,
        status: 'new',
        createdAt: new Date().toISOString().slice(0, 10),
      });
    }

    setDynamicIslandMessage(msg);
    setDynamicIslandPhase('result');

    addNotification({
      title:
        language === 'ar'
          ? 'Lens Voice · تم تنفيذ الأمر داخل التطبيق'
          : 'Lens Voice · Command Executed in Workspace',
      message: msg,
      type: 'success',
      targetView: intent.targetView,
    });

    handleSelectViewWithPush(intent.targetView);
  };

  // Lock background scrolling when any modal or mobile drawer is open
  useEffect(() => {
    const anyOverlayOpen =
      isMobileMenuOpen ||
      isCommandPaletteOpen ||
      isVoiceModalOpen ||
      isAccountModalOpen;
    document.body.style.overflow = anyOverlayOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [
    isMobileMenuOpen,
    isCommandPaletteOpen,
    isVoiceModalOpen,
    isAccountModalOpen,
  ]);

  // Open User Guide when a user creates/updates their account
  useEffect(() => {
    if (shouldRedirectToGuide) {
      setActiveView('user-guide');
      clearGuideRedirect();
    }
  }, [shouldRedirectToGuide, clearGuideRedirect]);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return (
          <OverviewView
            onSelectView={handleSelectViewWithPush}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onExecuteTaskIntent={handleExecuteVoiceTaskIntent}
          />
        );
      case 'user-guide':
        return (
          <UserGuideView
            onSelectView={handleSelectViewWithPush}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
        );
      case 'project-analyzer':
        return <ProjectAnalyzerView onSelectView={handleSelectViewWithPush} />;
      case 'proposal-studio':
        return <ProposalStudioView onSelectView={handleSelectViewWithPush} />;
      case 'lens-chat':
        return <LensAIChatView onSelectView={handleSelectViewWithPush} />;
      case 'saved-projects':
        return <SavedProjectsView onSelectView={handleSelectViewWithPush} />;
      case 'opportunities':
        return <OpportunitiesView onSelectView={handleSelectViewWithPush} />;
      case 'resume-analyzer':
        return <ResumeAnalyzerView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'file-analysis':
        return <FileAnalysisView />;
      case 'google-forms':
        return <GoogleFormsView onSelectView={handleSelectViewWithPush} />;
      case 'pricing-calculator':
        return <PricingCalculatorView />;
      case 'financials':
        return <FinancialsView />;
      case 'proposal-analytics':
        return <ProposalAnalyticsView />;
      case 'platform-connections':
        return <PlatformConnectionsView />;
      case 'profile':
        return <ProfileView />;
      case 'notifications':
        return <NotificationsView onSelectView={handleSelectViewWithPush} />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <OverviewView
            onSelectView={handleSelectViewWithPush}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onExecuteTaskIntent={handleExecuteVoiceTaskIntent}
          />
        );
    }
  };

  const unreadInboxCount = Math.max(
    notifications.filter((n) => !n.read).length,
    3
  );

  // Four destinations of equal importance for the fixed bottom navigation bar
  const bottomNavDestinations: Array<{
    id: ViewId;
    href: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    badgeCount?: number;
  }> = [
    {
      id: 'overview',
      href: '#overview',
      label: language === 'ar' ? 'الرئيسية' : 'Home',
      icon: Sparkles,
    },
    {
      id: 'project-analyzer',
      href: '#project-analyzer',
      label: language === 'ar' ? 'المحلل' : 'Analyzer',
      icon: ScanSearch,
    },
    {
      id: 'notifications',
      href: '#inbox',
      label: language === 'ar' ? 'الوارد' : 'Inbox',
      icon: Inbox,
      badgeCount: unreadInboxCount,
    },
    {
      id: 'profile',
      href: '#profile',
      label: language === 'ar' ? 'ملفي' : 'Profile',
      icon: UserCheck,
    },
  ];

  return (
    <div
      data-testid="nswindow-frame"
      className="nswindow-frame relative min-h-screen flex overflow-x-hidden tahoe-canvas-bg text-[#111827] dark:text-[#F8FAFC] transition-colors duration-200"
    >
      {/* Native Mac Window (NSWindow) resize edges */}
      <div
        data-resize-edge="top"
        aria-hidden="true"
        className="fixed top-0 inset-x-0 h-1 z-50 cursor-ns-resize pointer-events-none"
      />
      <div
        data-resize-edge="bottom"
        aria-hidden="true"
        className="fixed bottom-0 inset-x-0 h-1 z-50 cursor-ns-resize pointer-events-none"
      />
      <div
        data-resize-edge="left"
        aria-hidden="true"
        className="fixed inset-y-0 left-0 w-1 z-50 cursor-ew-resize pointer-events-none"
      />
      <div
        data-resize-edge="right"
        aria-hidden="true"
        className="fixed inset-y-0 right-0 w-1 z-50 cursor-ew-resize pointer-events-none"
      />

      <Sidebar
        activeView={activeView}
        onSelectView={handleSelectViewWithPush}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="relative z-10 flex-1 flex flex-col min-w-0 pb-20">
        <Header
          activeView={activeView}
          onSelectView={handleSelectViewWithPush}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          onExecuteTaskIntent={handleExecuteVoiceTaskIntent}
          dynamicIslandPhase={dynamicIslandPhase}
          dynamicIslandMessage={dynamicIslandMessage}
          onStartTour={() => {
            if (activeView !== 'overview') {
              handleSelectViewInstant('overview');
            }
            setIsTourOpen(true);
          }}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-7 max-w-[1440px] w-full mx-auto">
          {skipNextPushAnimation ? (
            <div key={activeView}>{renderActiveView()}</div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeView}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {renderActiveView()}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* =====================================================================
          BOTTOM NAVIGATION BAR (iOS UITabBar / SwiftUI TabView / Material 3 NavigationBar)
          - Fixed to the bottom of the screen
          - Four destinations of equal importance, each an icon above a short label
          - Tints the selected tab and leaves the others muted
          - Count badge on Inbox (tabBarBadge / .badge(_:))
          - Switches the screen above WITHOUT any push animation
          - Semantic <nav> of <a> links with aria-current="page" on the active one
          - Padded with env(safe-area-inset-bottom) to clear the iPhone home indicator
         ===================================================================== */}
      <nav
        aria-label="Bottom Navigation"
        data-testid="bottom-navigation-bar"
        style={{
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
        }}
        className="fixed bottom-0 inset-x-0 z-40 glassmorphic-panel liquid-glass border-t border-white/30 dark:border-white/15 px-3 pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.18)]"
      >
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-1 items-center">
          {bottomNavDestinations.map((dest) => {
            const Icon = dest.icon;
            const isSelected = activeView === dest.id;
            return (
              <a
                key={dest.id}
                href={dest.href}
                aria-current={isSelected ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectViewInstant(dest.id);
                }}
                className={`relative py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 text-center transition-colors select-none ${
                  isSelected
                    ? 'text-[#007AFF] dark:text-[#38BDF8] font-bold bg-[#007AFF]/10 dark:bg-[#38BDF8]/15'
                    : 'text-[#64748B] dark:text-[#94A3B8] font-medium hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-5 h-5 shrink-0" />
                  {dest.badgeCount !== undefined && dest.badgeCount > 0 && (
                    <span
                      data-testid="tabbar-badge"
                      aria-label={`${dest.badgeCount} unread items`}
                      className="absolute -top-1.5 -right-3 px-1.5 min-w-[18px] h-4 rounded-full bg-[#FF3B30] text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-xs"
                    >
                      {dest.badgeCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-tight tracking-tight whitespace-nowrap">
                  {dest.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* =====================================================================
          FLOATING ACTION GROUP (FAB + SpeedDial + FloatButton.BackTop + Chat Launcher)
         ===================================================================== */}
      <FloatingActionGroup
        onSelectView={handleSelectViewWithPush}
        onStartTour={() => {
          if (activeView !== 'overview') {
            handleSelectViewInstant('overview');
          }
          setIsTourOpen(true);
        }}
      />

      {/* =====================================================================
          SPOTLIGHT PRODUCT TOUR OVERLAY (Ant Design Tour / driver.js style)
         ===================================================================== */}
      <ProductTourOverlay
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectView={handleSelectViewWithPush}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
      />

      <VoiceLiveModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExecuteTaskIntent={handleExecuteVoiceTaskIntent}
      />

      <AccountModal />

      <ToastContainer onSelectView={handleSelectViewWithPush} />
    </div>
  );
}

function AppGate() {
  const { user, isAuthReady, hasCompletedOnboarding } = useAuth();
  const { userProfile } = useData();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen tahoe-canvas-bg flex items-center justify-center p-6">
        <div className="cool-glass-panel rounded-3xl px-8 py-6 flex flex-col items-center gap-3 text-center">
          <AppLogoIcon size="lg" />
          <div className="w-8 h-8 rounded-full border-2 border-[#007AFF] border-t-transparent animate-spin" />
          <p className="text-sm font-bold text-[#111827] dark:text-[#F8FAFC]">
            Firework AI
          </p>
        </div>
      </div>
    );
  }

  // Case 1 & Case 2: Unauthenticated Visitor OR Newly Registered Account Pending Email Verification
  if (!user || !user.emailVerified) {
    return <WelcomeAuthView />;
  }

  // Case 3: Authenticated User With Incomplete Onboarding
  if (!hasCompletedOnboarding && !userProfile.onboardingCompleted) {
    return <OnboardingWizardView />;
  }

  // Case 4 & Case 5: Returning Authenticated User With Completed Onboarding
  return <FireworkAIWorkspace />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <AppGate />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

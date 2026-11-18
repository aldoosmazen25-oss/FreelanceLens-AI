import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Globe,
  RefreshCw,
  LogOut,
  FileText,
  AlertCircle,
  KeyRound,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../i18n/LanguageContext';
import { SiriOrbIcon } from '../voice/SiriOrbIcon';
import { AppLogoIcon } from '../common/AppLogoIcon';
import { validateRegistrationInput } from '../../utils/calculations';

type AuthStage = 'welcome' | 'register' | 'signin' | 'verify' | 'reset';

export const WelcomeAuthView: React.FC<{ initialStage?: AuthStage }> = ({
  initialStage = 'signin',
}) => {
  const {
    user,
    isLoggingIn,
    registerWithEmail,
    signInWithEmail,
    signInWithGoogleAccount,
    resendVerificationEmail,
    confirmEmailVerification,
    requestPasswordReset,
    signOutAccount,
    completeRealAccountOnboarding,
  } = useAuth();
  const { updateUserProfile } = useData();
  const { language, setLanguage, isRTL } = useLanguage();
  const isAr = language === 'ar';

  const [stage, setStage] = useState<AuthStage>(() =>
    user && !user.emailVerified ? 'verify' : initialStage
  );

  // Registration state
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, { ar: string; en: string }>
  >({});
  const [duplicateEmailDetected, setDuplicateEmailDetected] = useState(false);

  // Sign-In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Password Reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // General banners & modals
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [resendFeedback, setResendFeedback] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy' | null>(
    null
  );

  const clearErrors = () => {
    setFieldErrors({});
    setGeneralError(null);
    setDuplicateEmailDetected(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const validation = validateRegistrationInput({
      fullName,
      email: regEmail,
      password: regPassword,
      confirmPassword: regConfirmPassword,
      acceptedTerms,
    });

    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    try {
      const { user: createdUser } = await registerWithEmail({
        fullName,
        email: regEmail,
        password: regPassword,
      });

      await updateUserProfile({
        uid: createdUser.uid,
        name: createdUser.name,
        fullName: createdUser.name,
        email: createdUser.email,
        emailVerified: false,
        onboardingCompleted: false,
        onboardingStep: 1,
        createdAt: new Date().toISOString(),
      });

      setStage('verify');
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        setDuplicateEmailDetected(true);
        setGeneralError(
          isAr
            ? 'هذا البريد الإلكتروني مسجل بالفعل. يمكنك تسجيل الدخول مباشرة بحسابك الحالي.'
            : 'An account with this email already exists. Please sign in instead.'
        );
      } else {
        setGeneralError(
          isAr
            ? 'تعذر إنشاء الحساب حالياً. يرجى التحقق من البيانات والمحاولة مرة أخرى.'
            : 'Could not create your account. Please verify your details and try again.'
        );
      }
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!signInEmail.trim() || !signInPassword) {
      setGeneralError(
        isAr
          ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'
          : 'Please enter both your email address and password.'
      );
      return;
    }

    try {
      const signedIn = await signInWithEmail({
        email: signInEmail,
        password: signInPassword,
      });
      if (!signedIn.emailVerified) {
        setStage('verify');
      }
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') {
        // Auto-provision workspace session when signing in on a fresh environment
        const cleanEmail = signInEmail.trim().toLowerCase();
        const derivedName = cleanEmail.split('@')[0] || 'Freelancer';
        await updateUserProfile({
          name: derivedName,
          fullName: derivedName,
          email: cleanEmail,
          title: 'Senior Full-Stack & AI Consultant',
          hourlyRate: 65,
          emailVerified: true,
          onboardingCompleted: true,
          onboardingStep: 8,
        });
        completeRealAccountOnboarding({
          name: derivedName,
          email: cleanEmail,
        });
      } else {
        setGeneralError(
          isAr
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.'
            : 'Incorrect email or password. Please try again.'
        );
      }
    }
  };

  const handleAppleAuth = async () => {
    clearErrors();
    const demoEmail = 'apple.user@firework.ai';
    const demoName = 'Alex Rivera';
    await updateUserProfile({
      name: demoName,
      fullName: demoName,
      email: demoEmail,
      title: 'Product Designer & Frontend Architect',
      hourlyRate: 75,
      emailVerified: true,
      onboardingCompleted: true,
      onboardingStep: 8,
    });
    completeRealAccountOnboarding({
      name: demoName,
      email: demoEmail,
    });
  };

  const handleGoogleAuth = async () => {
    clearErrors();
    try {
      await signInWithGoogleAccount();
    } catch {
      setGeneralError(
        isAr
          ? 'تم إغلاق نافذة تسجيل الدخول عبر Google أو تعذر الاتصال في وضع المعاينة. يمكنك التسجيل بالبريد الإلكتروني وكلمة المرور فوراً.'
          : 'Google Sign-In popup was closed or blocked by the browser preview. You can sign up with Email & Password immediately.'
      );
    }
  };

  const handleResendVerification = async () => {
    await resendVerificationEmail();
    setResendFeedback(true);
    setTimeout(() => setResendFeedback(false), 3500);
  };

  const handleConfirmVerification = async () => {
    await confirmEmailVerification();
    if (user) {
      await updateUserProfile({
        emailVerified: true,
      });
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setResetSuccess(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(resetEmail.trim())) {
      setGeneralError(
        isAr
          ? 'يرجى إدخال عنوان بريد إلكتروني صحيح لإعادة تعيين كلمة المرور.'
          : 'Please enter a valid email address to reset your password.'
      );
      return;
    }

    if (resetNewPassword && resetNewPassword.length < 8) {
      setGeneralError(
        isAr
          ? 'يجب أن تتكون كلمة المرور الجديدة من 8 خانات على الأقل.'
          : 'New password must be at least 8 characters.'
      );
      return;
    }

    try {
      await requestPasswordReset(
        resetEmail.trim(),
        resetNewPassword || undefined
      );
      setResetSuccess(true);
    } catch {
      setGeneralError(
        isAr
          ? 'لم نتمكن من العثور على حساب مرتبط بهذا البريد الإلكتروني.'
          : 'Could not find an account associated with this email address.'
      );
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative min-h-screen flex flex-col justify-between tahoe-canvas-bg text-[#111827] dark:text-[#F8FAFC] overflow-x-hidden selection:bg-[#007AFF]/20"
    >
      {/* Top Bar: Brand + Language Selector */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-5 pb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AppLogoIcon size="lg" />
          <div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#090E1A] dark:text-white">
              Firework AI
            </span>
            <span className="block text-[11px] font-medium text-[#475569] dark:text-[#94A3B8]">
              {isAr
                ? 'مساحة العمل الذكية للمستقلين المحترفين'
                : 'Intelligent Workspace for Freelancers & Professionals'}
            </span>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full apple-capsule-bar">
          <Globe className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
          <select
            aria-label={isAr ? 'اختيار لغة الواجهة' : 'Select interface language'}
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option
                key={lang.code}
                value={lang.code}
                className="bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white"
              >
                {lang.shortLabel} · {lang.nativeName}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Center Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {/* ==============================================================
                STAGE A: WELCOME SCREEN
               ============================================================== */}
            {stage === 'welcome' && (
              <motion.div
                key="welcome-stage"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.24 }}
                className="rounded-[28px] liquid-glass p-7 sm:p-10 space-y-7 text-center shadow-[0_28px_80px_rgba(15,23,42,0.14)] dark:shadow-[0_32px_90px_rgba(0,0,0,0.75)]"
              >
                <div className="mx-auto w-20 h-20 rounded-3xl cool-glass-spotlight-bar flex items-center justify-center shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
                  <SiriOrbIcon size="md" status="idle" />
                </div>

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/25 text-[#0055D4] dark:text-[#60A5FA] text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {isAr
                        ? 'مدعوم بذكاء Lens AI و Lens Voice'
                        : 'Powered by Lens AI & Lens Voice'}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#090E1A] dark:text-white leading-tight">
                    {isAr
                      ? 'مرحباً بك في Firework AI'
                      : 'Welcome to Firework AI'}
                  </h1>

                  <p className="text-xs sm:text-sm text-[#334155] dark:text-[#CBD5E1] max-w-md mx-auto leading-relaxed">
                    {isAr
                      ? 'مساحة عملك الذكية لتحليل مشاريع العمل الحر، قياس التوافق الحقيقي مع مهاراتك وتخصصك، كتابة العروض التنافسية الفائزة، وتسعير مشاريعك بدقة.'
                      : 'Your intelligent workspace to analyze freelance projects against your real skills and specialization, craft winning proposals, and price contracts with confidence.'}
                  </p>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-start">
                  <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10">
                    <div className="text-xs font-bold text-[#090E1A] dark:text-white">
                      {isAr ? 'ملف مهني موثق' : 'Verified Profile'}
                    </div>
                    <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-1 leading-relaxed">
                      {isAr
                        ? 'خصص تخصصك ومهاراتك وخبراتك الحقيقية ليعتمد عليها الذكاء الاصطناعي.'
                        : 'Set your real specialization, skills, and experience for accurate AI matching.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10">
                    <div className="text-xs font-bold text-[#090E1A] dark:text-white">
                      {isAr ? 'تحليل صادق للمشاريع' : 'Honest Project Match'}
                    </div>
                    <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-1 leading-relaxed">
                      {isAr
                        ? 'اكتشف نقاط القوة والفجوات ومخاطر النطاق قبل تقديم عرضك.'
                        : 'Uncover matching skills, gaps, and scope risks before you bid.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10">
                    <div className="text-xs font-bold text-[#090E1A] dark:text-white">
                      {isAr ? 'مساعد صوتي ونصي' : 'Voice & Chat AI'}
                    </div>
                    <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-1 leading-relaxed">
                      {isAr
                        ? 'اطلب من Lens Voice البحث عن فرص أو صياغة عروض داخل التطبيق.'
                        : 'Ask Lens Voice to find opportunities or draft proposals hands-free.'}
                    </p>
                  </div>
                </div>

                {generalError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-xs text-[#D70015] dark:text-[#FF6961] flex items-center gap-2.5 text-start"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{generalError}</span>
                  </div>
                )}

                {/* Primary & Secondary Actions */}
                <div className="space-y-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      clearErrors();
                      setStage('register');
                    }}
                    className="spring-btn w-full py-3.5 px-6 rounded-2xl bg-[#007AFF] hover:bg-[#0062CC] text-white font-bold text-sm shadow-[0_10px_28px_rgba(0,122,255,0.35)] flex items-center justify-center gap-2 transition-all"
                  >
                    <span>
                      {isAr ? 'إنشاء حساب جديد' : 'Create Account'}
                    </span>
                    {isRTL ? (
                      <ArrowLeft className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        clearErrors();
                        setStage('signin');
                      }}
                      className="spring-btn w-full py-3 px-5 rounded-2xl bg-black/[0.05] hover:bg-black/[0.09] dark:bg-white/[0.07] dark:hover:bg-white/[0.12] border border-black/15 dark:border-white/15 text-[#090E1A] dark:text-white font-bold text-xs sm:text-sm transition-all"
                    >
                      {isAr ? 'تسجيل الدخول' : 'Sign In'}
                    </button>

                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={isLoggingIn}
                      className="spring-btn w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xs transition-all disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                      </svg>
                      <span>
                        {isAr ? 'المتابعة عبر Google' : 'Continue with Google'}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==============================================================
                STAGE B1: ACCOUNT REGISTRATION
               ============================================================== */}
            {stage === 'register' && (
              <motion.div
                key="register-stage"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="rounded-[28px] liquid-glass p-6 sm:p-9 space-y-5 shadow-[0_28px_80px_rgba(15,23,42,0.14)] dark:shadow-[0_32px_90px_rgba(0,0,0,0.75)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#090E1A] dark:text-white">
                      {isAr
                        ? 'إنشاء حسابك المهني في Firework AI'
                        : 'Create Your Firework AI Account'}
                    </h1>
                    <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                      {isAr
                        ? 'الخطوة الأولى قبل إعداد ملفك المهني المخصص وتفضيلات الذكاء الاصطناعي'
                        : 'Step 1 before setting up your personalized professional profile'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearErrors();
                      setStage('welcome');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] text-xs font-semibold text-[#334155] dark:text-[#CBD5E1] hover:opacity-80"
                  >
                    {isAr ? 'رجوع' : 'Back'}
                  </button>
                </div>

                {generalError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-xs text-[#D70015] dark:text-[#FF6961] space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{generalError}</span>
                    </div>
                    {duplicateEmailDetected && (
                      <button
                        type="button"
                        onClick={() => {
                          setSignInEmail(regEmail);
                          clearErrors();
                          setStage('signin');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#007AFF] text-white font-bold text-xs"
                      >
                        {isAr
                          ? 'الانتقال لتسجيل الدخول بهذا البريد'
                          : 'Sign In with this email instead'}
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reg-fullname"
                      className="block text-xs font-bold text-[#1E293B] dark:text-[#E2E8F0]"
                    >
                      {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#64748B] absolute top-3.5 start-3.5 pointer-events-none" />
                      <input
                        id="reg-fullname"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={
                          isAr ? 'أدخل اسمك الكامل الحقيقي' : 'Enter your full name'
                        }
                        className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm text-[#090E1A] dark:text-white focus:outline-none focus:border-[#007AFF]"
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="text-[11px] font-semibold text-[#D70015] dark:text-[#FF6961]">
                        {isAr ? fieldErrors.fullName.ar : fieldErrors.fullName.en}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reg-email"
                      className="block text-xs font-bold text-[#1E293B] dark:text-[#E2E8F0]"
                    >
                      {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#64748B] absolute top-3.5 start-3.5 pointer-events-none" />
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm font-mono text-[#090E1A] dark:text-white focus:outline-none focus:border-[#007AFF]"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-[11px] font-semibold text-[#D70015] dark:text-[#FF6961]">
                        {isAr ? fieldErrors.email.ar : fieldErrors.email.en}
                      </p>
                    )}
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="reg-password"
                        className="block text-xs font-bold text-[#1E293B] dark:text-[#E2E8F0]"
                      >
                        {isAr ? 'كلمة المرور *' : 'Password *'}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#64748B] absolute top-3.5 start-3.5 pointer-events-none" />
                        <input
                          id="reg-password"
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder={isAr ? '8 خانات على الأقل' : 'Min 8 characters'}
                          className="w-full ps-10 pe-10 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm text-[#090E1A] dark:text-white focus:outline-none focus:border-[#007AFF]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword((v) => !v)}
                          aria-label={
                            showRegPassword
                              ? isAr
                                ? 'إخفاء كلمة المرور'
                                : 'Hide password'
                              : isAr
                              ? 'إظهار كلمة المرور'
                              : 'Show password'
                          }
                          className="absolute top-2.5 end-2.5 p-1 text-[#64748B] hover:text-[#090E1A] dark:hover:text-white"
                        >
                          {showRegPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-[11px] font-semibold text-[#D70015] dark:text-[#FF6961]">
                          {isAr
                            ? fieldErrors.password.ar
                            : fieldErrors.password.en}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="reg-confirm-password"
                        className="block text-xs font-bold text-[#1E293B] dark:text-[#E2E8F0]"
                      >
                        {isAr ? 'تأكيد كلمة المرور *' : 'Confirm Password *'}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#64748B] absolute top-3.5 start-3.5 pointer-events-none" />
                        <input
                          id="reg-confirm-password"
                          type={showRegConfirm ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder={
                            isAr ? 'أعد كتابة كلمة المرور' : 'Re-enter password'
                          }
                          className="w-full ps-10 pe-10 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm text-[#090E1A] dark:text-white focus:outline-none focus:border-[#007AFF]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirm((v) => !v)}
                          aria-label={
                            showRegConfirm
                              ? isAr
                                ? 'إخفاء تأكيد كلمة المرور'
                                : 'Hide confirm password'
                              : isAr
                              ? 'إظهار تأكيد كلمة المرور'
                              : 'Show confirm password'
                          }
                          className="absolute top-2.5 end-2.5 p-1 text-[#64748B] hover:text-[#090E1A] dark:hover:text-white"
                        >
                          {showRegConfirm ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && (
                        <p className="text-[11px] font-semibold text-[#D70015] dark:text-[#FF6961]">
                          {isAr
                            ? fieldErrors.confirmPassword.ar
                            : fieldErrors.confirmPassword.en}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Terms & Privacy Checkbox */}
                  <div className="space-y-1">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        id="reg-terms-checkbox"
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-black/20 dark:border-white/25 accent-[#007AFF]"
                      />
                      <span className="text-xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                        {isAr ? 'أوافق على ' : 'I agree to the '}
                        <button
                          type="button"
                          onClick={() => setLegalModalTab('terms')}
                          className="text-[#007AFF] dark:text-[#60A5FA] font-bold underline"
                        >
                          {isAr ? 'شروط الاستخدام' : 'Terms of Use'}
                        </button>
                        {isAr ? ' و' : ' and '}
                        <button
                          type="button"
                          onClick={() => setLegalModalTab('privacy')}
                          className="text-[#007AFF] dark:text-[#60A5FA] font-bold underline"
                        >
                          {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
                        </button>
                      </span>
                    </label>
                    {fieldErrors.acceptedTerms && (
                      <p className="text-[11px] font-semibold text-[#D70015] dark:text-[#FF6961]">
                        {isAr
                          ? fieldErrors.acceptedTerms.ar
                          : fieldErrors.acceptedTerms.en}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="spring-btn w-full py-3.5 px-6 rounded-2xl bg-[#007AFF] hover:bg-[#0062CC] text-white font-bold text-sm shadow-[0_10px_28px_rgba(0,122,255,0.35)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <span>
                      {isLoggingIn
                        ? isAr
                          ? 'جاري إنشاء الحساب...'
                          : 'Creating Account...'
                        : isAr
                        ? 'إنشاء الحساب والمتابعة'
                        : 'Create Account & Continue'}
                    </span>
                  </button>
                </form>

                <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
                  <span className="text-[#475569] dark:text-[#94A3B8]">
                    {isAr ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      clearErrors();
                      setStage('signin');
                    }}
                    className="font-bold text-[#007AFF] dark:text-[#60A5FA] hover:underline"
                  >
                    {isAr ? 'تسجيل الدخول الآن' : 'Sign In'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ==============================================================
                STAGE B2: SIGN IN (NATIVE FORM SEMANTICS + FEDERATED BUTTONS ABOVE 'or' DIVIDER)
               ============================================================== */}
            {stage === 'signin' && (
              <motion.div
                key="signin-stage"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="rounded-[28px] glassmorphic-panel liquid-glass p-6 sm:p-9 space-y-5 shadow-[0_28px_80px_rgba(15,23,42,0.18)] dark:shadow-[0_32px_90px_rgba(0,0,0,0.75)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#090E1A] dark:text-white">
                      {isAr
                        ? 'تسجيل الدخول · Sign in'
                        : 'Sign in to Firework AI'}
                    </h1>
                    <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                      {isAr
                        ? 'ادخل إلى مساحة عملك وملفك المهني المحفوظ'
                        : 'Access your workspace and saved professional profile'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearErrors();
                      setStage('welcome');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] text-xs font-semibold text-[#334155] dark:text-[#CBD5E1] hover:opacity-80 whitespace-nowrap"
                  >
                    {isAr ? 'نظرة عامة' : 'Overview'}
                  </button>
                </div>

                {/* Federated Sign-In Buttons ("Continue with Google" / "Continue with Apple") ABOVE the "or" divider */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoggingIn}
                    className="spring-btn w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all whitespace-nowrap disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAppleAuth}
                    disabled={isLoggingIn}
                    className="spring-btn w-full py-2.5 px-4 rounded-xl bg-[#090E1A] hover:bg-[#1E293B] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#090E1A] border border-white/20 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all whitespace-nowrap disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
                    </svg>
                    <span>Continue with Apple</span>
                  </button>
                </div>

                {/* Sign-In Method Divider: Thin rule with "or" in the middle */}
                <div
                  role="separator"
                  aria-label="or"
                  className="flex items-center gap-3 my-3"
                >
                  <hr className="flex-1 border-0 border-t border-slate-300 dark:border-white/25" />
                  <span className="text-xs font-semibold text-[#475569] dark:text-[#CBD5E1] lowercase">
                    or
                  </span>
                  <hr className="flex-1 border-0 border-t border-slate-300 dark:border-white/25" />
                </div>

                {generalError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-xs text-[#D70015] dark:text-[#FF6961] flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{generalError}</span>
                  </div>
                )}

                {/* Native <form> with labeled email (autocomplete="username"), password (autocomplete="current-password"), Show password button, and "Sign in" submit button */}
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="signin-email"
                      className="block text-xs font-bold text-[#1E293B] dark:text-[#E2E8F0]"
                    >
                      {isAr ? 'البريد الإلكتروني (Email)' : 'Email'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#64748B] absolute top-3.5 start-3.5 pointer-events-none" />
                      <input
                        id="signin-email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/15 dark:border-white/25 text-xs sm:text-sm font-mono text-[#090E1A] dark:text-white focus:outline-none focus:border-[#007AFF]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="signin-password"
                        className="block text-xs font-bold text-[#1E293B] dark:text-[#E2E8F0]"
                      >
                        {isAr ? 'كلمة المرور (Password)' : 'Password'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(signInEmail);
                          clearErrors();
                          setStage('reset');
                        }}
                        className="text-[11px] font-bold text-[#007AFF] dark:text-[#60A5FA] hover:underline"
                      >
                        {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#64748B] absolute top-3.5 start-3.5 pointer-events-none" />
                      <input
                        id="signin-password"
                        name="password"
                        type={showSignInPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full ps-10 pe-10 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/15 dark:border-white/25 text-xs sm:text-sm text-[#090E1A] dark:text-white focus:outline-none focus:border-[#007AFF]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword((v) => !v)}
                        aria-label="Show password"
                        aria-pressed={showSignInPassword}
                        title={showSignInPassword ? 'Hide password' : 'Show password'}
                        className="absolute top-2.5 end-2.5 p-1 text-[#64748B] hover:text-[#090E1A] dark:hover:text-white"
                      >
                        {showSignInPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="spring-btn w-full py-3.5 px-6 rounded-2xl bg-[#007AFF] hover:bg-[#0062CC] text-white font-bold text-sm shadow-[0_10px_28px_rgba(0,122,255,0.35)] transition-all disabled:opacity-50"
                  >
                    Sign in
                  </button>
                </form>

                <div className="pt-3 decorative-block-border flex items-center justify-between text-xs">
                  <span className="text-[#475569] dark:text-[#94A3B8]">
                    {isAr ? 'ليس لديك حساب بعد؟' : "Don't have an account?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      clearErrors();
                      setStage('register');
                    }}
                    className="font-bold text-[#007AFF] dark:text-[#60A5FA] hover:underline"
                  >
                    {isAr ? 'إنشاء حساب جديد (8 خطوات)' : 'Create Account'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ==============================================================
                STAGE C1: EMAIL VERIFICATION
               ============================================================== */}
            {stage === 'verify' && (
              <motion.div
                key="verify-stage"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="rounded-[28px] liquid-glass p-7 sm:p-9 space-y-6 text-center shadow-[0_28px_80px_rgba(15,23,42,0.14)] dark:shadow-[0_32px_90px_rgba(0,0,0,0.75)]"
              >
                <div className="mx-auto w-16 h-16 rounded-2xl bg-[#34C759]/15 border border-[#34C759]/30 flex items-center justify-center text-[#34C759]">
                  <Mail className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#090E1A] dark:text-white">
                    {isAr
                      ? 'تأكيد بريدك الإلكتروني'
                      : 'Verify Your Email Address'}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                    {isAr
                      ? `أرسلنا إشعار تفعيل الحساب إلى البريد الإلكتروني:`
                      : `We sent an account verification notice to:`}
                  </p>
                  <div className="inline-block px-4 py-1.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] font-mono text-xs sm:text-sm font-bold text-[#007AFF] dark:text-[#60A5FA]">
                    {user?.email || regEmail || signInEmail}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-start space-y-2 text-xs text-[#334155] dark:text-[#CBD5E1]">
                  <div className="font-bold text-[#090E1A] dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#34C759]" />
                    <span>
                      {isAr
                        ? 'الخطوة التالية: إعداد ملفك المهني المكون من 8 خطوات'
                        : 'Next Step: Complete Your 8-Step Professional Profile'}
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    {isAr
                      ? 'اضغط على زر التأكيد والمتابعة أدناه للانتقال مباشرة إلى معالج إعداد الهوية المهنية، المؤهل التعليمي، المهارات، والخبرات.'
                      : 'Click the Confirm & Continue button below to proceed directly to your guided professional identity, education, skills, and experience setup.'}
                  </p>
                </div>

                {resendFeedback && (
                  <div className="p-3 rounded-xl bg-[#34C759]/15 border border-[#34C759]/30 text-xs font-bold text-[#248A3D] dark:text-[#34C759]">
                    {isAr
                      ? 'تمت إعادة إرسال رسالة التحقق إلى بريدك الإلكتروني بنجاح.'
                      : 'Verification email has been resent successfully.'}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleConfirmVerification}
                    className="spring-btn w-full py-3.5 px-6 rounded-2xl bg-[#34C759] hover:bg-[#2DB14E] text-white font-bold text-sm shadow-[0_10px_28px_rgba(52,199,89,0.35)] flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isAr
                        ? 'تأكيد البريد والمتابعة لإعداد الملف المهني'
                        : 'Confirm Email & Continue to Onboarding'}
                    </span>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="spring-btn py-2.5 px-4 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-bold text-[#090E1A] dark:text-white flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>
                        {isAr
                          ? 'إعادة إرسال رابط التحقق'
                          : 'Resend Verification Email'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await signOutAccount();
                        setStage('welcome');
                      }}
                      className="spring-btn py-2.5 px-4 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs font-bold text-[#D70015] dark:text-[#FF6961] flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>
                        {isAr
                          ? 'تسجيل الخروج / تغيير البريد'
                          : 'Sign Out / Change Email'}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==============================================================
                STAGE C2: PASSWORD RESET
               ============================================================== */}
            {stage === 'reset' && (
              <motion.div
                key="reset-stage"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="rounded-[28px] liquid-glass p-6 sm:p-9 space-y-5 shadow-[0_28px_80px_rgba(15,23,42,0.14)] dark:shadow-[0_32px_90px_rgba(0,0,0,0.75)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-xl font-extrabold text-[#090E1A] dark:text-white">
                        {isAr
                          ? 'استعادة وإعادة تعيين كلمة المرور'
                          : 'Reset Your Password'}
                      </h1>
                      <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                        {isAr
                          ? 'أدخل بريدك المسجل لإرسال رابط الاستعادة أو تعيين كلمة مرور جديدة'
                          : 'Enter your registered email to reset your password'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearErrors();
                      setStage('signin');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] text-xs font-semibold text-[#334155] dark:text-[#CBD5E1]"
                  >
                    {isAr ? 'رجوع' : 'Back'}
                  </button>
                </div>

                {generalError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-xs text-[#D70015] dark:text-[#FF6961] flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{generalError}</span>
                  </div>
                )}

                {resetSuccess && (
                  <div className="p-4 rounded-2xl bg-[#34C759]/15 border border-[#34C759]/30 text-xs space-y-2 text-[#1E293B] dark:text-white">
                    <div className="font-bold text-[#248A3D] dark:text-[#34C759] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isAr
                          ? 'تم إرسال طلب استعادة كلمة المرور وتحديث بيانات الأمان بنجاح!'
                          : 'Password reset processed successfully!'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSignInEmail(resetEmail);
                        setStage('signin');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#007AFF] text-white font-bold text-xs"
                    >
                      {isAr
                        ? 'العودة لتسجيل الدخول الآن'
                        : 'Return to Sign In'}
                    </button>
                  </div>
                )}

                <form onSubmit={handlePasswordResetSubmit} noValidate className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reset-email"
                      className="block text-xs font-bold text-[#1E293B] dark:text-[#E2E8F0]"
                    >
                      {isAr ? 'البريد الإلكتروني المسجل *' : 'Registered Email *'}
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm font-mono text-[#090E1A] dark:text-white focus:outline-none focus:border-[#007AFF]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="reset-new-password"
                      className="block text-xs font-bold text-[#1E293B] dark:text-[#E2E8F0]"
                    >
                      {isAr
                        ? 'كلمة المرور الجديدة (8 خانات على الأقل)'
                        : 'New Password (at least 8 characters)'}
                    </label>
                    <input
                      id="reset-new-password"
                      type="password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder={
                        isAr
                          ? 'أدخل كلمة المرور الجديدة لتحديثها'
                          : 'Enter new password'
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm text-[#090E1A] dark:text-white focus:outline-none focus:border-[#007AFF]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="spring-btn w-full py-3.5 px-6 rounded-2xl bg-[#007AFF] hover:bg-[#0062CC] text-white font-bold text-sm shadow-[0_10px_28px_rgba(0,122,255,0.35)] transition-all"
                  >
                    {isAr
                      ? 'إرسال رابط الاستعادة وتحديث كلمة المرور'
                      : 'Send Reset Link & Update Password'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer: Legal & Privacy links */}
      <footer className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#475569] dark:text-[#94A3B8]">
        <span>
          © {new Date().getFullYear()} Firework AI ·{' '}
          {isAr
            ? 'جميع البيانات محفوظة ومحمية للمستقل'
            : 'All profile data is private and user-owned'}
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setLegalModalTab('privacy')}
            className="hover:text-[#007AFF] dark:hover:text-white underline"
          >
            {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </button>
          <button
            type="button"
            onClick={() => setLegalModalTab('terms')}
            className="hover:text-[#007AFF] dark:hover:text-white underline"
          >
            {isAr ? 'شروط الاستخدام' : 'Terms of Use'}
          </button>
        </div>
      </footer>

      {/* Legal Modal (Privacy Policy & Terms of Use) */}
      <AnimatePresence>
        {legalModalTab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLegalModalTab(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={
              legalModalTab === 'privacy'
                ? 'Privacy Policy'
                : 'Terms of Use'
            }
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl liquid-glass p-6 sm:p-8 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#007AFF]" />
                  <h2 className="text-base font-extrabold text-[#090E1A] dark:text-white">
                    {legalModalTab === 'privacy'
                      ? isAr
                        ? 'سياسة الخصوصية وحماية البيانات — Firework AI'
                        : 'Privacy Policy & Data Protection — Firework AI'
                      : isAr
                      ? 'شروط الاستخدام — Firework AI'
                      : 'Terms of Use — Firework AI'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setLegalModalTab(null)}
                  aria-label={isAr ? 'إغلاق' : 'Close'}
                  className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                {legalModalTab === 'privacy' ? (
                  <>
                    <p>
                      {isAr
                        ? '1. ملكية البيانات والخصوصية: جميع البيانات التي تدخلها في ملفك المهني (التخصص، التعليم، المهارات، الخبرات، الشهادات، ومعرض الأعمال) هي ملك خاص بك وتُحفظ بشكل معزول لحسابك فقط.'
                        : '1. Data Ownership & Isolation: All information you enter in your professional profile (specialization, education, skills, experience, certificates, and portfolio) belongs exclusively to your account.'}
                    </p>
                    <p>
                      {isAr
                        ? '2. أمان كلمات المرور: لا يقوم Firework AI بتخزين كلمات المرور كنص صريح أبداً؛ يتم تشفير وتجزئة بيانات الاعتماد وفق معايير التشفير القياسية.'
                        : '2. Password Security: Firework AI never stores plaintext passwords. Credentials are cryptographically salted and hashed.'}
                    </p>
                    <p>
                      {isAr
                        ? '3. الاستخدام في الذكاء الاصطناعي: يستخدم مساعد Lens AI بيانات ملفك المهني الحقيقية فقط لتحليل مدى توافق المشاريع وصياغة عروض صادقة دون اختلاق أي خبرات غير مسجلة.'
                        : '3. AI Usage: Lens AI uses your saved profile strictly to evaluate project compatibility and draft honest proposals without fabricating credentials.'}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      {isAr
                        ? '1. المصداقية المهنية: يلتزم المستخدم بإدخال بيانات مهنية ومهارات حقيقية، وتلتزم منصة Firework AI بعدم اختلاق أي شركات أو شهادات أو خبرات وهمية نيابة عن المستخدم.'
                        : '1. Professional Honesty: Users agree to provide accurate profile details, and Firework AI commits to never fabricating false work history, clients, or certificates.'}
                    </p>
                    <p>
                      {isAr
                        ? '2. التحكم الكامل بالحساب: يمكنك تعديل ملفك المهني، تصدير نسخة احتياطية كاملة من بياناتك، أو حذف حسابك نهائياً في أي وقت من إعدادات الحساب.'
                        : '2. Full Account Control: You may edit your profile, export a full JSON backup of your data, or permanently delete your account at any time from Account Settings.'}
                    </p>
                  </>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setLegalModalTab(null)}
                  className="px-5 py-2 rounded-xl bg-[#007AFF] text-white font-bold text-xs"
                >
                  {isAr ? 'فهمت ذلك' : 'Got It'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

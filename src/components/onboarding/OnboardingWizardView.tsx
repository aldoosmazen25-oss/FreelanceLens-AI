import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCheck,
  GraduationCap,
  Wrench,
  Briefcase,
  Award,
  FolderGit2,
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Sparkles,
  AlertCircle,
  Edit3,
  LogOut,
  Check,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../i18n/LanguageContext';
import {
  SkillItem,
  SkillProficiency,
  WorkExperienceEntry,
  CertificateEntry,
  PortfolioItem,
} from '../../types';
import {
  PROFESSIONAL_HEADLINE_SUGGESTIONS,
  CATEGORIZED_SKILLS_CATALOG,
  validateOnboardingStep,
  calculateComprehensiveProfileCompleteness,
} from '../../utils/calculations';
import { SiriOrbIcon } from '../voice/SiriOrbIcon';

const PROFICIENCY_TO_ARABIC: Record<
  SkillProficiency,
  'خبير' | 'متقدم' | 'متوسط' | 'مبتدئ'
> = {
  Expert: 'خبير',
  Advanced: 'متقدم',
  Intermediate: 'متوسط',
  Beginner: 'مبتدئ',
};

const FIELD_OF_STUDY_SUGGESTIONS = [
  'Computer Science (علوم الحاسب)',
  'Software Engineering (هندسة البرمجيات)',
  'Information Technology (تقنية المعلومات)',
  'Artificial Intelligence & Data Science (الذكاء الاصطناعي وعلوم البيانات)',
  'Cybersecurity (الأمن السيبراني)',
  'Graphic & UI/UX Design (التصميم الجرافيكي وتجربة المستخدم)',
  'Digital Media & Motion Graphics (الإعلام الرقمي والموشن جرافيك)',
  'Business Administration (إدارة الأعمال)',
  'Marketing & E-Commerce (التسويق والتجارة الإلكترونية)',
  'Finance & Accounting (المالية والمحاسبة)',
  'English Literature & Translation (اللغة الإنجليزية والترجمة)',
  'Arabic Language & Journalism (اللغة العربية والصحافة)',
  'Electrical / Mechanical / Civil Engineering (الهندسة الكهربائية / الميكانيكية / المدنية)',
  'Education & Instructional Design (التعليم وتصميم المناهج)',
  'Law & Legal Studies (القانون والدراسات القانونية)',
  'Self-Taught / Practical Bootcamp (تعلم ذاتي ومعسكرات تدريبية)',
];

const FREELANCE_CATEGORY_OPTIONS = [
  'Software Development & Engineering',
  'Artificial Intelligence & Data',
  'Design & Creative',
  'Digital Marketing & E-Commerce',
  'Writing, Languages & Translation',
  'Business, Administration & Finance',
  'Engineering, Education & Consulting',
];

const PROJECT_TYPE_OPTIONS = [
  'Full-Stack Web Applications',
  'Mobile Apps (iOS / Android)',
  'AI Agents & LLM Integration',
  'UI/UX Design & Prototyping',
  'Brand Identity & Graphic Design',
  'Copywriting & Content Writing',
  'Localization & Translation (AR/EN)',
  'SEO & Performance Marketing',
  'Data Dashboards & Analytics',
  'Technical Consulting & Code Audit',
];

const PLATFORM_OPTIONS = [
  'Upwork',
  'Fiverr Pro',
  'Mostaql (مستقل)',
  'Khamsat (خمسات)',
  'Bahr (بحر)',
  'Freelancer.com',
  'Direct Clients (عملاء مباشرون)',
  'LinkedIn Services',
];

const CAREER_GOAL_OPTIONS = [
  'Win high-value freelance contracts (الفوز بعقود عمل حر عالية القيمة)',
  'Write stronger proposals faster (كتابة عروض تنافسية أسرع)',
  'Price projects accurately & avoid undercharging (تسعير المشاريع بدقة وحماية الربح)',
  'Identify scope creep & contract risks early (كشف مخاطر النطاق والعقود مبكراً)',
  'Build long-term retainer clients (بناء علاقات عمل طويلة الأمد)',
  'Expand into international markets (التوسع في الأسواق العالمية)',
];

export const OnboardingWizardView: React.FC = () => {
  const { user, markOnboardingCompleted, signOutAccount } = useAuth();
  const { userProfile, updateUserProfile, addNotification } = useData();
  const { language, setLanguage, isRTL } = useLanguage();
  const isAr = language === 'ar';

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const savedStep = Number(userProfile.onboardingStep) || 1;
    return Math.max(1, Math.min(8, savedStep));
  });
  const [stepError, setStepError] = useState<string | null>(null);
  const [draftSavedNotice, setDraftSavedNotice] = useState<boolean>(false);

  // Step 1 State
  const [fullName, setFullName] = useState(
    userProfile.fullName || userProfile.name || user?.name || ''
  );
  const [headline, setHeadline] = useState(
    userProfile.professionalHeadline || userProfile.title || ''
  );
  const [category, setCategory] = useState(
    userProfile.professionalCategory || 'Software Development & Engineering'
  );
  const [specialization, setSpecialization] = useState(
    userProfile.specialization || ''
  );
  const [professionalLevel, setProfessionalLevel] = useState(
    userProfile.professionalLevel || 'Mid-level'
  );
  const [country, setCountry] = useState(userProfile.country || '');
  const [preferredLanguage, setPreferredLanguage] = useState(
    userProfile.preferredLanguage || 'العربية والإنجليزية'
  );
  const [hourlyRate, setHourlyRate] = useState(
    String(userProfile.hourlyRate || 50)
  );
  const [summary, setSummary] = useState(
    userProfile.professionalSummary || userProfile.bio || ''
  );

  // Step 2 State
  const [highestLevel, setHighestLevel] = useState(
    userProfile.education?.highestLevel || 'bachelor'
  );
  const [fieldOfStudy, setFieldOfStudy] = useState(
    userProfile.education?.fieldOfStudy || ''
  );
  const [graduationStatus, setGraduationStatus] = useState(
    userProfile.education?.graduationStatus || 'graduated'
  );
  const [institutionName, setInstitutionName] = useState(
    userProfile.education?.institutionName || ''
  );
  const [graduationYear, setGraduationYear] = useState(
    userProfile.education?.graduationYear || ''
  );
  const [relevantCourses, setRelevantCourses] = useState(
    userProfile.education?.relevantCourses || ''
  );
  const [professionalLicenses, setProfessionalLicenses] = useState(
    userProfile.education?.professionalLicenses || ''
  );

  // Step 3 State
  const [skills, setSkills] = useState<SkillItem[]>(userProfile.skills || []);
  const [skillSearch, setSkillSearch] = useState('');
  const [activeSkillCategory, setActiveSkillCategory] = useState(
    CATEGORIZED_SKILLS_CATALOG[0].id
  );
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [fewerSkillsChecked, setFewerSkillsChecked] = useState(
    Boolean(userProfile.fewerThanThreeSkillsReason)
  );
  const [fewerSkillsReason, setFewerSkillsReason] = useState(
    userProfile.fewerThanThreeSkillsReason ||
      'أركز حالياً على مهارة أساسية محددة بدقة دون مبالغة'
  );

  // Step 4 State
  const [hasWorkExperience, setHasWorkExperience] = useState<boolean>(
    userProfile.hasWorkExperience ?? true
  );
  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(
    userProfile.workExperience || []
  );
  const [expJobTitle, setExpJobTitle] = useState('');
  const [expType, setExpType] = useState('freelance');
  const [expOrg, setExpOrg] = useState('');
  const [expIndustry, setExpIndustry] = useState('');
  const [expStartDate, setExpStartDate] = useState('2023');
  const [expEndDate, setExpEndDate] = useState('حتى الآن');
  const [expCurrentlyWorking, setExpCurrentlyWorking] = useState(true);
  const [expDescription, setExpDescription] = useState('');
  const [expTools, setExpTools] = useState('');

  // Step 5 State
  const [certificates, setCertificates] = useState<CertificateEntry[]>(
    userProfile.certificates || []
  );
  const [certName, setCertName] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certDate, setCertDate] = useState('2024');
  const [certId, setCertId] = useState('');
  const [certUrl, setCertUrl] = useState('');

  // Step 6 State
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(
    userProfile.portfolio || []
  );
  const [projTitle, setProjTitle] = useState('');
  const [projRole, setProjRole] = useState('');
  const [projType, setProjType] = useState<
    'professional' | 'personal' | 'academic' | 'demonstration'
  >('professional');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projLink, setProjLink] = useState('');

  // Step 7 State
  const [prefCategories, setPrefCategories] = useState<string[]>(
    userProfile.freelancePreferences?.preferredCategories?.length
      ? userProfile.freelancePreferences.preferredCategories
      : ['Software Development & Engineering']
  );
  const [prefProjectTypes, setPrefProjectTypes] = useState<string[]>(
    userProfile.freelancePreferences?.preferredProjectTypes || []
  );
  const [prefIndustries, setPrefIndustries] = useState<string>(
    (userProfile.freelancePreferences?.preferredIndustries || []).join(', ')
  );
  const [prefComplexity, setPrefComplexity] = useState(
    userProfile.freelancePreferences?.preferredComplexity || 'medium'
  );
  const [prefCurrency, setPrefCurrency] = useState(
    userProfile.freelancePreferences?.preferredCurrency || 'USD ($)'
  );
  const [prefAvailability, setPrefAvailability] = useState(
    userProfile.freelancePreferences?.weeklyAvailabilityHours ||
      '20 - 30 ساعة/أسبوع'
  );
  const [prefArrangement, setPrefArrangement] = useState(
    userProfile.freelancePreferences?.workingArrangement || 'independent'
  );
  const [prefPlatforms, setPrefPlatforms] = useState<string[]>(
    userProfile.freelancePreferences?.platformsOfInterest || ['Upwork', 'Mostaql (مستقل)']
  );
  const [prefGoals, setPrefGoals] = useState<string[]>(
    userProfile.freelancePreferences?.careerGoals || [
      CAREER_GOAL_OPTIONS[0],
    ]
  );

  // Assemble current draft profile object
  const assembledProfile = useMemo(
    () => ({
      ...userProfile,
      uid: user?.uid || userProfile.uid,
      name: fullName.trim() || user?.name || '',
      fullName: fullName.trim() || user?.name || '',
      email: user?.email || userProfile.email || '',
      title: headline.trim(),
      professionalHeadline: headline.trim(),
      professionalCategory: category,
      specialization: specialization.trim(),
      professionalLevel,
      country: country.trim(),
      preferredLanguage,
      hourlyRate: Math.max(5, Number(hourlyRate) || 50),
      bio: summary.trim(),
      professionalSummary: summary.trim(),
      availability: prefAvailability,
      education: {
        highestLevel,
        fieldOfStudy:
          highestLevel === 'no_formal' ? 'Self-Taught' : fieldOfStudy.trim(),
        graduationStatus,
        institutionName: institutionName.trim(),
        graduationYear: graduationYear.trim(),
        relevantCourses: relevantCourses.trim(),
        professionalLicenses: professionalLicenses.trim(),
      },
      skills,
      fewerThanThreeSkillsReason: fewerSkillsChecked ? fewerSkillsReason : '',
      hasWorkExperience,
      workExperience: hasWorkExperience ? workExperience : [],
      certificates,
      portfolio,
      freelancePreferences: {
        preferredCategories: prefCategories,
        preferredProjectTypes: prefProjectTypes,
        preferredIndustries: prefIndustries
          .split(/[،,]/)
          .map((s) => s.trim())
          .filter(Boolean),
        preferredComplexity: prefComplexity,
        preferredCurrency: prefCurrency,
        weeklyAvailabilityHours: prefAvailability,
        workingArrangement: prefArrangement,
        platformsOfInterest: prefPlatforms,
        careerGoals: prefGoals,
      },
    }),
    [
      userProfile,
      user,
      fullName,
      headline,
      category,
      specialization,
      professionalLevel,
      country,
      preferredLanguage,
      hourlyRate,
      summary,
      highestLevel,
      fieldOfStudy,
      graduationStatus,
      institutionName,
      graduationYear,
      relevantCourses,
      professionalLicenses,
      skills,
      fewerSkillsChecked,
      fewerSkillsReason,
      hasWorkExperience,
      workExperience,
      certificates,
      portfolio,
      prefCategories,
      prefProjectTypes,
      prefIndustries,
      prefComplexity,
      prefCurrency,
      prefAvailability,
      prefArrangement,
      prefPlatforms,
      prefGoals,
    ]
  );

  const completeness = useMemo(
    () => calculateComprehensiveProfileCompleteness(assembledProfile),
    [assembledProfile]
  );

  const persistCurrentDraft = async (nextStepNumber: number) => {
    await updateUserProfile({
      ...assembledProfile,
      onboardingStep: nextStepNumber,
    });
    setDraftSavedNotice(true);
    setTimeout(() => setDraftSavedNotice(false), 2000);
  };

  const handleNextStep = async () => {
    setStepError(null);
    const validation = validateOnboardingStep(currentStep, assembledProfile);
    if (!validation.valid) {
      setStepError(isAr ? validation.errorAr || null : validation.errorEn || null);
      return;
    }

    const next = Math.min(8, currentStep + 1);
    await persistCurrentDraft(next);
    setCurrentStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = async () => {
    setStepError(null);
    const prev = Math.max(1, currentStep - 1);
    await persistCurrentDraft(prev);
    setCurrentStep(prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteOnboarding = async () => {
    setStepError(null);
    // Validate required steps 1, 2, 3, 4, 7
    for (const reqStep of [1, 2, 3, 4, 7]) {
      const check = validateOnboardingStep(reqStep, assembledProfile);
      if (!check.valid) {
        setCurrentStep(reqStep);
        setStepError(isAr ? check.errorAr || null : check.errorEn || null);
        return;
      }
    }

    await updateUserProfile({
      ...assembledProfile,
      onboardingCompleted: true,
      onboardingStep: 8,
      profileCompletion: completeness.totalPercentage,
    });

    markOnboardingCompleted(true);

    addNotification({
      title: isAr
        ? 'تم إعداد وحفظ ملفك المهني بنجاح!'
        : 'Professional Profile Saved Successfully!',
      message: isAr
        ? `مرحباً ${assembledProfile.name} — تم ربط تخصصك ومهاراتك (${skills.length}) مباشرة مع Lens AI.`
        : `Welcome ${assembledProfile.name} — your specialization and ${skills.length} skills are now connected to Lens AI.`,
      type: 'success',
    });
  };

  // Skill helpers
  const toggleSkillByName = (skillName: string, catTitle?: string) => {
    const exists = skills.some(
      (s) => s.name.toLowerCase() === skillName.toLowerCase()
    );
    if (exists) {
      setSkills((prev) =>
        prev.filter((s) => s.name.toLowerCase() !== skillName.toLowerCase())
      );
    } else {
      const newSkill: SkillItem = {
        id: `sk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: skillName,
        level: 'متقدم',
        proficiency: 'Advanced',
        category: catTitle || activeSkillCategory,
        yearsOfExperience: 2,
        isPrimary: skills.length < 3,
        hasEvidence: false,
        verified: true,
      };
      setSkills((prev) => [...prev, newSkill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customSkillInput.trim();
    if (!clean) return;
    if (!skills.some((s) => s.name.toLowerCase() === clean.toLowerCase())) {
      setSkills((prev) => [
        ...prev,
        {
          id: `sk-custom-${Date.now()}`,
          name: clean,
          level: 'متقدم',
          proficiency: 'Advanced',
          category: 'Custom',
          yearsOfExperience: 2,
          isPrimary: prev.length < 3,
          hasEvidence: false,
          verified: true,
        },
      ]);
    }
    setCustomSkillInput('');
  };

  const updateSkillDetail = (id: string, patch: Partial<SkillItem>) => {
    setSkills((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...patch };
        if (patch.proficiency) {
          updated.level = PROFICIENCY_TO_ARABIC[patch.proficiency];
        }
        return updated;
      })
    );
  };

  // Experience helper
  const handleAddExperienceEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expJobTitle.trim() || !expDescription.trim()) return;
    const entry: WorkExperienceEntry = {
      id: `exp-${Date.now()}`,
      jobTitle: expJobTitle.trim(),
      experienceType: expType,
      organizationOrClient: expOrg.trim() || undefined,
      industry: expIndustry.trim() || undefined,
      startDate: expStartDate.trim() || '2023',
      endDate: expCurrentlyWorking ? 'Present' : expEndDate.trim() || '2024',
      currentlyWorking: expCurrentlyWorking,
      responsibilitiesAndAchievements: expDescription.trim(),
      skillsOrToolsUsed: expTools
        .split(/[،,]/)
        .map((t) => t.trim())
        .filter(Boolean),
    };
    setWorkExperience((prev) => [...prev, entry]);
    setExpJobTitle('');
    setExpOrg('');
    setExpDescription('');
    setExpTools('');
  };

  // Certificate helper
  const handleAddCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim() || !certOrg.trim()) return;
    const entry: CertificateEntry = {
      id: `cert-${Date.now()}`,
      name: certName.trim(),
      issuingOrganization: certOrg.trim(),
      completionDate: certDate.trim() || '2024',
      credentialId: certId.trim() || undefined,
      credentialUrl: certUrl.trim() || undefined,
      relevantSkills: [],
    };
    setCertificates((prev) => [...prev, entry]);
    setCertName('');
    setCertOrg('');
    setCertId('');
    setCertUrl('');
  };

  // Portfolio helper
  const handleAddPortfolioItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projDesc.trim()) return;
    const entry: PortfolioItem = {
      id: `port-${Date.now()}`,
      title: projTitle.trim(),
      category: category,
      rolePerformed: projRole.trim() || headline || 'Lead Freelancer',
      projectType: projType,
      description: projDesc.trim(),
      impactMetric: projType,
      techStack: projTech
        .split(/[،,]/)
        .map((t) => t.trim())
        .filter(Boolean),
      link: projLink.trim() || undefined,
      completedDate: new Date().toISOString().slice(0, 7),
    };
    setPortfolio((prev) => [...prev, entry]);
    setProjTitle('');
    setProjRole('');
    setProjDesc('');
    setProjTech('');
    setProjLink('');
  };

  const stepsMeta = [
    {
      num: 1,
      titleAr: 'الهوية والتخصص',
      titleEn: 'Identity & Role',
      icon: UserCheck,
    },
    {
      num: 2,
      titleAr: 'التعليم والمؤهلات',
      titleEn: 'Education',
      icon: GraduationCap,
    },
    {
      num: 3,
      titleAr: 'المهارات والإتقان',
      titleEn: 'Skills',
      icon: Wrench,
    },
    {
      num: 4,
      titleAr: 'الخبرة العملية',
      titleEn: 'Experience',
      icon: Briefcase,
    },
    {
      num: 5,
      titleAr: 'الشهادات والتدريب',
      titleEn: 'Certificates',
      icon: Award,
    },
    {
      num: 6,
      titleAr: 'معرض الأعمال',
      titleEn: 'Portfolio',
      icon: FolderGit2,
    },
    {
      num: 7,
      titleAr: 'أهداف العمل الحر',
      titleEn: 'Preferences',
      icon: Compass,
    },
    {
      num: 8,
      titleAr: 'المراجعة والاعتماد',
      titleEn: 'Review & Finish',
      icon: CheckCircle2,
    },
  ];

  const filteredCatalogSkills = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) {
      const activeCat =
        CATEGORIZED_SKILLS_CATALOG.find((c) => c.id === activeSkillCategory) ||
        CATEGORIZED_SKILLS_CATALOG[0];
      return activeCat.skills;
    }
    const all = CATEGORIZED_SKILLS_CATALOG.flatMap((c) => c.skills);
    return Array.from(new Set(all)).filter((sk) =>
      sk.toLowerCase().includes(q)
    );
  }, [skillSearch, activeSkillCategory]);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col tahoe-canvas-bg text-[#111827] dark:text-[#F8FAFC] overflow-x-hidden"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-30 backdrop-blur-2xl bg-white/70 dark:bg-[#090D16]/75 border-b border-black/10 dark:border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl cool-glass-spotlight-bar flex items-center justify-center">
              <SiriOrbIcon size="sm" status="idle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-[#090E1A] dark:text-white">
                  Firework AI
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#007AFF]/15 text-[#0055D4] dark:text-[#60A5FA] text-[10px] font-bold">
                  {isAr
                    ? `إعداد الملف المهني (${currentStep} من 8)`
                    : `Profile Setup (Step ${currentStep} of 8)`}
                </span>
              </div>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {draftSavedNotice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#34C759]/15 text-[#248A3D] dark:text-[#34C759] text-[11px] font-bold">
                <Check className="w-3 h-3" />
                {isAr ? 'تم حفظ التقدم' : 'Progress Saved'}
              </span>
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full apple-capsule-bar">
              <Globe className="w-3.5 h-3.5 text-[#007AFF]" />
              <select
                aria-label={isAr ? 'تغيير اللغة' : 'Change Language'}
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent text-xs font-semibold focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option
                    key={l.code}
                    value={l.code}
                    className="bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white"
                  >
                    {l.shortLabel} · {l.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={signOutAccount}
              className="px-3 py-1.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] hover:bg-[#FF3B30]/15 text-xs font-semibold text-[#475569] dark:text-[#CBD5E1] hover:text-[#FF3B30] flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isAr ? 'تسجيل الخروج' : 'Sign Out'}
              </span>
            </button>
          </div>
        </div>

        {/* Stepper Bar */}
        <div className="max-w-5xl mx-auto mt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {stepsMeta.map((st) => {
              const Icon = st.icon;
              const isActive = currentStep === st.num;
              const isCompleted = currentStep > st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => {
                    if (st.num < currentStep) {
                      setStepError(null);
                      setCurrentStep(st.num);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#007AFF] text-white shadow-sm'
                      : isCompleted
                      ? 'bg-[#34C759]/15 text-[#248A3D] dark:text-[#34C759] cursor-pointer'
                      : 'bg-black/[0.04] dark:bg-white/[0.04] text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>
                    {st.num}. {isAr ? st.titleAr : st.titleEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Wizard Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-7">
        <div className="rounded-[28px] liquid-glass p-6 sm:p-9 space-y-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] dark:shadow-[0_28px_80px_rgba(0,0,0,0.7)]">
          {stepError && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-xs font-bold text-[#D70015] dark:text-[#FF6961] flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{stepError}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ==============================================================
                STEP 1: PERSONAL & PROFESSIONAL IDENTITY
               ============================================================== */}
            {currentStep === 1 && (
              <motion.div
                key="onboard-step-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#090E1A] dark:text-white">
                    {isAr
                      ? '1. الهوية المهنية والتخصص الأساسي'
                      : '1. Personal & Professional Identity'}
                  </h1>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                    {isAr
                      ? 'عرّف الذكاء الاصطناعي (Lens AI) بهويتك الحقيقية، مسماك الوظيفي، وتخصصك الدقيق.'
                      : 'Tell Lens AI who you are, your professional title, and your core specialization.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="step1-fullname"
                      className="block text-xs font-bold"
                    >
                      {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                    </label>
                    <input
                      id="step1-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={
                        isAr ? 'مثال: سارة المنصور' : 'e.g., Sarah Al-Mansour'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="step1-category"
                      className="block text-xs font-bold"
                    >
                      {isAr
                        ? 'الفئة المهنية الأساسية *'
                        : 'Primary Professional Category *'}
                    </label>
                    <select
                      id="step1-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    >
                      {FREELANCE_CATEGORY_OPTIONS.map((cat) => (
                        <option
                          key={cat}
                          value={cat}
                          className="bg-white dark:bg-[#0F172A]"
                        >
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Professional Headline with quick suggestions */}
                <div className="space-y-2">
                  <label
                    htmlFor="step1-headline"
                    className="block text-xs font-bold"
                  >
                    {isAr
                      ? 'المسمى المهني (Job Title / Headline) *'
                      : 'Professional Headline / Job Title *'}
                  </label>
                  <input
                    id="step1-headline"
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder={
                      isAr
                        ? 'اختر من المقترحات بالأسفل أو اكتب مسماك المهني المخصص...'
                        : 'Pick a suggestion below or type your custom title...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1 max-h-28 overflow-y-auto">
                    {PROFESSIONAL_HEADLINE_SUGGESTIONS.map((item) => {
                      const active = headline === item.en || headline === item.ar;
                      return (
                        <button
                          key={item.en}
                          type="button"
                          onClick={() => {
                            setHeadline(isAr ? item.ar : item.en);
                            setCategory(item.category);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            active
                              ? 'bg-[#007AFF] text-white'
                              : 'bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
                          }`}
                        >
                          {isAr ? item.ar : item.en}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="step1-specialization"
                      className="block text-xs font-bold"
                    >
                      {isAr
                        ? 'التخصص الدقيق / المجال الفرعي *'
                        : 'Primary Specialization / Sub-field *'}
                    </label>
                    <input
                      id="step1-specialization"
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder={
                        isAr
                          ? 'مثال: تطبيقات SaaS، تصميم واجهات الجوال، الترجمة التقنية...'
                          : 'e.g., SaaS Web Apps, Mobile UI Design, FinTech Copywriting...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="step1-level"
                      className="block text-xs font-bold"
                    >
                      {isAr
                        ? 'المستوى المهني الحالي *'
                        : 'Current Professional Level *'}
                    </label>
                    <select
                      id="step1-level"
                      value={professionalLevel}
                      onChange={(e) => setProfessionalLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    >
                      <option value="Beginner" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'مبتدئ (Beginner)' : 'Beginner'}
                      </option>
                      <option value="Junior" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'مستوى أولي (Junior)' : 'Junior'}
                      </option>
                      <option value="Mid-level" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'متوسط الخبرة (Mid-level)' : 'Mid-level'}
                      </option>
                      <option value="Senior" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'متقدم (Senior)' : 'Senior'}
                      </option>
                      <option value="Expert" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'خبير (Expert)' : 'Expert'}
                      </option>
                      <option
                        value="Lead / Consultant"
                        className="bg-white dark:bg-[#0F172A]"
                      >
                        {isAr
                          ? 'قائد تقني / مستشار (Lead / Consultant)'
                          : 'Lead / Consultant'}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="step1-country"
                      className="block text-xs font-bold"
                    >
                      {isAr ? 'الدولة / الإقامة *' : 'Country / Location *'}
                    </label>
                    <input
                      id="step1-country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder={
                        isAr ? 'مثال: السعودية، مصر، الإمارات...' : 'e.g., Saudi Arabia, UAE, UK...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="step1-worklang"
                      className="block text-xs font-bold"
                    >
                      {isAr
                        ? 'لغات العمل والتواصل المفضلة *'
                        : 'Preferred Working Language *'}
                    </label>
                    <input
                      id="step1-worklang"
                      type="text"
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      placeholder={
                        isAr ? 'العربية والإنجليزية' : 'Arabic & English'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="step1-rate"
                      className="block text-xs font-bold"
                    >
                      {isAr
                        ? 'سعر الساعة الاسترشادي ($/hr)'
                        : 'Target Hourly Rate ($/hr)'}
                    </label>
                    <input
                      id="step1-rate"
                      type="number"
                      min={5}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 font-mono text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="step1-summary"
                    className="block text-xs font-bold"
                  >
                    {isAr
                      ? 'النبذة المهنية المختصرة (ماذا تقدم وما نوع العمل الذي تتقنه؟) *'
                      : 'Short Professional Introduction (What do you do and specialize in?) *'}
                  </label>
                  <textarea
                    id="step1-summary"
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder={
                      isAr
                        ? 'اكتب جملتين أو ثلاث تصف مجالك المهني ونوع الحلول أو الخدمات التي تقدمها للعملاء بوضوح...'
                        : 'Write 2-3 sentences describing your focus and the value you deliver to clients...'
                    }
                    className="w-full p-3.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm leading-relaxed"
                  />
                </div>
              </motion.div>
            )}

            {/* ==============================================================
                STEP 2: EDUCATION & QUALIFICATIONS
               ============================================================== */}
            {currentStep === 2 && (
              <motion.div
                key="onboard-step-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#090E1A] dark:text-white">
                    {isAr
                      ? '2. التعليم والمؤهلات العلمية'
                      : '2. Education & Qualifications'}
                  </h1>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                    {isAr
                      ? 'حدد مؤهلك الدراسي أو مسار التعلم الذاتي والتدريب العملي الخاص بك.'
                      : 'Specify your educational background or self-taught learning path.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="step2-level"
                      className="block text-xs font-bold"
                    >
                      {isAr
                        ? 'أعلى مؤهل تعليمي *'
                        : 'Highest Education Level *'}
                    </label>
                    <select
                      id="step2-level"
                      value={highestLevel}
                      onChange={(e) => setHighestLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    >
                      <option value="no_formal" className="bg-white dark:bg-[#0F172A]">
                        {isAr
                          ? 'بدون مؤهل أكاديمي رسمي / تعلم ذاتي (No formal education)'
                          : 'No formal education / Self-taught'}
                      </option>
                      <option value="high_school" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'ثانوية عامة (Secondary / High School)' : 'Secondary / High School'}
                      </option>
                      <option value="vocational" className="bg-white dark:bg-[#0F172A]">
                        {isAr
                          ? 'تأهيل مهني / تقني (Vocational / Technical)'
                          : 'Vocational / Technical Education'}
                      </option>
                      <option value="diploma" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'دبلوم (Diploma / Associate)' : 'Diploma / Associate Degree'}
                      </option>
                      <option value="bachelor" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'بكالوريوس (Bachelor’s Degree)' : "Bachelor's Degree"}
                      </option>
                      <option value="master" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'ماجستير (Master’s Degree)' : "Master's Degree"}
                      </option>
                      <option value="doctorate" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'دكتوراه (Doctoral Degree / PhD)' : 'Doctoral Degree / PhD'}
                      </option>
                      <option value="other" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'أخرى (Other)' : 'Other'}
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="step2-status"
                      className="block text-xs font-bold"
                    >
                      {isAr
                        ? 'حالة التخرج أو الدراسة *'
                        : 'Graduation / Study Status *'}
                    </label>
                    <select
                      id="step2-status"
                      value={graduationStatus}
                      onChange={(e) => setGraduationStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    >
                      <option value="graduated" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'متخرج (Graduated)' : 'Graduated'}
                      </option>
                      <option value="studying" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'طالب حالياً (Currently Studying)' : 'Currently Studying'}
                      </option>
                      <option value="self_taught" className="bg-white dark:bg-[#0F172A]">
                        {isAr
                          ? 'ممارس بالتعلم الذاتي المستمر (Self-Taught Practitioner)'
                          : 'Self-Taught Practitioner'}
                      </option>
                    </select>
                  </div>
                </div>

                {highestLevel !== 'no_formal' && (
                  <div className="space-y-2">
                    <label
                      htmlFor="step2-field"
                      className="block text-xs font-bold"
                    >
                      {isAr
                        ? 'مجال الدراسة / التخصص الأكاديمي *'
                        : 'Field of Study / Major *'}
                    </label>
                    <input
                      id="step2-field"
                      type="text"
                      value={fieldOfStudy}
                      onChange={(e) => setFieldOfStudy(e.target.value)}
                      placeholder={
                        isAr
                          ? 'اختر من المجالات المقترحة أدناه أو اكتب تخصصك الدراسي...'
                          : 'Pick from suggestions below or type your major...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    />
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                      {FIELD_OF_STUDY_SUGGESTIONS.map((fos) => (
                        <button
                          key={fos}
                          type="button"
                          onClick={() => setFieldOfStudy(fos)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                            fieldOfStudy === fos
                              ? 'bg-[#007AFF] text-white font-bold'
                              : 'bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08]'
                          }`}
                        >
                          {fos}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="step2-inst"
                      className="block text-xs font-bold"
                    >
                      {isAr
                        ? 'اسم الجامعة / المعهد / جهة التدريب (اختياري)'
                        : 'Institution / University / Academy (Optional)'}
                    </label>
                    <input
                      id="step2-inst"
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder={
                        isAr ? 'مثال: جامعة الملك سعود' : 'e.g., King Saud University'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="step2-year"
                      className="block text-xs font-bold"
                    >
                      {isAr
                        ? 'سنة التخرج أو التخرج المتوقع (اختياري)'
                        : 'Graduation Year (Optional)'}
                    </label>
                    <input
                      id="step2-year"
                      type="text"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2024"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 font-mono text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="step2-courses"
                      className="block text-xs font-bold"
                    >
                      {isAr
                        ? 'معسكرات تدريبية أو مسارات تعلم ذاتي بارزة (اختياري)'
                        : 'Relevant Bootcamps or Self-Learning Tracks (Optional)'}
                    </label>
                    <input
                      id="step2-courses"
                      type="text"
                      value={relevantCourses}
                      onChange={(e) => setRelevantCourses(e.target.value)}
                      placeholder={
                        isAr
                          ? 'مثال: معسكر طويق، CS50، تخصص Google UX...'
                          : 'e.g., Full-Stack Bootcamp, Google UX Certificate...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="step2-licenses"
                      className="block text-xs font-bold"
                    >
                      {isAr
                        ? 'اعتمادات أو رخص مهنية (اختياري)'
                        : 'Professional Licenses / Accreditations (Optional)'}
                    </label>
                    <input
                      id="step2-licenses"
                      type="text"
                      value={professionalLicenses}
                      onChange={(e) => setProfessionalLicenses(e.target.value)}
                      placeholder={
                        isAr
                          ? 'مثال: وثيقة العمل الحر، PMP، عضوية هيئة المهندسين...'
                          : 'e.g., Freelance License, PMP, CPA...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==============================================================
                STEP 3: SKILLS & COMPETENCIES
               ============================================================== */}
            {currentStep === 3 && (
              <motion.div
                key="onboard-step-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#090E1A] dark:text-white">
                      {isAr
                        ? '3. المهارات والكفاءات ومستوى الإتقان'
                        : '3. Skills, Competencies & Proficiency'}
                    </h1>
                    <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                      {isAr
                        ? 'اختر 3 مهارات حقيقية على الأقل وحدد مستوى إتقانك لكل مهارة ليستخدمها Lens AI في قياس توافق المشاريع.'
                        : 'Select at least 3 real skills and set your proficiency level for accurate AI project matching.'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#007AFF]/15 text-[#0055D4] dark:text-[#60A5FA] text-xs font-extrabold">
                    {isAr
                      ? `المهارات المختارة: ${skills.length}`
                      : `Selected Skills: ${skills.length}`}
                  </span>
                </div>

                {/* Search & Custom Skill Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-7 relative">
                    <Search className="w-4 h-4 text-[#64748B] absolute top-3 start-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder={
                        isAr
                          ? 'ابحث في أكثر من 100 مهارة مهنية وتقنية...'
                          : 'Search across 100+ professional & technical skills...'
                      }
                      className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    />
                  </div>

                  <form
                    onSubmit={handleAddCustomSkill}
                    className="sm:col-span-5 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      placeholder={
                        isAr ? 'أو أضف مهارة مخصصة...' : 'Or add custom skill...'
                      }
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs sm:text-sm"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold text-xs flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? 'إضافة' : 'Add'}</span>
                    </button>
                  </form>
                </div>

                {/* Category Tabs */}
                {!skillSearch.trim() && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {CATEGORIZED_SKILLS_CATALOG.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveSkillCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                          activeSkillCategory === cat.id
                            ? 'bg-[#090E1A] dark:bg-white text-white dark:text-[#090E1A]'
                            : 'bg-black/[0.04] dark:bg-white/[0.05] text-[#475569] dark:text-[#CBD5E1]'
                        }`}
                      >
                        {isAr ? cat.titleAr : cat.titleEn}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selectable Skill Chips */}
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {filteredCatalogSkills.map((skName) => {
                    const isSelected = skills.some(
                      (s) => s.name.toLowerCase() === skName.toLowerCase()
                    );
                    return (
                      <button
                        key={skName}
                        type="button"
                        onClick={() => toggleSkillByName(skName)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-[#007AFF] text-white shadow-xs'
                            : 'bg-white dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-[#1E293B] dark:text-[#E2E8F0] hover:border-[#007AFF]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{skName}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Skills Proficiency & Experience Editor */}
                {skills.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="text-xs font-extrabold text-[#090E1A] dark:text-white">
                      {isAr
                        ? 'تخصيص مستوى الإتقان وسنوات الخبرة لكل مهارة مختارة:'
                        : 'Configure Proficiency & Experience for Selected Skills:'}
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pe-1">
                      {skills.map((sk) => (
                        <div
                          key={sk.id}
                          className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <span className="text-xs sm:text-sm font-extrabold text-[#090E1A] dark:text-white">
                              {sk.name}
                            </span>
                            {sk.isPrimary && (
                              <span className="px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#248A3D] dark:text-[#34C759] text-[10px] font-bold">
                                {isAr ? 'أساسية' : 'Primary'}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              aria-label={`Proficiency for ${sk.name}`}
                              value={sk.proficiency || 'Advanced'}
                              onChange={(e) =>
                                updateSkillDetail(sk.id, {
                                  proficiency: e.target.value as SkillProficiency,
                                })
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs font-semibold"
                            >
                              <option value="Beginner">
                                {isAr ? 'مبتدئ (Beginner)' : 'Beginner'}
                              </option>
                              <option value="Intermediate">
                                {isAr ? 'متوسط (Intermediate)' : 'Intermediate'}
                              </option>
                              <option value="Advanced">
                                {isAr ? 'متقدم (Advanced)' : 'Advanced'}
                              </option>
                              <option value="Expert">
                                {isAr ? 'خبير (Expert)' : 'Expert'}
                              </option>
                            </select>

                            <select
                              aria-label={`Years of experience for ${sk.name}`}
                              value={String(sk.yearsOfExperience ?? 2)}
                              onChange={(e) =>
                                updateSkillDetail(sk.id, {
                                  yearsOfExperience: Number(e.target.value),
                                })
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs font-mono"
                            >
                              <option value="0">{isAr ? '< 1 سنة' : '< 1 yr'}</option>
                              <option value="1">{isAr ? '1 سنة' : '1 yr'}</option>
                              <option value="2">{isAr ? '2 سنتان' : '2 yrs'}</option>
                              <option value="3">{isAr ? '3 سنوات' : '3 yrs'}</option>
                              <option value="5">{isAr ? '5+ سنوات' : '5+ yrs'}</option>
                              <option value="8">{isAr ? '8+ سنوات' : '8+ yrs'}</option>
                            </select>

                            <label className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(sk.isPrimary)}
                                onChange={(e) =>
                                  updateSkillDetail(sk.id, {
                                    isPrimary: e.target.checked,
                                  })
                                }
                                className="accent-[#007AFF]"
                              />
                              <span>{isAr ? 'أساسية' : 'Primary'}</span>
                            </label>

                            <button
                              type="button"
                              onClick={() =>
                                setSkills((prev) =>
                                  prev.filter((item) => item.id !== sk.id)
                                )
                              }
                              aria-label={`Remove ${sk.name}`}
                              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#FF3B30]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Honest Option for Users with Fewer than 3 Skills */}
                <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={fewerSkillsChecked}
                      onChange={(e) => setFewerSkillsChecked(e.target.checked)}
                      className="w-4 h-4 accent-[#007AFF]"
                    />
                    <span>
                      {isAr
                        ? 'لدي حالياً أقل من 3 مهارات (أرغب في الاكتفاء بمهارة أو مهارتين حقيقيتين فقط دون إضافة مهارات غير متقنة)'
                        : 'I currently have fewer than 3 skills (keep my profile strictly focused on 1-2 honest skills)'}
                    </span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* ==============================================================
                STEP 4: WORK EXPERIENCE
               ============================================================== */}
            {currentStep === 4 && (
              <motion.div
                key="onboard-step-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#090E1A] dark:text-white">
                    {isAr ? '4. الخبرة العملية والمهنية' : '4. Work Experience'}
                  </h1>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                    {isAr
                      ? 'أضف خبراتك العملية أو مشاريعك المستقلة، أو اختر بصدق "لا توجد خبرة مهنية بعد" إذا كنت في بداية مسيرتك.'
                      : 'Add your work or freelance history, or honestly select "No professional experience yet".'}
                  </p>
                </div>

                {/* Toggle: Has Experience vs No Experience Yet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHasWorkExperience(true)}
                    className={`p-4 rounded-2xl border text-start transition-all ${
                      hasWorkExperience
                        ? 'bg-[#007AFF]/10 border-[#007AFF] text-[#090E1A] dark:text-white'
                        : 'bg-black/[0.03] dark:bg-white/[0.04] border-black/10 dark:border-white/10'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-extrabold">
                      {isAr
                        ? 'لدي خبرة عملية أو مشاريع سابقة'
                        : 'I have prior work or project experience'}
                    </div>
                    <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-1">
                      {isAr
                        ? 'عمل حر، وظيفة بدوام كامل/جزئي، تدريب تعاوني، أو مشاريع شخصية/أكاديمية'
                        : 'Freelance, full-time, part-time, internship, or personal/academic projects'}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasWorkExperience(false)}
                    className={`p-4 rounded-2xl border text-start transition-all ${
                      !hasWorkExperience
                        ? 'bg-[#34C759]/15 border-[#34C759] text-[#090E1A] dark:text-white'
                        : 'bg-black/[0.03] dark:bg-white/[0.04] border-black/10 dark:border-white/10'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-extrabold">
                      {isAr
                        ? 'لا توجد خبرة مهنية بعد (بداية المسيرة)'
                        : 'No professional experience yet'}
                    </div>
                    <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-1">
                      {isAr
                        ? 'سيعتمد Lens AI على مهاراتك الحقيقية ومؤهلك دون اختلاق أي شركات أو عملاء سابقين.'
                        : 'Lens AI will rely on your skills and education without fabricating past employers.'}
                    </p>
                  </button>
                </div>

                {hasWorkExperience && (
                  <div className="space-y-4">
                    <form
                      onSubmit={handleAddExperienceEntry}
                      className="p-4 sm:p-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-3.5"
                    >
                      <div className="text-xs font-extrabold text-[#007AFF] dark:text-[#60A5FA]">
                        {isAr ? 'إضافة خبرة عملية أو مشروع:' : 'Add Experience Entry:'}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={expJobTitle}
                          onChange={(e) => setExpJobTitle(e.target.value)}
                          placeholder={
                            isAr
                              ? 'المسمى الوظيفي / الدور *'
                              : 'Job Title / Role *'
                          }
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                        />

                        <select
                          value={expType}
                          onChange={(e) => setExpType(e.target.value)}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                        >
                          <option value="freelance">
                            {isAr ? 'عمل حر (Freelance)' : 'Freelance'}
                          </option>
                          <option value="full_time">
                            {isAr ? 'دوام كامل (Full-time)' : 'Full-time'}
                          </option>
                          <option value="part_time">
                            {isAr ? 'دوام جزئي (Part-time)' : 'Part-time'}
                          </option>
                          <option value="internship">
                            {isAr ? 'تدريب (Internship)' : 'Internship'}
                          </option>
                          <option value="personal_project">
                            {isAr ? 'مشروع شخصي (Personal Project)' : 'Personal Project'}
                          </option>
                          <option value="academic_project">
                            {isAr ? 'مشروع أكاديمي (Academic Project)' : 'Academic Project'}
                          </option>
                        </select>

                        <input
                          type="text"
                          value={expOrg}
                          onChange={(e) => setExpOrg(e.target.value)}
                          placeholder={
                            isAr
                              ? 'العميل / الشركة (اختياري)'
                              : 'Organization / Client (Optional)'
                          }
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={expDescription}
                        onChange={(e) => setExpDescription(e.target.value)}
                        placeholder={
                          isAr
                            ? 'أهم المسؤوليات والإنجازات التي نفذتها في هذه الخبرة *'
                            : 'Key responsibilities and achievements *'
                        }
                        className="w-full p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <input
                          type="text"
                          value={expTools}
                          onChange={(e) => setExpTools(e.target.value)}
                          placeholder={
                            isAr
                              ? 'الأدوات والتقنيات المستخدمة (مفصولة بفاصلة)'
                              : 'Skills/tools used (comma separated)'
                          }
                          className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#007AFF] text-white font-bold text-xs flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>
                            {isAr ? 'إضافة إلى الخبرات' : 'Add Experience'}
                          </span>
                        </button>
                      </div>
                    </form>

                    {workExperience.length > 0 && (
                      <div className="space-y-2">
                        {workExperience.map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="text-xs sm:text-sm font-bold text-[#090E1A] dark:text-white">
                                {item.jobTitle}{' '}
                                <span className="text-[#007AFF] text-xs">
                                  ({item.experienceType})
                                </span>
                                {item.organizationOrClient
                                  ? ` · ${item.organizationOrClient}`
                                  : ''}
                              </div>
                              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                                {item.responsibilitiesAndAchievements}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setWorkExperience((prev) =>
                                  prev.filter((x) => x.id !== item.id)
                                )
                              }
                              className="p-1.5 text-[#64748B] hover:text-[#FF3B30]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ==============================================================
                STEP 5: CERTIFICATES & TRAINING (OPTIONAL)
               ============================================================== */}
            {currentStep === 5 && (
              <motion.div
                key="onboard-step-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#090E1A] dark:text-white">
                    {isAr
                      ? '5. الشهادات والدورات التدريبية (اختياري)'
                      : '5. Certificates & Training (Optional)'}
                  </h1>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                    {isAr
                      ? 'أضف الشهادات المهنية أو الدورات التدريبية المعتمدة التي حصلت عليها، أو اضغط "التالي" للتخطي.'
                      : 'Add any relevant certificates or training courses, or click Next to skip.'}
                  </p>
                </div>

                <form
                  onSubmit={handleAddCertificate}
                  className="p-4 sm:p-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={certName}
                      onChange={(e) => setCertName(e.target.value)}
                      placeholder={
                        isAr ? 'اسم الشهادة أو الدورة *' : 'Certificate / Course Name *'
                      }
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                    />
                    <input
                      type="text"
                      value={certOrg}
                      onChange={(e) => setCertOrg(e.target.value)}
                      placeholder={
                        isAr
                          ? 'الجهة المانحة (مثال: Google, AWS, Coursera) *'
                          : 'Issuing Organization *'
                      }
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                    />
                    <input
                      type="text"
                      value={certDate}
                      onChange={(e) => setCertDate(e.target.value)}
                      placeholder={isAr ? 'سنة الإتمام (2024)' : 'Completion Year'}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs font-mono"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <input
                      type="text"
                      value={certUrl}
                      onChange={(e) => setCertUrl(e.target.value)}
                      placeholder={
                        isAr
                          ? 'رابط التحقق أو رقم الاعتماد (اختياري)'
                          : 'Credential URL or ID (Optional)'
                      }
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#007AFF] text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? 'إضافة الشهادة' : 'Add Certificate'}</span>
                    </button>
                  </div>
                </form>

                {certificates.length > 0 ? (
                  <div className="space-y-2">
                    {certificates.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs sm:text-sm font-bold">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                            {c.issuingOrganization} · {c.completionDate}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCertificates((prev) =>
                              prev.filter((x) => x.id !== c.id)
                            )
                          }
                          className="p-1.5 text-[#64748B] hover:text-[#FF3B30]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-dashed border-black/15 dark:border-white/15 text-center text-xs text-[#64748B]">
                    {isAr
                      ? 'لا توجد شهادات مضافة حالياً. يمكنك إضافة شهادة أو المتابعة للخطوة التالية.'
                      : 'No certificates added yet. You may add one above or proceed to the next step.'}
                  </div>
                )}
              </motion.div>
            )}

            {/* ==============================================================
                STEP 6: PORTFOLIO & PREVIOUS PROJECTS (OPTIONAL)
               ============================================================== */}
            {currentStep === 6 && (
              <motion.div
                key="onboard-step-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#090E1A] dark:text-white">
                    {isAr
                      ? '6. معرض الأعمال والمشاريع السابقة (اختياري)'
                      : '6. Portfolio & Previous Projects (Optional)'}
                  </h1>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                    {isAr
                      ? 'أضف نماذج من أعمالك الاحترافية أو الشخصية أو الأكاديمية ليسترشد بها Lens AI عند صياغة العروض، أو تخطَّ هذه الخطوة الآن.'
                      : 'Add professional, personal, or academic projects so Lens AI can reference relevant work in proposals, or skip for now.'}
                  </p>
                </div>

                <form
                  onSubmit={handleAddPortfolioItem}
                  className="p-4 sm:p-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                      placeholder={isAr ? 'عنوان المشروع *' : 'Project Title *'}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                    />
                    <input
                      type="text"
                      value={projRole}
                      onChange={(e) => setProjRole(e.target.value)}
                      placeholder={
                        isAr ? 'دورك في المشروع' : 'Your Role in Project'
                      }
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                    />
                    <select
                      value={projType}
                      onChange={(e) => setProjType(e.target.value as any)}
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                    >
                      <option value="professional">
                        {isAr ? 'مشروع احترافي لعميل' : 'Professional Client Project'}
                      </option>
                      <option value="personal">
                        {isAr ? 'مشروع شخصي' : 'Personal Project'}
                      </option>
                      <option value="academic">
                        {isAr ? 'مشروع أكاديمي / تخرج' : 'Academic Project'}
                      </option>
                      <option value="demonstration">
                        {isAr ? 'نموذج تطبيقي (Demo)' : 'Demonstration Sample'}
                      </option>
                    </select>
                  </div>

                  <textarea
                    rows={2}
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    placeholder={
                      isAr
                        ? 'وصف مختصر للمشروع والنتيجة المحققة *'
                        : 'Brief project description and outcome *'
                    }
                    className="w-full p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <input
                      type="text"
                      value={projTech}
                      onChange={(e) => setProjTech(e.target.value)}
                      placeholder={
                        isAr
                          ? 'المهارات والأدوات المستخدمة (مفصولة بفاصلة)'
                          : 'Skills / tools used (comma separated)'
                      }
                      className="flex-1 min-w-[180px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                    />
                    <input
                      type="url"
                      value={projLink}
                      onChange={(e) => setProjLink(e.target.value)}
                      placeholder={
                        isAr ? 'رابط المشروع (اختياري)' : 'Project URL (Optional)'
                      }
                      className="flex-1 min-w-[180px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#007AFF] text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? 'إضافة المشروع' : 'Add Project'}</span>
                    </button>
                  </div>
                </form>

                {portfolio.length > 0 ? (
                  <div className="space-y-2">
                    {portfolio.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs sm:text-sm font-bold">
                            {p.title}{' '}
                            <span className="text-[#007AFF] text-xs">
                              ({p.projectType || p.category})
                            </span>
                          </div>
                          <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
                            {p.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setPortfolio((prev) =>
                              prev.filter((x) => x.id !== p.id)
                            )
                          }
                          className="p-1.5 text-[#64748B] hover:text-[#FF3B30]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-dashed border-black/15 dark:border-white/15 text-center text-xs text-[#64748B]">
                    {isAr
                      ? 'يمكنك إضافة مشاريع لمعرض أعمالك الآن أو إضافتها لاحقاً من صفحة الملف المهني.'
                      : 'You can add portfolio projects now or anytime later from your Profile page.'}
                  </div>
                )}
              </motion.div>
            )}

            {/* ==============================================================
                STEP 7: FREELANCE GOALS & PREFERENCES
               ============================================================== */}
            {currentStep === 7 && (
              <motion.div
                key="onboard-step-7"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#090E1A] dark:text-white">
                    {isAr
                      ? '7. أهداف وتفضيلات العمل الحر'
                      : '7. Freelance Goals & Preferences'}
                  </h1>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                    {isAr
                      ? 'حدد أنواع المشاريع والمنصات وأهدافك المهنية ليخصص Lens AI التوصيات والتسعير لك.'
                      : 'Select your preferred project types, availability, and goals to tailor Lens AI recommendations.'}
                  </p>
                </div>

                {/* Preferred Project Types */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold">
                    {isAr
                      ? 'أنواع المشاريع التي ترغب بالعمل عليها *'
                      : 'Types of Projects You Want to Work On *'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_TYPE_OPTIONS.map((pt) => {
                      const active = prefProjectTypes.includes(pt);
                      return (
                        <button
                          key={pt}
                          type="button"
                          onClick={() =>
                            setPrefProjectTypes((prev) =>
                              prev.includes(pt)
                                ? prev.filter((x) => x !== pt)
                                : [...prev, pt]
                            )
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            active
                              ? 'bg-[#007AFF] text-white'
                              : 'bg-black/[0.04] dark:bg-white/[0.05] text-[#334155] dark:text-[#CBD5E1]'
                          }`}
                        >
                          {pt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">
                      {isAr ? 'حجم وتعقيد المشاريع المفضل' : 'Preferred Complexity'}
                    </label>
                    <select
                      value={prefComplexity}
                      onChange={(e) => setPrefComplexity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs"
                    >
                      <option value="small" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'مهام صغيرة وسريعة' : 'Small & Quick Tasks'}
                      </option>
                      <option value="medium" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'مشاريع متوسطة' : 'Medium Projects'}
                      </option>
                      <option value="large" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'مشاريع كبيرة ومتكاملة' : 'Large Complex Projects'}
                      </option>
                      <option value="long_term" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'عقود طويلة الأمد' : 'Long-Term Contracts'}
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">
                      {isAr ? 'العملة المفضلة للتسعير *' : 'Preferred Currency *'}
                    </label>
                    <select
                      value={prefCurrency}
                      onChange={(e) => setPrefCurrency(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs"
                    >
                      <option value="USD ($)" className="bg-white dark:bg-[#0F172A]">
                        USD ($)
                      </option>
                      <option value="EUR (€)" className="bg-white dark:bg-[#0F172A]">
                        EUR (€)
                      </option>
                      <option value="SAR (ر.س)" className="bg-white dark:bg-[#0F172A]">
                        SAR (ر.س)
                      </option>
                      <option value="AED (د.إ)" className="bg-white dark:bg-[#0F172A]">
                        AED (د.إ)
                      </option>
                      <option value="GBP (£)" className="bg-white dark:bg-[#0F172A]">
                        GBP (£)
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">
                      {isAr ? 'التفرغ الأسبوعي *' : 'Weekly Availability *'}
                    </label>
                    <select
                      value={prefAvailability}
                      onChange={(e) => setPrefAvailability(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs"
                    >
                      <option
                        value="أقل من 10 ساعات/أسبوع"
                        className="bg-white dark:bg-[#0F172A]"
                      >
                        {isAr ? 'أقل من 10 ساعات/أسبوع' : '< 10 hrs/week'}
                      </option>
                      <option
                        value="10 - 20 ساعة/أسبوع"
                        className="bg-white dark:bg-[#0F172A]"
                      >
                        {isAr ? '10 - 20 ساعة/أسبوع' : '10 - 20 hrs/week'}
                      </option>
                      <option
                        value="20 - 30 ساعة/أسبوع"
                        className="bg-white dark:bg-[#0F172A]"
                      >
                        {isAr ? '20 - 30 ساعة/أسبوع' : '20 - 30 hrs/week'}
                      </option>
                      <option
                        value="تفرغ كامل (+35 ساعة/أسبوع)"
                        className="bg-white dark:bg-[#0F172A]"
                      >
                        {isAr ? 'تفرغ كامل (+35 ساعة/أسبوع)' : 'Full-time (35+ hrs/wk)'}
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">
                      {isAr ? 'أسلوب العمل المفضل *' : 'Working Arrangement *'}
                    </label>
                    <select
                      value={prefArrangement}
                      onChange={(e) => setPrefArrangement(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-xs"
                    >
                      <option value="independent" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'مستقل فردي (Independent)' : 'Independent Freelancer'}
                      </option>
                      <option value="team" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'ضمن فريق (Team Collaboration)' : 'Team Collaboration'}
                      </option>
                      <option value="both" className="bg-white dark:bg-[#0F172A]">
                        {isAr ? 'كلاهما (Both)' : 'Both'}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Platforms of Interest */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold">
                    {isAr
                      ? 'منصات العمل الحر التي تهتم باستهدافها (لا يفترض اتصالاً تلقائياً):'
                      : 'Freelance Platforms of Interest (no automatic connection assumed):'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map((plat) => {
                      const active = prefPlatforms.includes(plat);
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() =>
                            setPrefPlatforms((prev) =>
                              prev.includes(plat)
                                ? prev.filter((x) => x !== plat)
                                : [...prev, plat]
                            )
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            active
                              ? 'bg-[#007AFF] text-white'
                              : 'bg-black/[0.04] dark:bg-white/[0.05]'
                          }`}
                        >
                          {plat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Career Goals */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold">
                    {isAr ? 'أهدافك المهنية في Firework AI:' : 'Your Career Goals:'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CAREER_GOAL_OPTIONS.map((goal) => {
                      const active = prefGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() =>
                            setPrefGoals((prev) =>
                              prev.includes(goal)
                                ? prev.filter((x) => x !== goal)
                                : [...prev, goal]
                            )
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            active
                              ? 'bg-[#34C759]/20 border border-[#34C759] text-[#090E1A] dark:text-white'
                              : 'bg-black/[0.04] dark:bg-white/[0.05]'
                          }`}
                        >
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==============================================================
                STEP 8: PROFILE REVIEW & COMPLETION
               ============================================================== */}
            {currentStep === 8 && (
              <motion.div
                key="onboard-step-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#090E1A] dark:text-white">
                      {isAr
                        ? '8. مراجعة واعتماد ملفك المهني الموحد'
                        : '8. Review & Complete Your Professional Profile'}
                    </h1>
                    <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1">
                      {isAr
                        ? 'تأكد من صحة بياناتك قبل حفظها والدخول إلى مساحة عمل Firework AI.'
                        : 'Verify your information before saving and entering the Firework AI workspace.'}
                    </p>
                  </div>

                  <div className="px-4 py-2.5 rounded-2xl bg-[#34C759]/15 border border-[#34C759]/30 text-center">
                    <div className="text-lg font-extrabold text-[#248A3D] dark:text-[#34C759]">
                      {completeness.totalPercentage}%
                    </div>
                    <div className="text-[10px] font-bold text-[#475569] dark:text-[#CBD5E1]">
                      {isAr ? 'اكتمال الملف المهني' : 'Profile Completion'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Identity */}
                  <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#007AFF]">
                        {isAr ? '1. الهوية والتخصص' : '1. Identity & Specialization'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-bold text-[#475569] hover:text-[#007AFF] flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                      </button>
                    </div>
                    <div className="text-sm font-bold">{fullName}</div>
                    <div className="text-xs text-[#475569] dark:text-[#CBD5E1]">
                      {headline} · {specialization} ({professionalLevel})
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {country} · ${hourlyRate}/hr · {preferredLanguage}
                    </div>
                  </div>

                  {/* Card 2: Education */}
                  <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#007AFF]">
                        {isAr ? '2. المؤهل التعليمي' : '2. Education'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-bold text-[#475569] hover:text-[#007AFF] flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                      </button>
                    </div>
                    <div className="text-sm font-bold">
                      {highestLevel === 'no_formal'
                        ? isAr
                          ? 'مسار تعلم ذاتي وتدريب عملي'
                          : 'Self-Taught Learning Path'
                        : `${highestLevel.toUpperCase()} — ${fieldOfStudy}`}
                    </div>
                    <div className="text-xs text-[#475569] dark:text-[#CBD5E1]">
                      {institutionName || (isAr ? 'الحالة:' : 'Status:')} {graduationStatus}
                    </div>
                  </div>

                  {/* Card 3: Skills */}
                  <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#007AFF]">
                        {isAr
                          ? `3. المهارات المعتمدة (${skills.length})`
                          : `3. Verified Skills (${skills.length})`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs font-bold text-[#475569] hover:text-[#007AFF] flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <span
                          key={s.id}
                          className="px-2.5 py-1 rounded-lg bg-[#007AFF]/15 text-[#0055D4] dark:text-[#60A5FA] text-[11px] font-bold"
                        >
                          {s.name} ({s.proficiency || s.level})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card 4: Experience & Portfolio */}
                  <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#007AFF]">
                        {isAr
                          ? '4. الخبرة والشهادات ومعرض الأعمال'
                          : '4. Experience, Certificates & Portfolio'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="text-xs font-bold text-[#475569] hover:text-[#007AFF] flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                      </button>
                    </div>
                    <div className="text-xs text-[#334155] dark:text-[#CBD5E1] space-y-1">
                      <div>
                        •{' '}
                        {!hasWorkExperience
                          ? isAr
                            ? 'لا توجد خبرة مهنية سابقة بعد (بداية المسيرة)'
                            : 'No prior work experience yet'
                          : isAr
                          ? `${workExperience.length} خبرات عملية مسجلة`
                          : `${workExperience.length} work experience entries`}
                      </div>
                      <div>
                        •{' '}
                        {isAr
                          ? `${certificates.length} شهادات تدريبية · ${portfolio.length} مشاريع في المعرض`
                          : `${certificates.length} certificates · ${portfolio.length} portfolio projects`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Completion Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCompleteOnboarding}
                    className="spring-btn w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#007AFF] to-[#34C759] text-white font-extrabold text-sm sm:text-base shadow-[0_14px_36px_rgba(0,122,255,0.35)] flex items-center justify-center gap-2.5 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>
                      {isAr
                        ? 'حفظ الملف المهني والدخول إلى مساحة عمل Firework AI'
                        : 'Save Profile & Enter Firework AI Workspace'}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Wizard Navigation Controls */}
          <div className="pt-5 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="spring-btn px-5 py-2.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] text-xs sm:text-sm font-bold text-[#334155] dark:text-[#CBD5E1] flex items-center gap-2"
              >
                {isRTL ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <ArrowLeft className="w-4 h-4" />
                )}
                <span>{isAr ? 'الخطوة السابقة' : 'Previous Step'}</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 8 && (
              <div className="flex items-center gap-2.5">
                {(currentStep === 5 || currentStep === 6) && (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#090E1A] dark:hover:text-white"
                  >
                    {isAr ? 'تخطي هذه الخطوة الآن' : 'Skip for Now'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="spring-btn px-6 py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white font-bold text-xs sm:text-sm shadow-[0_8px_22px_rgba(0,122,255,0.3)] flex items-center gap-2"
                >
                  <span>
                    {isAr ? 'حفظ والانتقال للتالي' : 'Save & Continue'}
                  </span>
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

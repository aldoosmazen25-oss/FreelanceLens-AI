import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Trash2,
  Check,
  Award,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Compass,
  Wrench,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { MatchRing } from '../components/common/MatchRing';
import { useData } from '../context/DataContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  calculateComprehensiveProfileCompleteness,
  CATEGORIZED_SKILLS_CATALOG,
} from '../utils/calculations';
import {
  SkillProficiency,
  WorkExperienceEntry,
  CertificateEntry,
  PortfolioItem,
} from '../types';

const PROFICIENCY_TO_ARABIC: Record<
  SkillProficiency,
  'خبير' | 'متقدم' | 'متوسط' | 'مبتدئ'
> = {
  Expert: 'خبير',
  Advanced: 'متقدم',
  Intermediate: 'متوسط',
  Beginner: 'مبتدئ',
};

export const ProfileView: React.FC = () => {
  const { userProfile, updateUserProfile } = useData();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<
    | 'identity'
    | 'education'
    | 'skills'
    | 'experience'
    | 'certificates'
    | 'portfolio'
    | 'preferences'
  >('identity');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Identity state
  const [name, setName] = useState(userProfile.fullName || userProfile.name || '');
  const [title, setTitle] = useState(
    userProfile.professionalHeadline || userProfile.title || ''
  );
  const [category, setCategory] = useState(
    userProfile.professionalCategory || 'Software Development & Engineering'
  );
  const [specialization, setSpecialization] = useState(
    userProfile.specialization || ''
  );
  const [level, setLevel] = useState(userProfile.professionalLevel || 'Mid-level');
  const [country, setCountry] = useState(userProfile.country || '');
  const [preferredLanguage, setPreferredLanguage] = useState(
    userProfile.preferredLanguage || 'العربية والإنجليزية'
  );
  const [bio, setBio] = useState(
    userProfile.professionalSummary || userProfile.bio || ''
  );
  const [hourlyRate, setHourlyRate] = useState(String(userProfile.hourlyRate || 50));
  const [availability, setAvailability] = useState(
    userProfile.availability || 'متاح للعمل الحر'
  );

  // Education state
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

  // Skills state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] =
    useState<SkillProficiency>('Advanced');
  const [newSkillYears, setNewSkillYears] = useState('2');

  // Experience state
  const [hasWorkExp, setHasWorkExp] = useState<boolean>(
    userProfile.hasWorkExperience ?? true
  );
  const [expJobTitle, setExpJobTitle] = useState('');
  const [expType, setExpType] = useState('freelance');
  const [expOrg, setExpOrg] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Certificates state
  const [certName, setCertName] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certYear, setCertYear] = useState('2024');

  // Portfolio state
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portTech, setPortTech] = useState('');
  const [portLink, setPortLink] = useState('');

  // Preferences state
  const [prefCurrency, setPrefCurrency] = useState(
    userProfile.freelancePreferences?.preferredCurrency || 'USD ($)'
  );
  const [prefComplexity, setPrefComplexity] = useState(
    userProfile.freelancePreferences?.preferredComplexity || 'medium'
  );
  const [prefArrangement, setPrefArrangement] = useState(
    userProfile.freelancePreferences?.workingArrangement || 'independent'
  );

  useEffect(() => {
    setName(userProfile.fullName || userProfile.name || '');
    setTitle(userProfile.professionalHeadline || userProfile.title || '');
    setCategory(
      userProfile.professionalCategory || 'Software Development & Engineering'
    );
    setSpecialization(userProfile.specialization || '');
    setLevel(userProfile.professionalLevel || 'Mid-level');
    setCountry(userProfile.country || '');
    setPreferredLanguage(
      userProfile.preferredLanguage || 'العربية والإنجليزية'
    );
    setBio(userProfile.professionalSummary || userProfile.bio || '');
    setHourlyRate(String(userProfile.hourlyRate || 50));
    setAvailability(userProfile.availability || 'متاح للعمل الحر');
    if (userProfile.education) {
      setHighestLevel(userProfile.education.highestLevel || 'bachelor');
      setFieldOfStudy(userProfile.education.fieldOfStudy || '');
      setGraduationStatus(userProfile.education.graduationStatus || 'graduated');
      setInstitutionName(userProfile.education.institutionName || '');
      setGraduationYear(userProfile.education.graduationYear || '');
      setRelevantCourses(userProfile.education.relevantCourses || '');
      setProfessionalLicenses(userProfile.education.professionalLicenses || '');
    }
    setHasWorkExp(userProfile.hasWorkExperience ?? true);
  }, [userProfile]);

  const completeness = calculateComprehensiveProfileCompleteness(userProfile);

  const showSavedFeedback = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      name: name.trim() || userProfile.name,
      fullName: name.trim() || userProfile.name,
      title: title.trim(),
      professionalHeadline: title.trim(),
      professionalCategory: category,
      specialization: specialization.trim(),
      professionalLevel: level,
      country: country.trim(),
      preferredLanguage: preferredLanguage.trim(),
      bio: bio.trim(),
      professionalSummary: bio.trim(),
      hourlyRate: Number(hourlyRate) || 50,
      availability: availability.trim(),
    });
    showSavedFeedback();
  };

  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      education: {
        highestLevel,
        fieldOfStudy: fieldOfStudy.trim(),
        graduationStatus,
        institutionName: institutionName.trim(),
        graduationYear: graduationYear.trim(),
        relevantCourses: relevantCourses.trim(),
        professionalLicenses: professionalLicenses.trim(),
      },
    });
    showSavedFeedback();
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const item = {
      id: `sk-${Date.now()}`,
      name: newSkillName.trim(),
      level: PROFICIENCY_TO_ARABIC[newSkillProficiency],
      proficiency: newSkillProficiency,
      yearsOfExperience: Number(newSkillYears) || 2,
      isPrimary: userProfile.skills.length < 3,
      verified: true,
    };
    await updateUserProfile({
      skills: [...userProfile.skills, item],
    });
    setNewSkillName('');
    showSavedFeedback();
  };

  const handleDeleteSkill = async (id: string) => {
    await updateUserProfile({
      skills: userProfile.skills.filter((s) => s.id !== id),
    });
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expJobTitle.trim() || !expDesc.trim()) return;
    const entry: WorkExperienceEntry = {
      id: `exp-${Date.now()}`,
      jobTitle: expJobTitle.trim(),
      experienceType: expType,
      organizationOrClient: expOrg.trim() || undefined,
      startDate: '2023',
      endDate: 'Present',
      currentlyWorking: true,
      responsibilitiesAndAchievements: expDesc.trim(),
      skillsOrToolsUsed: [],
    };
    await updateUserProfile({
      hasWorkExperience: true,
      workExperience: [...(userProfile.workExperience || []), entry],
    });
    setExpJobTitle('');
    setExpOrg('');
    setExpDesc('');
    showSavedFeedback();
  };

  const handleDeleteExperience = async (id: string) => {
    await updateUserProfile({
      workExperience: (userProfile.workExperience || []).filter(
        (x) => x.id !== id
      ),
    });
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim() || !certOrg.trim()) return;
    const entry: CertificateEntry = {
      id: `cert-${Date.now()}`,
      name: certName.trim(),
      issuingOrganization: certOrg.trim(),
      completionDate: certYear.trim() || '2024',
      relevantSkills: [],
    };
    await updateUserProfile({
      certificates: [...(userProfile.certificates || []), entry],
    });
    setCertName('');
    setCertOrg('');
    showSavedFeedback();
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle.trim() || !portDesc.trim()) return;
    const entry: PortfolioItem = {
      id: `port-${Date.now()}`,
      title: portTitle.trim(),
      category: category,
      description: portDesc.trim(),
      impactMetric: 'Client Deliverable',
      techStack: portTech
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean),
      link: portLink.trim() || undefined,
      completedDate: new Date().toISOString().slice(0, 7),
    };
    await updateUserProfile({
      portfolio: [...userProfile.portfolio, entry],
    });
    setPortTitle('');
    setPortDesc('');
    setPortTech('');
    setPortLink('');
    showSavedFeedback();
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      availability,
      freelancePreferences: {
        ...(userProfile.freelancePreferences || {
          preferredCategories: [category],
          preferredProjectTypes: [],
          preferredIndustries: [],
          platformsOfInterest: ['Upwork'],
          careerGoals: [],
        }),
        preferredCurrency: prefCurrency,
        preferredComplexity: prefComplexity,
        weeklyAvailabilityHours: availability,
        workingArrangement: prefArrangement,
      },
    });
    showSavedFeedback();
  };

  const tabs = [
    {
      id: 'identity',
      label: isAr ? 'الهوية والتخصص' : 'Identity & Role',
      icon: UserCheck,
    },
    {
      id: 'education',
      label: isAr ? 'التعليم والمؤهلات' : 'Education',
      icon: GraduationCap,
    },
    {
      id: 'skills',
      label: isAr
        ? `المهارات (${userProfile.skills.length})`
        : `Skills (${userProfile.skills.length})`,
      icon: Wrench,
    },
    {
      id: 'experience',
      label: isAr
        ? `الخبرات (${(userProfile.workExperience || []).length})`
        : `Experience (${(userProfile.workExperience || []).length})`,
      icon: Briefcase,
    },
    {
      id: 'certificates',
      label: isAr
        ? `الشهادات (${(userProfile.certificates || []).length})`
        : `Certificates (${(userProfile.certificates || []).length})`,
      icon: Award,
    },
    {
      id: 'portfolio',
      label: isAr
        ? `معرض الأعمال (${userProfile.portfolio.length})`
        : `Portfolio (${userProfile.portfolio.length})`,
      icon: FolderGit2,
    },
    {
      id: 'preferences',
      label: isAr ? 'تفضيلات العمل الحر' : 'Preferences',
      icon: Compass,
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Top Completeness Summary Banner */}
      <GlassCard
        variant="hot"
        className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="text-xs font-extrabold text-[#007AFF] dark:text-[#60A5FA]">
            {isAr
              ? 'الملف المهني الموحد للمستقل (Unified Professional Profile)'
              : 'Unified Professional Profile'}
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#090E1A] dark:text-white">
            {userProfile.fullName || userProfile.name || 'Freelancer'} ·{' '}
            <span className="text-sm font-semibold text-[#475569] dark:text-[#CBD5E1]">
              {userProfile.professionalHeadline ||
                userProfile.title ||
                (isAr ? 'أكمل مسماك المهني' : 'Complete your headline')}
            </span>
          </h2>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
            {isAr
              ? 'تُستخدم بياناتك الحقيقية في هذه الصفحة مباشرة لتحليل توافق المشاريع وصياغة العروض وحساب التسعير دون أي بيانات وهمية.'
              : 'Your real profile data powers Lens AI project matching, proposal generation, and pricing without fabricated claims.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {savedSuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#34C759]/15 text-[#248A3D] dark:text-[#34C759] text-xs font-bold">
              <Check className="w-4 h-4" />
              {isAr ? 'تم حفظ التعديلات بنجاح' : 'Changes Saved'}
            </span>
          )}
          <MatchRing score={completeness.totalPercentage} size={68} />
        </div>
      </GlassCard>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`spring-btn px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                active
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'liquid-glass text-[#334155] dark:text-[#CBD5E1]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 1: Identity & Specialization */}
      {activeTab === 'identity' && (
        <GlassCard className="p-6 space-y-5">
          <form onSubmit={handleSaveIdentity} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {isAr ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {isAr ? 'المسمى المهني (Headline)' : 'Professional Headline'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {isAr ? 'التخصص الدقيق' : 'Primary Specialization'}
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {isAr ? 'المستوى المهني' : 'Professional Level'}
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                  <option value="Expert">Expert</option>
                  <option value="Lead / Consultant">Lead / Consultant</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {isAr ? 'الدولة' : 'Country'}
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {isAr ? 'سعر الساعة المعتمد ($/hr)' : 'Hourly Rate ($/hr)'}
                </label>
                <input
                  type="number"
                  min={5}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold">
                {isAr ? 'النبذة المهنية والخبرات' : 'Professional Summary'}
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold text-xs hover:bg-[#0062CC] transition-all"
              >
                {isAr ? 'حفظ الهوية المهنية' : 'Save Identity Changes'}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Section 2: Education */}
      {activeTab === 'education' && (
        <GlassCard className="p-6 space-y-5">
          <form onSubmit={handleSaveEducation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {isAr ? 'أعلى مؤهل تعليمي' : 'Highest Education Level'}
                </label>
                <select
                  value={highestLevel}
                  onChange={(e) => setHighestLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                >
                  <option value="no_formal">
                    {isAr ? 'تعلم ذاتي / بدون مؤهل رسمي' : 'No formal education / Self-taught'}
                  </option>
                  <option value="high_school">
                    {isAr ? 'ثانوية عامة' : 'High School'}
                  </option>
                  <option value="diploma">{isAr ? 'دبلوم' : 'Diploma'}</option>
                  <option value="bachelor">
                    {isAr ? 'بكالوريوس' : "Bachelor's"}
                  </option>
                  <option value="master">{isAr ? 'ماجستير' : "Master's"}</option>
                  <option value="doctorate">
                    {isAr ? 'دكتوراه' : 'Doctorate'}
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {isAr ? 'مجال الدراسة / التخصص' : 'Field of Study'}
                </label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {isAr ? 'اسم المؤسسة التعليمية' : 'Institution Name'}
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold text-xs"
              >
                {isAr ? 'حفظ المؤهل التعليمي' : 'Save Education'}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Section 3: Skills */}
      {activeTab === 'skills' && (
        <GlassCard className="p-6 space-y-5">
          <form
            onSubmit={handleAddSkill}
            className="flex flex-wrap items-center gap-2.5"
          >
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder={
                isAr ? 'اسم المهارة (مثال: TypeScript)...' : 'Skill name (e.g., TypeScript)...'
              }
              className="flex-1 min-w-[180px] px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
            />
            <select
              value={newSkillProficiency}
              onChange={(e) =>
                setNewSkillProficiency(e.target.value as SkillProficiency)
              }
              className="px-3 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
            >
              <option value="Beginner">Beginner (مبتدئ)</option>
              <option value="Intermediate">Intermediate (متوسط)</option>
              <option value="Advanced">Advanced (متقدم)</option>
              <option value="Expert">Expert (خبير)</option>
            </select>
            <select
              value={newSkillYears}
              onChange={(e) => setNewSkillYears(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs font-mono"
            >
              <option value="1">1 yr</option>
              <option value="2">2 yrs</option>
              <option value="3">3 yrs</option>
              <option value="5">5+ yrs</option>
            </select>
            <button
              type="submit"
              aria-label="إضافة مهارة جديدة"
              className="px-4 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة مهارة' : 'Add Skill'}</span>
            </button>
          </form>

          {/* Quick Add from Catalog */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {CATEGORIZED_SKILLS_CATALOG[0].skills.slice(0, 12).map((skName) => (
              <button
                key={skName}
                type="button"
                onClick={() => setNewSkillName(skName)}
                className="px-2.5 py-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.05] text-[11px] font-medium hover:bg-[#007AFF]/15"
              >
                + {skName}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {userProfile.skills.map((sk) => (
              <div
                key={sk.id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-xs"
              >
                <div>
                  <span className="font-bold">{sk.name}</span>
                  <span className="mx-2 text-[#64748B]">·</span>
                  <span className="text-[#007AFF] font-semibold">
                    {sk.proficiency || sk.level}
                  </span>
                  {sk.yearsOfExperience !== undefined && (
                    <span className="ms-2 text-[#64748B]">
                      ({sk.yearsOfExperience}y)
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(sk.id)}
                  aria-label={`حذف المهارة ${sk.name}`}
                  className="p-1 text-[#64748B] hover:text-[#FF3B30]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Section 4: Work Experience */}
      {activeTab === 'experience' && (
        <GlassCard className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">
              {isAr ? 'حالة الخبرة المهنية:' : 'Work Experience Status:'}
            </span>
            <button
              type="button"
              onClick={async () => {
                const next = !hasWorkExp;
                setHasWorkExp(next);
                await updateUserProfile({ hasWorkExperience: next });
                showSavedFeedback();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] text-xs font-bold"
            >
              {hasWorkExp
                ? isAr
                  ? 'التبديل إلى: لا توجد خبرة مهنية سابقة بعد'
                  : 'Switch to: No prior experience yet'
                : isAr
                ? 'التبديل إلى: لدي خبرة عملية'
                : 'Switch to: I have work experience'}
            </button>
          </div>

          {hasWorkExp && (
            <form onSubmit={handleAddExperience} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={expJobTitle}
                  onChange={(e) => setExpJobTitle(e.target.value)}
                  placeholder={isAr ? 'المسمى الوظيفي *' : 'Job Title *'}
                  className="px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                />
                <select
                  value={expType}
                  onChange={(e) => setExpType(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                >
                  <option value="freelance">Freelance</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="internship">Internship</option>
                  <option value="personal_project">Personal Project</option>
                </select>
                <input
                  type="text"
                  value={expOrg}
                  onChange={(e) => setExpOrg(e.target.value)}
                  placeholder={isAr ? 'الشركة / العميل' : 'Organization / Client'}
                  className="px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                />
              </div>
              <textarea
                rows={2}
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                placeholder={
                  isAr ? 'أهم المهام والإنجازات *' : 'Key responsibilities & achievements *'
                }
                className="w-full p-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#007AFF] text-white font-bold text-xs"
              >
                {isAr ? 'إضافة خبرة عملية' : 'Add Experience'}
              </button>
            </form>
          )}

          <div className="space-y-2">
            {(userProfile.workExperience || []).map((exp) => (
              <div
                key={exp.id}
                className="p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold">
                    {exp.jobTitle} ({exp.experienceType})
                  </div>
                  <p className="text-[#475569] dark:text-[#94A3B8] mt-1">
                    {exp.responsibilitiesAndAchievements}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteExperience(exp.id)}
                  className="p-1 text-[#64748B] hover:text-[#FF3B30]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Section 5: Certificates */}
      {activeTab === 'certificates' && (
        <GlassCard className="p-6 space-y-5">
          <form
            onSubmit={handleAddCertificate}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <input
              type="text"
              value={certName}
              onChange={(e) => setCertName(e.target.value)}
              placeholder={isAr ? 'اسم الشهادة *' : 'Certificate Name *'}
              className="px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
            />
            <input
              type="text"
              value={certOrg}
              onChange={(e) => setCertOrg(e.target.value)}
              placeholder={isAr ? 'الجهة المانحة *' : 'Issuing Organization *'}
              className="px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
            />
            <input
              type="text"
              value={certYear}
              onChange={(e) => setCertYear(e.target.value)}
              placeholder="2024"
              className="px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold text-xs"
            >
              {isAr ? 'إضافة شهادة' : 'Add Certificate'}
            </button>
          </form>

          <div className="space-y-2">
            {(userProfile.certificates || []).map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold">{c.name}</span> ·{' '}
                  {c.issuingOrganization} ({c.completionDate})
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateUserProfile({
                      certificates: (userProfile.certificates || []).filter(
                        (x) => x.id !== c.id
                      ),
                    })
                  }
                  className="p-1 text-[#64748B] hover:text-[#FF3B30]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Section 6: Portfolio */}
      {activeTab === 'portfolio' && (
        <GlassCard className="p-6 space-y-5">
          <form onSubmit={handleAddPortfolio} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={portTitle}
                onChange={(e) => setPortTitle(e.target.value)}
                placeholder={isAr ? 'عنوان المشروع *' : 'Project Title *'}
                className="px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
              />
              <input
                type="text"
                value={portTech}
                onChange={(e) => setPortTech(e.target.value)}
                placeholder={isAr ? 'التقنيات (مفصولة بفاصلة)' : 'Tech stack (comma separated)'}
                className="px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
              />
              <input
                type="url"
                value={portLink}
                onChange={(e) => setPortLink(e.target.value)}
                placeholder={isAr ? 'رابط المشروع (اختياري)' : 'Project URL (Optional)'}
                className="px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
              />
            </div>
            <textarea
              rows={2}
              value={portDesc}
              onChange={(e) => setPortDesc(e.target.value)}
              placeholder={isAr ? 'وصف المشروع والنتائج *' : 'Project description & outcome *'}
              className="w-full p-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#007AFF] text-white font-bold text-xs"
            >
              {isAr ? 'إضافة إلى المعرض' : 'Add Portfolio Item'}
            </button>
          </form>

          <div className="space-y-2">
            {userProfile.portfolio.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold">{p.title}</div>
                  <p className="text-[#475569] dark:text-[#94A3B8] mt-1">
                    {p.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateUserProfile({
                      portfolio: userProfile.portfolio.filter(
                        (x) => x.id !== p.id
                      ),
                    })
                  }
                  className="p-1 text-[#64748B] hover:text-[#FF3B30]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Section 7: Preferences */}
      {activeTab === 'preferences' && (
        <GlassCard className="p-6 space-y-5">
          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {isAr ? 'العملة المفضلة' : 'Preferred Currency'}
                </label>
                <select
                  value={prefCurrency}
                  onChange={(e) => setPrefCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="SAR (ر.س)">SAR (ر.س)</option>
                  <option value="AED (د.إ)">AED (د.إ)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {isAr ? 'ساعات التفرغ الأسبوعية' : 'Weekly Availability'}
                </label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {isAr ? 'حجم المشاريع المفضل' : 'Preferred Complexity'}
                </label>
                <select
                  value={prefComplexity}
                  onChange={(e) => setPrefComplexity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                >
                  <option value="small">Small Tasks</option>
                  <option value="medium">Medium Projects</option>
                  <option value="large">Large Projects</option>
                  <option value="long_term">Long-Term Contracts</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                  {isAr ? 'أسلوب العمل' : 'Working Arrangement'}
                </label>
                <select
                  value={prefArrangement}
                  onChange={(e) => setPrefArrangement(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/15 dark:border-white/15 text-xs"
                >
                  <option value="independent">Independent</option>
                  <option value="team">Team Collaboration</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold text-xs"
              >
                {isAr ? 'حفظ تفضيلات العمل الحر' : 'Save Preferences'}
              </button>
            </div>
          </form>
        </GlassCard>
      )}
    </div>
  );
};

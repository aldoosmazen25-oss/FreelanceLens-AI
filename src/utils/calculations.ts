export interface PricingInputs {
  hours: number;
  rate: number;
  complexity: number; // 1.0 to 2.0
  revisions: number;
  expenses: number;
  fee: number; // percentage e.g. 10, 20, 0
  profit: number; // percentage e.g. 25
  isRush: boolean; // +25% rush fee
}

export interface PricingOutputs {
  baseLabor: number;
  adjustedLabor: number;
  revisionsBuffer: number;
  rushFeeAmount: number;
  totalCost: number;
  suggestedClientPrice: number;
  platformFeeAmount: number;
  netProfit: number;
  walkAwayPrice: number;
  effectiveHourlyRate: number;
}

export function calculateCompetitivePricing(inputs: PricingInputs): PricingOutputs {
  const safeHours = Math.max(0, Number(inputs.hours) || 0);
  const safeRate = Math.max(0, Number(inputs.rate) || 0);
  const safeComplexity = Math.max(1.0, Math.min(3.0, Number(inputs.complexity) || 1.0));
  const safeRevisions = Math.max(0, Number(inputs.revisions) || 0);
  const safeExpenses = Math.max(0, Number(inputs.expenses) || 0);
  const safeFee = Math.max(0, Math.min(90, Number(inputs.fee) || 0));
  const safeProfit = Math.max(0, Number(inputs.profit) || 0);

  const baseLabor = safeHours * safeRate;
  const adjustedLabor = baseLabor * safeComplexity;
  const revisionsBuffer = safeRevisions * 0.05 * adjustedLabor;
  const rushFeeAmount = inputs.isRush ? Math.round(adjustedLabor * 0.25) : 0;
  const totalCost = adjustedLabor + revisionsBuffer + safeExpenses + rushFeeAmount;

  const feeFactor = 1 - safeFee / 100;
  const suggestedClientPrice = Math.round((totalCost * (1 + safeProfit / 100)) / feeFactor);
  const platformFeeAmount = Math.round(suggestedClientPrice * (safeFee / 100));
  const netProfit = suggestedClientPrice - platformFeeAmount - safeExpenses;
  const walkAwayPrice = Math.round(totalCost / feeFactor);
  const effectiveHourlyRate = safeHours > 0 ? Math.round(netProfit / safeHours) : 0;

  return {
    baseLabor: Math.round(baseLabor),
    adjustedLabor: Math.round(adjustedLabor),
    revisionsBuffer: Math.round(revisionsBuffer),
    rushFeeAmount: Math.round(rushFeeAmount),
    totalCost: Math.round(totalCost),
    suggestedClientPrice,
    platformFeeAmount,
    netProfit,
    walkAwayPrice,
    effectiveHourlyRate,
  };
}

export interface ProfileCompletenessInput {
  name?: string;
  title?: string;
  bio?: string;
  hourlyRate?: number;
  skillsCount: number;
  portfolioCount: number;
}

export function calculateProfileCompleteness(profile: ProfileCompletenessInput): number {
  let score = 0;
  if (profile.name && profile.name.trim().length >= 2) score += 15;
  if (profile.title && profile.title.trim().length >= 3) score += 15;
  if (profile.bio && profile.bio.trim().length >= 20) score += 20;
  if (profile.hourlyRate && profile.hourlyRate > 0) score += 15;
  if (profile.skillsCount >= 5) score += 20;
  else if (profile.skillsCount > 0) score += 10;
  if (profile.portfolioCount >= 2) score += 15;
  else if (profile.portfolioCount > 0) score += 8;
  return Math.min(100, score);
}

export interface FinancialRecord {
  type: 'revenue' | 'expense';
  amount: number;
  status: 'received' | 'pending';
}

export function calculateFinancialSummary(records: FinancialRecord[]) {
  let receivedRevenue = 0;
  let pendingMilestones = 0;
  let totalExpenses = 0;

  for (const r of records) {
    const amt = Math.max(0, Number(r.amount) || 0);
    if (r.type === 'revenue') {
      if (r.status === 'received') {
        receivedRevenue += amt;
      } else {
        pendingMilestones += amt;
      }
    } else if (r.type === 'expense') {
      totalExpenses += amt;
    }
  }

  return {
    receivedRevenue,
    pendingMilestones,
    totalExpenses,
    netCashflow: receivedRevenue - totalExpenses,
  };
}

export function calculateLiveSessionEarnings(
  elapsedSeconds: number,
  hourlyRate: number
): { formattedTime: string; earnedUsd: number } {
  const safeSeconds = Math.max(0, Math.floor(Number(elapsedSeconds) || 0));
  const safeRate = Math.max(0, Number(hourlyRate) || 0);

  const hrs = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const formattedTime =
    hrs > 0
      ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
      : `${pad(mins)}:${pad(secs)}`;

  const earnedUsd = Number(((safeSeconds / 3600) * safeRate).toFixed(2));

  return { formattedTime, earnedUsd };
}

export function resolveSwipeDirection(
  deltaX: number,
  deltaY: number,
  threshold = 36
): 'left' | 'right' | 'up' | 'down' | 'none' {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  if (Math.max(absX, absY) < threshold) return 'none';
  if (absX >= absY) {
    return deltaX > 0 ? 'right' : 'left';
  }
  return deltaY > 0 ? 'down' : 'up';
}

export type AccentPreset = 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose';
export type CornerRadiusPreset = 'fluid' | 'modern' | 'sharp';
export type UIDensityPreset = 'compact' | 'comfortable' | 'spacious';
export type AnimationSpeedPreset = 'ultra' | 'snappy' | 'calm';

export interface UICustomizationSettings {
  glassOpacity: number; // 20 to 95
  glassBlur: number; // 16 to 72 (px)
  specularIntensity: number; // 10 to 100 (%)
  accentPreset: AccentPreset;
  cornerRadius: CornerRadiusPreset;
  uiDensity: UIDensityPreset;
  animationSpeed: AnimationSpeedPreset;
  showDynamicIsland: boolean;
  showAmbientOrbs: boolean;
}

export const DEFAULT_UI_SETTINGS: UICustomizationSettings = {
  glassOpacity: 65,
  glassBlur: 50,
  specularIntensity: 75,
  accentPreset: 'emerald',
  cornerRadius: 'fluid',
  uiDensity: 'comfortable',
  animationSpeed: 'ultra',
  showDynamicIsland: true,
  showAmbientOrbs: true,
};

const ACCENT_PALETTES: Record<
  AccentPreset,
  { primary: string; secondary: string; rgb: string }
> = {
  emerald: { primary: '#2be38a', secondary: '#62d9ff', rgb: '43, 227, 138' },
  cyan: { primary: '#38bdf8', secondary: '#818cf8', rgb: '56, 189, 248' },
  violet: { primary: '#a855f7', secondary: '#ec4899', rgb: '168, 85, 247' },
  amber: { primary: '#f59e0b', secondary: '#2be38a', rgb: '245, 158, 11' },
  rose: { primary: '#f43f5e', secondary: '#fb923c', rgb: '244, 63, 94' },
};

export function buildLiquidGlassCssVars(
  settings: UICustomizationSettings,
  theme: 'dark' | 'light'
): Record<string, string> {
  const clampedOpacity = Math.max(20, Math.min(95, Number(settings.glassOpacity) || 65));
  const clampedBlur = Math.max(16, Math.min(72, Number(settings.glassBlur) || 50));
  const clampedSpecular = Math.max(
    10,
    Math.min(100, Number(settings.specularIntensity) || 75)
  );

  const palette = ACCENT_PALETTES[settings.accentPreset] || ACCENT_PALETTES.emerald;

  const darkAlpha = Number(((clampedOpacity / 100) * 0.14).toFixed(3));
  const lightAlpha = Number((0.45 + (clampedOpacity / 100) * 0.48).toFixed(3));
  const borderAlpha = Number((0.08 + (clampedSpecular / 100) * 0.24).toFixed(3));

  const radiusPx =
    settings.cornerRadius === 'fluid'
      ? '24px'
      : settings.cornerRadius === 'modern'
      ? '16px'
      : '10px';

  const animDuration =
    settings.animationSpeed === 'ultra'
      ? '220ms'
      : settings.animationSpeed === 'snappy'
      ? '140ms'
      : '340ms';

  return {
    '--emerald-glow': palette.primary,
    '--cyan-electric': palette.secondary,
    '--accent-rgb': palette.rgb,
    '--glass-blur': `${clampedBlur}px`,
    '--glass-surface-alpha': String(theme === 'light' ? lightAlpha : darkAlpha),
    '--glass-border-alpha': String(borderAlpha),
    '--ui-radius': radiusPx,
    '--spring-duration': animDuration,
  };
}

export interface DashboardMetricsInput {
  projects: Array<{ status: string; analysis?: unknown }>;
  proposals: Array<{ status: string }>;
  financials: FinancialRecord[];
}

export interface DashboardMetricsOutput {
  totalProjects: number;
  projectsAnalyzed: number;
  proposalsSent: number;
  pendingResponses: number;
  activeProjects: number;
  completedProjects: number;
  recordedEarnings: number;
  proposalResponseRate: number;
}

export function calculateDashboardMetrics(
  input: DashboardMetricsInput
): DashboardMetricsOutput {
  const totalProjects = input.projects.length;
  const projectsAnalyzed = input.projects.filter(
    (p) =>
      p.status === 'analyzed' ||
      p.status === 'proposed' ||
      p.status === 'waiting' ||
      p.status === 'in_progress' ||
      p.status === 'completed' ||
      Boolean(p.analysis)
  ).length;

  const proposalsSent =
    input.proposals.length +
    input.projects.filter(
      (p) =>
        p.status === 'proposed' ||
        p.status === 'waiting' ||
        p.status === 'in_progress' ||
        p.status === 'completed'
    ).length;

  // Deduplicate if proposals array already tracks project proposals
  const distinctProposalsSent = Math.max(
    input.proposals.length,
    input.projects.filter(
      (p) =>
        p.status === 'proposed' ||
        p.status === 'waiting' ||
        p.status === 'in_progress' ||
        p.status === 'completed'
    ).length
  );

  const pendingResponses = input.projects.filter(
    (p) => p.status === 'waiting' || p.status === 'proposed'
  ).length;

  const activeProjects = input.projects.filter(
    (p) => p.status === 'in_progress'
  ).length;

  const completedProjects = input.projects.filter(
    (p) => p.status === 'completed'
  ).length;

  const fin = calculateFinancialSummary(input.financials);
  const recordedEarnings = fin.receivedRevenue;

  const repliedOrWonCount = input.proposals.filter(
    (pr) => pr.status === 'replied' || pr.status === 'won'
  ).length;

  const proposalResponseRate =
    distinctProposalsSent > 0
      ? Math.min(100, Math.round((repliedOrWonCount / distinctProposalsSent) * 100))
      : 0;

  return {
    totalProjects,
    projectsAnalyzed,
    proposalsSent: distinctProposalsSent,
    pendingResponses,
    activeProjects,
    completedProjects,
    recordedEarnings,
    proposalResponseRate,
  };
}

export interface MotionTimingTokens {
  pageDurationSec: number;
  cardHoverDurationSec: number;
  staggerSec: number;
  enterYOffsetPx: number;
  hoverYOffsetPx: number;
  pressScale: number;
}

export function resolveMotionTokens(
  speed: AnimationSpeedPreset = 'ultra',
  prefersReducedMotion = false
): MotionTimingTokens {
  if (prefersReducedMotion) {
    return {
      pageDurationSec: 0.01,
      cardHoverDurationSec: 0.01,
      staggerSec: 0,
      enterYOffsetPx: 0,
      hoverYOffsetPx: 0,
      pressScale: 1,
    };
  }

  if (speed === 'snappy') {
    return {
      pageDurationSec: 0.18,
      cardHoverDurationSec: 0.16,
      staggerSec: 0.03,
      enterYOffsetPx: 8,
      hoverYOffsetPx: -3,
      pressScale: 0.98,
    };
  }

  if (speed === 'calm') {
    return {
      pageDurationSec: 0.28,
      cardHoverDurationSec: 0.22,
      staggerSec: 0.055,
      enterYOffsetPx: 12,
      hoverYOffsetPx: -3,
      pressScale: 0.985,
    };
  }

  // 'ultra' default balanced premium SaaS timing (220ms page, 180ms card)
  return {
    pageDurationSec: 0.22,
    cardHoverDurationSec: 0.18,
    staggerSec: 0.042,
    enterYOffsetPx: 10,
    hoverYOffsetPx: -3.5,
    pressScale: 0.98,
  };
}

export interface AttachmentValidationResult {
  valid: boolean;
  category: 'image' | 'pdf' | 'docx' | 'text' | 'unsupported';
  formattedSize: string;
  errorAr?: string;
  errorEn?: string;
}

export function formatFileSize(bytes: number): string {
  const safeBytes = Math.max(0, Number(bytes) || 0);
  if (safeBytes < 1024) return `${safeBytes} B`;
  const kb = safeBytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function validateComposerAttachment(file: {
  name: string;
  type: string;
  size: number;
}): AttachmentValidationResult {
  const formattedSize = formatFileSize(file.size);
  const maxBytes = 10 * 1024 * 1024; // 10 MB

  if (file.size <= 0) {
    return {
      valid: false,
      category: 'unsupported',
      formattedSize,
      errorAr: 'الملف المرفق فارغ. يرجى اختيار ملف صالح.',
      errorEn: 'The selected file is empty. Please choose a valid file.',
    };
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      category: 'unsupported',
      formattedSize,
      errorAr: `حجم الملف (${formattedSize}) يتجاوز الحد الأقصى المسموح به (10 MB).`,
      errorEn: `File size (${formattedSize}) exceeds the 10 MB maximum limit.`,
    };
  }

  const lowerName = (file.name || '').toLowerCase();
  const mime = (file.type || '').toLowerCase();

  if (
    mime.startsWith('image/') ||
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.webp')
  ) {
    return { valid: true, category: 'image', formattedSize };
  }

  if (mime === 'application/pdf' || lowerName.endsWith('.pdf')) {
    return { valid: true, category: 'pdf', formattedSize };
  }

  if (
    mime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime === 'application/msword' ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc')
  ) {
    return { valid: true, category: 'docx', formattedSize };
  }

  if (
    mime.startsWith('text/') ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.csv') ||
    lowerName.endsWith('.json')
  ) {
    return { valid: true, category: 'text', formattedSize };
  }

  return {
    valid: false,
    category: 'unsupported',
    formattedSize,
    errorAr: `صيغة الملف "${file.name}" غير مدعومة. الصيغ المدعومة: PDF, DOCX, TXT, PNG, JPG, WebP.`,
    errorEn: `File format "${file.name}" is unsupported. Supported formats: PDF, DOCX, TXT, PNG, JPG, WebP.`,
  };
}

import {
  FIREWORK_MARKETPLACE_CATALOG,
  discoverSmartOpportunities,
  understandIntelligentAgentRequest,
  normalizeArabicAndEnglish,
  type AgentContextSnapshot,
  type IntelligentActionType,
  type IntelligentIntentResult,
  type VoiceDomainCategory,
  type VoiceScoutedOpportunity,
} from './agentEngine';

export {
  FIREWORK_MARKETPLACE_CATALOG,
  discoverSmartOpportunities,
  understandIntelligentAgentRequest,
  normalizeArabicAndEnglish,
  type AgentContextSnapshot,
  type IntelligentActionType,
  type IntelligentIntentResult,
  type VoiceDomainCategory,
  type VoiceScoutedOpportunity,
};

export type VoiceAgentActionType = IntelligentActionType;
export type VoiceTaskIntentResult = IntelligentIntentResult;

export function resolveVoiceAgentTaskIntent(
  rawCommand: string,
  context: AgentContextSnapshot = {}
): VoiceTaskIntentResult {
  return understandIntelligentAgentRequest(rawCommand, context);
}

// ============================================================================
// AUTHENTICATION, 8-STEP ONBOARDING & HONEST PROFILE CALCULATIONS
// ============================================================================

export interface RegistrationValidationInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export interface ValidationFieldError {
  ar: string;
  en: string;
}

export interface RegistrationValidationResult {
  valid: boolean;
  errors: Record<string, ValidationFieldError>;
}

export function validateRegistrationInput(
  input: RegistrationValidationInput
): RegistrationValidationResult {
  const errors: Record<string, ValidationFieldError> = {};
  const cleanName = (input.fullName || '').trim();
  const cleanEmail = (input.email || '').trim();
  const password = input.password || '';
  const confirmPassword = input.confirmPassword || '';

  if (cleanName.length < 2) {
    errors.fullName = {
      ar: 'يرجى إدخال الاسم الكامل الحقيقي (حرفين على الأقل).',
      en: 'Please enter your full name (at least 2 characters).',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    errors.email = {
      ar: 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
      en: 'Please enter a valid email address.',
    };
  }

  const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  if (password.length < 8 || !hasLetter || !hasNumberOrSymbol) {
    errors.password = {
      ar: 'يجب أن تتكون كلمة المرور من 8 خانات على الأقل وتجمع بين الأحرف والأرقام أو الرموز.',
      en: 'Password must be at least 8 characters and include letters and numbers or symbols.',
    };
  }

  if (!confirmPassword || password !== confirmPassword) {
    errors.confirmPassword = {
      ar: 'تأكيد كلمة المرور غير مطابق لكلمة المرور المدخلة.',
      en: 'Password confirmation does not match the password.',
    };
  }

  if (!input.acceptedTerms) {
    errors.acceptedTerms = {
      ar: 'يجب الموافقة على شروط الاستخدام وسياسة الخصوصية لإنشاء الحساب.',
      en: 'You must accept the Terms of Use and Privacy Policy to create an account.',
    };
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export const PROFESSIONAL_HEADLINE_SUGGESTIONS: Array<{
  en: string;
  ar: string;
  category: string;
}> = [
  { en: 'Software Engineer', ar: 'مهندس برمجيات (Software Engineer)', category: 'Software Development & Engineering' },
  { en: 'Frontend Developer', ar: 'مطور واجهات أمامية (Frontend Developer)', category: 'Software Development & Engineering' },
  { en: 'Backend Developer', ar: 'مطور خوادم وواجهات خلفية (Backend Developer)', category: 'Software Development & Engineering' },
  { en: 'Full-Stack Developer', ar: 'مطور ويب متكامل (Full-Stack Developer)', category: 'Software Development & Engineering' },
  { en: 'Mobile App Developer', ar: 'مطور تطبيقات جوال (Mobile App Developer)', category: 'Software Development & Engineering' },
  { en: 'AI Engineer / Prompt Engineer', ar: 'مهندس ذكاء اصطناعي وهندسة أوامر (AI / Prompt Engineer)', category: 'Artificial Intelligence & Data' },
  { en: 'Data Analyst / Data Scientist', ar: 'محلل وعالم بيانات (Data Analyst / Scientist)', category: 'Artificial Intelligence & Data' },
  { en: 'Cybersecurity Specialist', ar: 'أخصائي أمن سيبراني (Cybersecurity Specialist)', category: 'Software Development & Engineering' },
  { en: 'Cloud / DevOps Engineer', ar: 'مهندس سحابة و DevOps (Cloud / DevOps Engineer)', category: 'Software Development & Engineering' },
  { en: 'UI/UX Designer', ar: 'مصمم واجهات وتجربة مستخدم (UI/UX Designer)', category: 'Design & Creative' },
  { en: 'Graphic Designer', ar: 'مصمم جرافيك وهويات بصرية (Graphic Designer)', category: 'Design & Creative' },
  { en: 'Motion Designer / Video Editor', ar: 'مصمم موشن جرافيك ومونتير فيديو (Motion / Video Editor)', category: 'Design & Creative' },
  { en: 'Digital Marketing Specialist', ar: 'أخصائي تسويق رقمي ونمو (Digital Marketing Specialist)', category: 'Digital Marketing & E-Commerce' },
  { en: 'SEO / Content Strategist', ar: 'خبير تحسين محركات البحث واستراتيجية المحتوى (SEO Strategist)', category: 'Digital Marketing & E-Commerce' },
  { en: 'Copywriter / Content Writer', ar: 'كاتب محتوى ونسخ إعلاني (Copywriter / Content Writer)', category: 'Writing, Languages & Communication' },
  { en: 'Translator / Language Specialist', ar: 'مترجم وأخصائي لغات وتعريب (Translator / Localization)', category: 'Writing, Languages & Communication' },
  { en: 'Business Analyst / Project Manager', ar: 'محلل أعمال ومدير مشاريع (Business Analyst / PM)', category: 'Business, Administration & Finance' },
  { en: 'Financial / Accounting Consultant', ar: 'مستشار مالي ومحاسبي (Financial Consultant)', category: 'Business, Administration & Finance' },
  { en: 'Customer Support / Virtual Assistant', ar: 'مساعد افتراضي وأخصائي دعم عملاء (Virtual Assistant)', category: 'Business, Administration & Finance' },
  { en: 'Mechanical / Electrical / Civil Engineer', ar: 'مهندس ميكانيكي / كهربائي / مدني (Engineering Specialist)', category: 'Engineering, Education & Other' },
  { en: 'Educator / Trainer / Academic Researcher', ar: 'مدرب ومحاضر وباحث أكاديمي (Educator / Researcher)', category: 'Engineering, Education & Other' },
];

export const CATEGORIZED_SKILLS_CATALOG: Array<{
  id: string;
  titleEn: string;
  titleAr: string;
  skills: string[];
}> = [
  {
    id: 'software_engineering',
    titleEn: 'A. Software Development & Engineering',
    titleAr: 'أ. تطوير البرمجيات والهندسة التقنية',
    skills: [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'C#',
      'C++',
      'Go',
      'Rust',
      'PHP',
      'Swift',
      'Kotlin',
      'React',
      'Next.js',
      'Vue.js',
      'Angular',
      'Node.js',
      'Express',
      'Django',
      'FastAPI',
      'Laravel',
      'Spring Boot',
      'Flutter',
      'React Native',
      'REST APIs',
      'GraphQL',
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Firebase',
      'Supabase',
      'Docker',
      'Kubernetes',
      'AWS',
      'Google Cloud',
      'Azure',
      'Git / GitHub',
      'CI/CD',
      'Testing & QA',
      'Cybersecurity',
    ],
  },
  {
    id: 'ai_and_data',
    titleEn: 'B. Artificial Intelligence & Data',
    titleAr: 'ب. الذكاء الاصطناعي وعلوم البيانات',
    skills: [
      'Machine Learning',
      'Deep Learning',
      'LLM Integration',
      'Prompt Engineering',
      'RAG Systems',
      'AI Agents',
      'Data Analysis',
      'Data Visualization',
      'SQL',
      'Pandas / NumPy',
      'Power BI',
      'Tableau',
      'Excel Advanced Analytics',
      'NLP',
      'Computer Vision',
    ],
  },
  {
    id: 'design_and_creative',
    titleEn: 'C. Design & Creative',
    titleAr: 'ج. التصميم والإبداع البصري',
    skills: [
      'UI Design',
      'UX Research',
      'Wireframing',
      'Prototyping',
      'Design Systems',
      'Figma',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Adobe After Effects',
      'Adobe Premiere Pro',
      'Branding & Visual Identity',
      'Motion Graphics',
      'Video Editing',
      '3D Modeling / Blender',
      'Presentation Design',
    ],
  },
  {
    id: 'marketing_and_ecommerce',
    titleEn: 'D. Digital Marketing & E-Commerce',
    titleAr: 'د. التسويق الرقمي والتجارة الإلكترونية',
    skills: [
      'SEO',
      'SEM / Google Ads',
      'Meta Ads',
      'TikTok Ads',
      'Social Media Management',
      'Content Marketing',
      'Email Marketing',
      'Conversion Rate Optimization',
      'Shopify',
      'WooCommerce',
      'Product Listing Optimization',
      'Marketing Analytics',
    ],
  },
  {
    id: 'writing_and_languages',
    titleEn: 'E. Writing, Languages & Communication',
    titleAr: 'هـ. الكتابة واللغات والترجمة والتواصل',
    skills: [
      'Copywriting',
      'Technical Writing',
      'Content Writing',
      'Blog & Article Writing',
      'Scriptwriting',
      'Editing & Proofreading',
      'Arabic-English Translation',
      'Localization',
      'Academic Writing',
      'Research & Summarization',
    ],
  },
  {
    id: 'business_and_finance',
    titleEn: 'F. Business, Administration & Finance',
    titleAr: 'و. الأعمال والإدارة والمالية',
    skills: [
      'Project Management',
      'Agile / Scrum',
      'Product Management',
      'Business Analysis',
      'Financial Modeling',
      'Accounting & Bookkeeping',
      'Market Research',
      'Operations Management',
      'Customer Support',
      'CRM Management',
      'Virtual Assistance',
    ],
  },
  {
    id: 'engineering_and_education',
    titleEn: 'G. Engineering, Education & Other Fields',
    titleAr: 'ز. الهندسة والتعليم والمجالات المهنية الأخرى',
    skills: [
      'CAD / AutoCAD',
      'SolidWorks',
      'MATLAB',
      'Electrical Design',
      'Mechanical Design',
      'Civil / Structural Planning',
      'Online Teaching / Tutoring',
      'Curriculum Design',
      'Legal Research / Contract Review',
      'Healthcare / Medical Content Support',
    ],
  },
];

export interface OnboardingStepValidationResult {
  valid: boolean;
  errorAr?: string;
  errorEn?: string;
}

export function validateOnboardingStep(
  step: number,
  profile: Record<string, any>
): OnboardingStepValidationResult {
  if (step === 1) {
    const name = (profile.fullName || profile.name || '').trim();
    const headline = (profile.professionalHeadline || profile.title || '').trim();
    const category = (profile.professionalCategory || '').trim();
    const specialization = (profile.specialization || '').trim();
    const level = (profile.professionalLevel || '').trim();
    const country = (profile.country || '').trim();
    const language = (profile.preferredLanguage || '').trim();
    const summary = (profile.professionalSummary || profile.bio || '').trim();

    if (!name || name.length < 2) {
      return {
        valid: false,
        errorAr: 'يرجى إدخال اسمك الكامل في الخطوة الأولى.',
        errorEn: 'Please enter your full name in Step 1.',
      };
    }
    if (!headline || headline.length < 2) {
      return {
        valid: false,
        errorAr: 'يرجى اختيار أو كتابة المسمى المهني (Headline).',
        errorEn: 'Please select or enter your professional headline.',
      };
    }
    if (!category || !specialization) {
      return {
        valid: false,
        errorAr: 'يرجى تحديد الفئة المهنية والتخصص الدقيق.',
        errorEn: 'Please specify your primary category and specialization.',
      };
    }
    if (!level || !country || !language) {
      return {
        valid: false,
        errorAr: 'يرجى استكمال المستوى المهني، الدولة، ولغة العمل المفضلة.',
        errorEn: 'Please complete your professional level, country, and preferred language.',
      };
    }
    if (!summary || summary.length < 10) {
      return {
        valid: false,
        errorAr: 'يرجى كتابة نبذة مهنية مختصرة (10 أحرف على الأقل) تصف ما تقدمه.',
        errorEn: 'Please write a short professional introduction (at least 10 characters).',
      };
    }
    return { valid: true };
  }

  if (step === 2) {
    const edu = profile.education || {};
    if (!edu.highestLevel) {
      return {
        valid: false,
        errorAr: 'يرجى اختيار أعلى مؤهل تعليمي أو مسار التعلم الذاتي.',
        errorEn: 'Please select your highest education level.',
      };
    }
    if (edu.highestLevel !== 'no_formal' && !(edu.fieldOfStudy || '').trim()) {
      return {
        valid: false,
        errorAr: 'يرجى إدخال مجال الدراسة أو التخصص العلمي.',
        errorEn: 'Please enter your field of study or specialization.',
      };
    }
    if (!edu.graduationStatus) {
      return {
        valid: false,
        errorAr: 'يرجى تحديد حالة التخرج أو الدراسة الحالية.',
        errorEn: 'Please select your graduation or study status.',
      };
    }
    return { valid: true };
  }

  if (step === 3) {
    const skills = Array.isArray(profile.skills) ? profile.skills : [];
    const hasHonestFewerFlag = Boolean((profile.fewerThanThreeSkillsReason || '').trim());
    if (skills.length < 3 && !(skills.length >= 1 && hasHonestFewerFlag)) {
      return {
        valid: false,
        errorAr:
          'يرجى اختيار 3 مهارات على الأقل، أو تفعيل خيار "لدي أقل من 3 مهارات حالياً" مع اختيار مهارة واحدة على الأقل.',
        errorEn:
          'Please select at least 3 skills, or check the honest option for fewer than 3 skills with at least 1 skill selected.',
      };
    }
    return { valid: true };
  }

  if (step === 4) {
    const hasExp = profile.hasWorkExperience;
    const entries = Array.isArray(profile.workExperience) ? profile.workExperience : [];
    if (hasExp === undefined || hasExp === null) {
      return {
        valid: false,
        errorAr: 'يرجى تحديد ما إذا كانت لديك خبرة عملية سابقة أو اختيار "لا توجد خبرة مهنية بعد".',
        errorEn: 'Please indicate whether you have work experience or select "No professional experience yet".',
      };
    }
    if (hasExp === true && entries.length === 0) {
      return {
        valid: false,
        errorAr: 'يرجى إضافة خبرة عمل واحدة على الأقل، أو التبديل إلى خيار "لا توجد خبرة مهنية بعد".',
        errorEn: 'Please add at least one work experience entry, or switch to "No professional experience yet".',
      };
    }
    return { valid: true };
  }

  if (step === 5 || step === 6) {
    // Certificates and Portfolio are optional steps
    return { valid: true };
  }

  if (step === 7) {
    const prefs = profile.freelancePreferences || {};
    const cats = Array.isArray(prefs.preferredCategories) ? prefs.preferredCategories : [];
    const types = Array.isArray(prefs.preferredProjectTypes) ? prefs.preferredProjectTypes : [];
    if (cats.length === 0 && types.length === 0) {
      return {
        valid: false,
        errorAr: 'يرجى اختيار فئة عمل حر أو نوع مشروع واحد على الأقل تبحث عنه.',
        errorEn: 'Please select at least one preferred freelance category or project type.',
      };
    }
    if (!prefs.preferredCurrency || !prefs.weeklyAvailabilityHours || !prefs.workingArrangement) {
      return {
        valid: false,
        errorAr: 'يرجى تحديد العملة المفضلة، ساعات التفرغ الأسبوعية، ونمط العمل.',
        errorEn: 'Please select your preferred currency, weekly availability, and working arrangement.',
      };
    }
    return { valid: true };
  }

  return { valid: true };
}

export interface ComprehensiveCompletenessBreakdown {
  totalPercentage: number;
  sections: {
    identity: boolean;
    education: boolean;
    skills: boolean;
    experience: boolean;
    preferences: boolean;
    portfolioOrCertificates: boolean;
  };
}

export function calculateComprehensiveProfileCompleteness(
  profile: Record<string, any>
): ComprehensiveCompletenessBreakdown {
  const step1 = validateOnboardingStep(1, profile).valid;
  const step2 = validateOnboardingStep(2, profile).valid;
  const step3 = validateOnboardingStep(3, profile).valid;
  const step4 = validateOnboardingStep(4, profile).valid;
  const step7 = validateOnboardingStep(7, profile).valid;

  const hasPortfolioOrCerts =
    (Array.isArray(profile.portfolio) && profile.portfolio.length > 0) ||
    (Array.isArray(profile.certificates) && profile.certificates.length > 0);

  let score = 0;
  if (step1) score += 25;
  else if ((profile.name || profile.fullName || '').trim().length >= 2) score += 10;

  if (step2) score += 15;
  if (step3) score += 25;
  else if (Array.isArray(profile.skills) && profile.skills.length > 0) score += 10;

  if (step4) score += 15;
  if (step7) score += 10;
  if (hasPortfolioOrCerts) score += 10;
  else if (step1 && step2 && step3 && step4 && step7) score += 5;

  return {
    totalPercentage: Math.min(100, score),
    sections: {
      identity: step1,
      education: step2,
      skills: step3,
      experience: step4,
      preferences: step7,
      portfolioOrCertificates: hasPortfolioOrCerts,
    },
  };
}

export function buildHonestAIProfileContext(profile: Record<string, any>): string {
  const name = profile.fullName || profile.name || 'المستقل';
  const headline = profile.professionalHeadline || profile.title || 'غير محدد';
  const category = profile.professionalCategory || 'غير محدد';
  const specialization = profile.specialization || 'غير محدد';
  const level = profile.professionalLevel || 'غير محدد';
  const country = profile.country || 'غير محدد';
  const rate = profile.hourlyRate ? `$${profile.hourlyRate}/hr` : 'غير محدد';
  const summary = profile.professionalSummary || profile.bio || 'غير مضافة بعد';

  const edu = profile.education;
  const eduText = edu
    ? `${edu.highestLevel || ''} في ${edu.fieldOfStudy || 'غير محدد'} (${edu.graduationStatus || ''})${
        edu.institutionName ? ` — ${edu.institutionName}` : ''
      }`
    : 'لم يتم إدخال بيانات التعليم بعد';

  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const skillsText =
    skills.length > 0
      ? skills
          .map((s: any) => {
            const prof = s.proficiency || s.level || 'متوسط';
            const yrs = s.yearsOfExperience !== undefined ? `، ${s.yearsOfExperience} سنوات` : '';
            const pri = s.isPrimary ? ' [مهارة أساسية]' : '';
            return `${s.name} (${prof}${yrs}${pri})`;
          })
          .join(' | ')
      : 'لا توجد مهارات مسجلة';

  const expEntries = Array.isArray(profile.workExperience) ? profile.workExperience : [];
  const expText =
    profile.hasWorkExperience === false || expEntries.length === 0
      ? 'لا توجد خبرة عمل مهنية سابقة مسجلة (المستقل في بداية مسيرته أو يعتمد على مهاراته ومشاريعه التجريبية — لا تختلق شركات أو عملاء سابقين أبداً).'
      : expEntries
          .map(
            (e: any) =>
              `- ${e.jobTitle} (${e.experienceType}) لدى ${e.organizationOrClient || 'مشروع مستقل'} [${
                e.startDate
              } - ${e.currentlyWorking ? 'حتى الآن' : e.endDate}]: ${e.responsibilitiesAndAchievements}`
          )
          .join('\n');

  const certs = Array.isArray(profile.certificates) ? profile.certificates : [];
  const certsText =
    certs.length > 0
      ? certs.map((c: any) => `${c.name} (${c.issuingOrganization})`).join('، ')
      : 'لا توجد شهادات مسجلة';

  const portfolio = Array.isArray(profile.portfolio) ? profile.portfolio : [];
  const portfolioText =
    portfolio.length > 0
      ? portfolio
          .map(
            (p: any) =>
              `${p.title} (${p.projectType || p.category || 'مشروع'}): ${p.description} [التقنيات: ${
                Array.isArray(p.techStack) ? p.techStack.join(', ') : ''
              }]`
          )
          .join(' | ')
      : 'لا توجد مشاريع سابقة في معرض الأعمال بعد';

  const prefs = profile.freelancePreferences;
  const prefsText = prefs
    ? `الفئات المفضلة: ${(prefs.preferredCategories || []).join('، ')} | التفرغ: ${
        prefs.weeklyAvailabilityHours || ''
      } | التعقيد المفضل: ${prefs.preferredComplexity || ''} | الأهداف: ${(prefs.careerGoals || []).join('، ')}`
    : 'غير محددة';

  return `=== الملف المهني الحقيقي الموثق للمستقل (يحظر اختلاق أي معلومة خارج هذا الملف) ===
- الاسم: ${name}
- المسمى المهني: ${headline}
- الفئة والتخصص الدقيق: ${category} — ${specialization}
- المستوى المهني: ${level} | الدولة: ${country} | سعر الساعة: ${rate}
- النبذة المهنية: ${summary}
- المؤهل التعليمي: ${eduText}
- المهارات ومستويات الإتقان: ${skillsText}
- الخبرات العملية السابقة:
${expText}
- الشهادات والتدريب: ${certsText}
- معرض الأعمال والمشاريع السابقة: ${portfolioText}
- تفضيلات وأهداف العمل الحر: ${prefsText}
================================================================================`;
}







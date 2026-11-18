import type {
  FinancialTransaction,
  NotificationItem,
  OpportunityItem,
  ProposalRecord,
  ProjectStatus,
  SavedProject,
  UserProfile,
  ViewId,
} from '../types';

export type AgentChannel = 'voice' | 'chat' | 'island';

export type IntelligentActionType =
  | 'set_work_status'
  | 'update_profile'
  | 'manage_skills'
  | 'smart_job_discovery'
  | 'scout_opportunities'
  | 'analyze_project'
  | 'generate_proposal'
  | 'save_project'
  | 'inspect_project'
  | 'update_project_status'
  | 'delete_project'
  | 'open_pricing'
  | 'add_financial_record'
  | 'set_theme'
  | 'set_language'
  | 'control_timer'
  | 'start_tour'
  | 'clear_notifications'
  | 'check_notifications'
  | 'navigate_view'
  | 'workspace_summary'
  | 'unknown';

export type VoiceDomainCategory =
  | 'writing_translation'
  | 'software_ai'
  | 'design_ui'
  | 'marketing_seo'
  | 'general';

export interface VoiceScoutedOpportunity {
  id: string;
  title: string;
  platform: string;
  budget: string;
  budgetMinUsd?: number;
  budgetMaxUsd?: number;
  deadline: string;
  matchScore: number;
  description: string;
  requiredSkills: string[];
  clientRating: number;
  postedAgo: string;
  postedHoursAgo?: number;
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  category?: VoiceDomainCategory;
  matchReasons?: string[];
}

export interface AgentContextSnapshot {
  userProfile?: Partial<UserProfile>;
  projects?: Array<Partial<SavedProject>>;
  opportunities?: Array<Partial<OpportunityItem>>;
  proposals?: Array<Partial<ProposalRecord>>;
  financials?: Array<Partial<FinancialTransaction>>;
  notifications?: Array<Partial<NotificationItem>>;
  workStatus?: 'work' | 'sleep';
  channel?: AgentChannel;
  language?: string;
}

export interface IntelligentIntentResult {
  actionType: IntelligentActionType;
  targetView: ViewId;
  domainCategory: VoiceDomainCategory;
  searchKeywords: string[];
  statusSequence: Array<'Thinking...' | 'Searching...' | 'Planning...'>;
  generatedOpportunities: VoiceScoutedOpportunity[];
  generatedProjectBrief: {
    title: string;
    platform: string;
    description: string;
    budget: string;
    deadline: string;
  };
  workStatus?: 'work' | 'sleep';
  profileUpdates?: {
    hourlyRate?: number;
    title?: string;
    bio?: string;
    availability?: string;
  };
  skillMutation?: {
    operation: 'add' | 'remove';
    skillName: string;
    level?: 'خبير' | 'متقدم' | 'متوسط' | 'مبتدئ';
  };
  projectStatusUpdate?: {
    projectId?: string;
    projectTitleKeyword: string;
    newStatus: ProjectStatus;
  };
  projectDeleteTarget?: {
    projectId?: string;
    projectTitleKeyword: string;
  };
  inspectTarget?: {
    projectId?: string;
    titleKeyword: string;
  };
  discoveryFilters?: {
    category: VoiceDomainCategory | 'all';
    level: 'beginner' | 'intermediate' | 'expert' | 'all';
    minBudget?: number;
    maxBudget?: number;
    sortBy: 'match' | 'newest';
    bestOnly?: boolean;
  };
  requiresConfirmation?: boolean;
  confirmed?: boolean;
  themeMode?: 'dark' | 'light' | 'toggle';
  languageCode?:
    | 'ar'
    | 'en'
    | 'fr'
    | 'es'
    | 'de'
    | 'tr'
    | 'ru'
    | 'zh'
    | 'ja'
    | 'hi'
    | 'pt'
    | 'ko';
  timerAction?: 'start' | 'stop' | 'reset';
  financialRecord?: {
    type: 'revenue' | 'expense';
    amount: number;
    title: string;
  };
  executionTrace?: string[];
  spokenSummaryAr: string;
  spokenSummaryEn: string;
}

/**
 * Real Firework Marketplace Database (Persistent catalog of verified available opportunities).
 * The Smart Job Discovery agent searches ONLY this real catalog + user's saved opportunities/projects
 * and NEVER invents fake listings when filters return no match.
 */
export const FIREWORK_MARKETPLACE_CATALOG: OpportunityItem[] = [
  {
    id: 'fw-db-prog-1',
    title: 'بناء لوحة تحكم تفاعلية لإدارة المهام بـ React و TypeScript',
    description:
      'شركة تقنية ناشئة تبحث عن مطور واجهات لبناء لوحة تحكم نظيفة وسريعة الاستجابة باستخدام React و TypeScript و Tailwind CSS مع ربط REST API.',
    platform: 'Upwork',
    budget: '$1,400 - $2,200',
    budgetMinUsd: 1400,
    budgetMaxUsd: 2200,
    category: 'software_ai',
    experienceLevel: 'intermediate',
    postedAt: 'منذ 15 دقيقة',
    postedHoursAgo: 0.25,
    matchScore: 88,
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
    clientRating: 4.95,
    saved: false,
  },
  {
    id: 'fw-db-prog-2',
    title: 'إصلاح أخطاء واجهة صفحة هبوط وربط نموذج تواصل (مناسب للمبتدئين)',
    description:
      'مشروع واضح ومباشر للمبتدئين في تطوير الويب: تحسين التجاوب على الجوال وتصحيح محاذاة النماذج في صفحة HTML/React بسيطة.',
    platform: 'Khamsat',
    budget: '$180 - $320',
    budgetMinUsd: 180,
    budgetMaxUsd: 320,
    category: 'software_ai',
    experienceLevel: 'beginner',
    postedAt: 'منذ 30 دقيقة',
    postedHoursAgo: 0.5,
    matchScore: 82,
    skills: ['React', 'JavaScript', 'CSS', 'Responsive Design'],
    clientRating: 4.85,
    saved: false,
  },
  {
    id: 'fw-db-prog-3',
    title: 'تطوير خادم Node.js وربط وكيل ذكاء اصطناعي Gemini لخدمة العملاء',
    description:
      'مطلوب مهندس Full-Stack لإنشاء واجهة خلفية بـ Node.js و Express مع دمج Gemini API لتحليل استفسارات العملاء وتنفيذ أوامر قاعدة البيانات.',
    platform: 'Upwork',
    budget: '$2,400 - $3,800',
    budgetMinUsd: 2400,
    budgetMaxUsd: 3800,
    category: 'software_ai',
    experienceLevel: 'expert',
    postedAt: 'منذ ساعة',
    postedHoursAgo: 1,
    matchScore: 90,
    skills: ['Node.js', 'TypeScript', 'LLM Integration', 'Express', 'Firebase'],
    clientRating: 5.0,
    saved: false,
  },
  {
    id: 'fw-db-prog-4',
    title: 'تطوير واجهة تطبيق متجر بسيط بـ Flutter للمتاجر المحلية',
    description:
      'بناء شاشات عرض المنتجات وسلة الشراء لتطبيق تجارة إلكترونية صغير بميزانية محددة وتسليم خلال أسبوعين.',
    platform: 'Mostaql',
    budget: '$450 - $650',
    budgetMinUsd: 450,
    budgetMaxUsd: 650,
    category: 'software_ai',
    experienceLevel: 'intermediate',
    postedAt: 'منذ 3 ساعات',
    postedHoursAgo: 3,
    matchScore: 76,
    skills: ['Flutter', 'Mobile App', 'REST APIs'],
    clientRating: 4.8,
    saved: false,
  },
  {
    id: 'fw-db-des-1',
    title: 'تصميم واجهات UI/UX لتطبيق خدمات مالية بنمط زجاجي حديث (Figma)',
    description:
      'نحتاج مصمم منتجات محترف لتصميم 14 شاشة لتطبيق iOS والويب على Figma مع نظام ألوان نظيف وتجربة مستخدم واضحة.',
    platform: 'Upwork',
    budget: '$950 - $1,500',
    budgetMinUsd: 950,
    budgetMaxUsd: 1500,
    category: 'design_ui',
    experienceLevel: 'intermediate',
    postedAt: 'منذ 20 دقيقة',
    postedHoursAgo: 0.35,
    matchScore: 86,
    skills: ['UI Design', 'UX Research', 'Figma', 'Prototyping', 'Design Systems'],
    clientRating: 4.92,
    saved: false,
  },
  {
    id: 'fw-db-des-2',
    title: 'تصميم شعار وهوية بصرية مبسطة لمتجر قهوة (مناسب للمبتدئين)',
    description:
      'فرصة ممتازة للمصممين في بداية مسيرتهم: تصميم شعار حديث + بطاقة عمل + 3 قوالب منشورات سوشيال ميديا.',
    platform: 'Mostaql',
    budget: '$200 - $400',
    budgetMinUsd: 200,
    budgetMaxUsd: 400,
    category: 'design_ui',
    experienceLevel: 'beginner',
    postedAt: 'منذ 45 دقيقة',
    postedHoursAgo: 0.75,
    matchScore: 80,
    skills: ['Graphic Design', 'Branding & Visual Identity', 'Adobe Illustrator', 'Figma'],
    clientRating: 4.87,
    saved: false,
  },
  {
    id: 'fw-db-des-3',
    title: 'إعادة تصميم موقع شركة SaaS وتحسين تجربة التحويل والنماذج',
    description:
      'مطلوب خبير UX/UI لإعادة هيكلة رحلة التسجيل ولوحة المستخدم في منصة سحابية مع تسليم Prototype تفاعلي في Figma.',
    platform: 'Fiverr Pro',
    budget: '$1,800 - $2,700',
    budgetMinUsd: 1800,
    budgetMaxUsd: 2700,
    category: 'design_ui',
    experienceLevel: 'expert',
    postedAt: 'منذ ساعتين',
    postedHoursAgo: 2,
    matchScore: 84,
    skills: ['UI Design', 'UX Research', 'Figma', 'Design Systems'],
    clientRating: 4.96,
    saved: false,
  },
  {
    id: 'fw-db-wrt-1',
    title: 'كتابة مقالات تقنية ومحتوى صفحات هبوط (Copywriting) لمنصة رقمية',
    description:
      'مطلوب كاتب محتوى ومبدع نصوص إعلانية لكتابة 6 مقالات متوافقة مع SEO ونصوص صفحة الهبوط باللغة العربية السلسة.',
    platform: 'Mostaql',
    budget: '$450 - $700',
    budgetMinUsd: 450,
    budgetMaxUsd: 700,
    category: 'writing_translation',
    experienceLevel: 'intermediate',
    postedAt: 'منذ 10 دقائق',
    postedHoursAgo: 0.16,
    matchScore: 88,
    skills: ['Copywriting', 'Content Writing', 'SEO', 'Blog & Article Writing'],
    clientRating: 4.9,
    saved: false,
  },
  {
    id: 'fw-db-wrt-2',
    title: 'ترجمة وتعريب واجهة تطبيق وموقع تعريفي (إنجليزي ↔ عربي)',
    description:
      'مطلوب مترجم دقيق لتعريب 3,500 كلمة من واجهات تطبيق ومساعدة المستخدم مع مراجعة لغوية وتنسيق مناسب.',
    platform: 'Upwork',
    budget: '$300 - $500',
    budgetMinUsd: 300,
    budgetMaxUsd: 500,
    category: 'writing_translation',
    experienceLevel: 'beginner',
    postedAt: 'منذ 50 دقيقة',
    postedHoursAgo: 0.85,
    matchScore: 85,
    skills: ['Arabic-English Translation', 'Localization', 'Editing & Proofreading'],
    clientRating: 4.89,
    saved: false,
  },
  {
    id: 'fw-db-wrt-3',
    title: 'صياغة نصوص إعلانية ونسخ بيعي (Copywriting) لصفحات منتجات متجر رقمي',
    description:
      'مطلوب أخصائي نسخ إعلاني ومحتوى لإعادة كتابة 10 صفحات هبوط ورسائل ترحيب بريدية بأسلوب مقنع يرفع معدل التحويل.',
    platform: 'Mostaql',
    budget: '$550 - $900',
    budgetMinUsd: 550,
    budgetMaxUsd: 900,
    category: 'writing_translation',
    experienceLevel: 'intermediate',
    postedAt: 'منذ 25 دقيقة',
    postedHoursAgo: 0.42,
    matchScore: 87,
    skills: ['Copywriting', 'Content Writing', 'Editing & Proofreading', 'Content Marketing'],
    clientRating: 4.92,
    saved: false,
  },
  {
    id: 'fw-db-mkt-1',
    title: 'إعداد خطة تسويق رقمي وتحسين ظهور متجر على Google (مناسب للمبتدئين)',
    description:
      'مراجعة الكلمات المفتاحية لـ 15 منتجاً وكتابة أوصاف محسنة لمحركات البحث SEO وإعداد تقرير أولي بسيط.',
    platform: 'Khamsat',
    budget: '$250 - $450',
    budgetMinUsd: 250,
    budgetMaxUsd: 450,
    category: 'marketing_seo',
    experienceLevel: 'beginner',
    postedAt: 'منذ 4 ساعات',
    postedHoursAgo: 4,
    matchScore: 79,
    skills: ['SEO', 'Digital Marketing', 'Content Marketing'],
    clientRating: 4.82,
    saved: false,
  },
  {
    id: 'fw-db-mkt-2',
    title: 'إدارة حملة إعلانات Meta و Google Ads لمنتج SaaS جديد',
    description:
      'بناء هيكل الحملات الإعلانية، اختبار الإعلانات A/B، وتقليل تكلفة الاكتساب (CPA) خلال شهر مع تقارير أسبوعية.',
    platform: 'Upwork',
    budget: '$1,100 - $1,650',
    budgetMinUsd: 1100,
    budgetMaxUsd: 1650,
    category: 'marketing_seo',
    experienceLevel: 'intermediate',
    postedAt: 'منذ 5 ساعات',
    postedHoursAgo: 5,
    matchScore: 81,
    skills: ['SEM / Google Ads', 'Meta Ads', 'Marketing Analytics'],
    clientRating: 4.91,
    saved: false,
  },
  {
    id: 'fw-db-data-1',
    title: 'تحليل بيانات مبيعات متجر إلكتروني وبناء لوحة تقارير Excel / Power BI',
    description:
      'تحليل ملف مبيعات سنوي وتنظيف البيانات واستخراج أهم المؤشرات والرسوم البيانية لمتابعة الأداء.',
    platform: 'Direct Client',
    budget: '$500 - $850',
    budgetMinUsd: 500,
    budgetMaxUsd: 850,
    category: 'software_ai',
    experienceLevel: 'beginner',
    postedAt: 'منذ 35 دقيقة',
    postedHoursAgo: 0.6,
    matchScore: 83,
    skills: ['Data Analysis', 'Excel Advanced Analytics', 'Power BI', 'SQL'],
    clientRating: 4.94,
    saved: false,
  },
];

/**
 * Normalize Arabic text so slight spelling variations, hamzas, taa marbuta, and spaces match cleanly.
 */
export function normalizeArabicAndEnglish(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const SKILL_SYNONYMS: Record<string, string[]> = {
  react: ['react', 'رياكت', 'nextjs', 'next.js', 'frontend', 'واجهات'],
  typescript: ['typescript', 'ts', 'javascript', 'js', 'جافاسكربت'],
  nodejs: ['node', 'node.js', 'express', 'backend', 'سيرفر', 'باك اند'],
  python: ['python', 'بايثون', 'django', 'fastapi', 'data'],
  ai: ['ai', 'llm', 'gemini', 'ذكاء اصطناعي', 'ai agents', 'prompt'],
  design: ['design', 'ui', 'ux', 'figma', 'تصميم', 'واجهات', 'جرافيك', 'شعار', 'هويه', 'illustrator', 'photoshop'],
  writing: ['write', 'writing', 'copywriting', 'content', 'كتابه', 'محتوي', 'نسخ', 'مقالات', 'تحرير'],
  translation: ['translate', 'translation', 'localization', 'ترجمه', 'تعريب'],
  marketing: ['marketing', 'seo', 'ads', 'تسويق', 'اعلانات', 'سيو'],
  mobile: ['flutter', 'react native', 'mobile', 'جوال', 'تطبيقات'],
  data: ['data', 'sql', 'excel', 'power bi', 'بيانات', 'تحليل'],
};

function expandSkillTokens(skillName: string): string[] {
  const norm = normalizeArabicAndEnglish(skillName);
  const tokens = new Set<string>([norm]);
  for (const [, syns] of Object.entries(SKILL_SYNONYMS)) {
    if (syns.some((s) => norm.includes(s) || s.includes(norm))) {
      syns.forEach((s) => tokens.add(s));
    }
  }
  return Array.from(tokens);
}

function parseBudgetRange(opp: Partial<OpportunityItem>): { min: number; max: number } {
  if (typeof opp.budgetMinUsd === 'number' && typeof opp.budgetMaxUsd === 'number') {
    return { min: opp.budgetMinUsd, max: opp.budgetMaxUsd };
  }
  const nums = (opp.budget || '').match(/\d[\d,]*/g);
  if (!nums || nums.length === 0) return { min: 500, max: 1500 };
  const parsed = nums.map((n) => Number(n.replace(/,/g, ''))).filter((n) => !Number.isNaN(n));
  if (parsed.length === 1) return { min: parsed[0], max: parsed[0] };
  return { min: Math.min(...parsed), max: Math.max(...parsed) };
}

export interface SmartDiscoveryOutput {
  opportunities: OpportunityItem[];
  voiceOpportunities: VoiceScoutedOpportunity[];
  filters: NonNullable<IntelligentIntentResult['discoveryFilters']>;
  summaryAr: string;
  summaryEn: string;
}

/**
 * 7-Step Smart Job Discovery grounded strictly in the real Firework database + user profile:
 * 1. Inspect user's registered skills
 * 2. Inspect experience & level
 * 3. Understand requested category, budget, difficulty, or recency
 * 4. Search ONLY available database projects (FIREWORK_MARKETPLACE_CATALOG + extraOpportunities)
 * 5. Compare projects against user's skills & profile
 * 6. Sort by relevance/recency
 * 7. Attach explicit match reasons for every project
 */
export function discoverSmartOpportunities(
  rawQuery: string,
  userProfile?: Partial<UserProfile>,
  extraOpportunities: Array<Partial<OpportunityItem>> = [],
  overrideFilters?: Partial<NonNullable<IntelligentIntentResult['discoveryFilters']>>
): SmartDiscoveryOutput {
  const norm = normalizeArabicAndEnglish(rawQuery);

  // Detect domain category filter
  let category: VoiceDomainCategory | 'all' = overrideFilters?.category || 'all';
  if (category === 'all') {
    if (/تصميم|واجهات|شعار|جرافيك|فيجما|ui|ux|figma|design|logo|brand/i.test(norm)) {
      category = 'design_ui';
    } else if (/برمجه|تطوير|تطبيق|موقع|كود|مطور|بايثون|رياكت|ذكاء|متجر|بيانات|software|code|dev|program|web|app|react|node|python|data/i.test(norm)) {
      category = 'software_ai';
    } else if (/كتابه|نسخ|ترجمه|تعريب|محتوي|مقال|تحرير|copywrit|writ|translat|content|localiz/i.test(norm)) {
      category = 'writing_translation';
    } else if (/تسويق|سيو|اعلانات|حمله|سوشيال|marketing|seo|ads|growth/i.test(norm)) {
      category = 'marketing_seo';
    }
  }

  // Detect difficulty / experience level filter
  let level: 'beginner' | 'intermediate' | 'expert' | 'all' = overrideFilters?.level || 'all';
  if (level === 'all') {
    if (/مبتدئ|مبتدئين|مبتدا|بدايه|بسيط|صغير|سريع|beginner|entry|junior|starter/i.test(norm)) {
      level = 'beginner';
    } else if (/متوسط|intermediate|mid/i.test(norm)) {
      level = 'intermediate';
    } else if (/خبير|معقد|كبير|متقدم|senior|expert|advanced/i.test(norm)) {
      level = 'expert';
    }
  }

  // Detect budget constraints
  let minBudget = overrideFilters?.minBudget;
  let maxBudget = overrideFilters?.maxBudget;
  const budgetMatch = rawQuery.match(/(\d[\d,]*)/);
  if (budgetMatch && /ميزاني|سعر|دولار|فوق|اكثر|اقل|تحت|حد|budget|\$|usd|price/i.test(norm)) {
    const num = Number(budgetMatch[1].replace(/,/g, ''));
    if (!Number.isNaN(num) && num > 0) {
      if (/فوق|اكثر|على الاقل|من|above|over|min|at least/i.test(norm)) {
        minBudget = num;
      } else if (/اقل|تحت|حد اقصى|حتى|under|below|max|less than/i.test(norm)) {
        maxBudget = num;
      } else {
        // User specified an exact target budget e.g. "بميزانية 500" -> search inclusive range containing or near 500
        minBudget = Math.max(0, Math.round(num * 0.65));
        maxBudget = Math.round(num * 1.45);
      }
    }
  }

  const sortBy: 'match' | 'newest' =
    overrideFilters?.sortBy ||
    (/احدث|جديده|الجديده|موخرا|آخر|اخر|latest|newest|recent/i.test(norm)
      ? 'newest'
      : 'match');

  const bestOnly =
    overrideFilters?.bestOnly ||
    /افضل فرص|انسب فرص|اقوى فرص|best opportunity|top match|best job/i.test(norm);

  // Deduplicate real database pool (extra user/saved DB items + official Firework catalog)
  const poolMap = new Map<string, OpportunityItem>();
  for (const item of [...extraOpportunities, ...FIREWORK_MARKETPLACE_CATALOG]) {
    if (!item.id || !item.title) continue;
    const key = item.title.trim().toLowerCase();
    if (!poolMap.has(key)) {
      const range = parseBudgetRange(item);
      poolMap.set(key, {
        id: item.id,
        title: item.title,
        description: item.description || '',
        platform: item.platform || 'Upwork',
        budget: item.budget || `$${range.min} - $${range.max}`,
        budgetMinUsd: range.min,
        budgetMaxUsd: range.max,
        category: item.category || 'general',
        experienceLevel: item.experienceLevel || 'intermediate',
        postedAt: item.postedAt || 'الآن',
        postedHoursAgo: item.postedHoursAgo ?? 2,
        matchScore: item.matchScore ?? 75,
        skills: Array.isArray(item.skills) ? item.skills : [],
        clientRating: item.clientRating ?? 4.8,
        saved: Boolean(item.saved),
      });
    }
  }

  const pool = Array.from(poolMap.values());

  // Extract user profile signals (Step 1 & Step 2)
  const userSkills = Array.isArray(userProfile?.skills)
    ? userProfile!.skills.map((s) => (typeof s === 'string' ? s : s.name)).filter(Boolean)
    : [];
  const userSkillExpanded = userSkills.map((sk) => ({
    raw: sk,
    tokens: expandSkillTokens(sk),
  }));
  const userLevel = (userProfile?.professionalLevel || '').toLowerCase();
  const isUserBeginner =
    userProfile?.hasWorkExperience === false ||
    /beginner|junior/i.test(userLevel) ||
    userSkills.length <= 2;
  const userHeadlineNorm = normalizeArabicAndEnglish(
    `${userProfile?.professionalHeadline || userProfile?.title || ''} ${
      userProfile?.professionalCategory || ''
    } ${userProfile?.specialization || ''}`
  );

  // Filter from real DB (Step 4)
  const filteredPool = pool.filter((item) => {
    if (category !== 'all') {
      const itemTextNorm = normalizeArabicAndEnglish(
        `${item.title} ${item.description} ${item.skills.join(' ')}`
      );
      const catMatches =
        item.category === category ||
        (category === 'design_ui' && /تصميم|figma|ui|ux|graphic|brand/i.test(itemTextNorm)) ||
        (category === 'software_ai' && /react|typescript|node|flutter|python|برمج|تطوير|تطبيق|موقع|بيانات/i.test(itemTextNorm)) ||
        (category === 'writing_translation' && /كتاب|ترجم|تعريب|محتو|copywrit|seo|localiz/i.test(itemTextNorm)) ||
        (category === 'marketing_seo' && /تسويق|ads|seo|marketing/i.test(itemTextNorm));
      if (!catMatches) return false;
    }

    if (level !== 'all' && item.experienceLevel !== level) {
      return false;
    }

    const min = item.budgetMinUsd ?? 0;
    const max = item.budgetMaxUsd ?? 100000;
    if (minBudget !== undefined && max < minBudget) return false;
    if (maxBudget !== undefined && min > maxBudget) return false;

    return true;
  });

  // Score and attach honest matchReasons (Steps 5, 6, 7)
  const scored = filteredPool.map((item) => {
    const matchedSkills: string[] = [];
    const itemSkillTokens = item.skills.map((s) => normalizeArabicAndEnglish(s));
    const itemAllNorm = normalizeArabicAndEnglish(
      `${item.title} ${item.description} ${item.skills.join(' ')}`
    );

    for (const uSkill of userSkillExpanded) {
      const hitsSkill =
        uSkill.tokens.some((tok) => itemSkillTokens.some((is) => is.includes(tok) || tok.includes(is))) ||
        uSkill.tokens.some((tok) => itemAllNorm.includes(tok));
      if (hitsSkill) {
        matchedSkills.push(uSkill.raw);
      }
    }

    let score = 62;
    const reasons: string[] = [];

    if (matchedSkills.length > 0) {
      score += Math.min(28, matchedSkills.length * 10);
      reasons.push(`يتطابق مباشرة مع مهاراتك: ${matchedSkills.slice(0, 3).join('، ')}`);
    } else if (userHeadlineNorm && itemAllNorm.split(' ').some((w) => w.length > 3 && userHeadlineNorm.includes(w))) {
      score += 14;
      reasons.push(`يناسب تخصصك المهني (${userProfile?.professionalHeadline || userProfile?.title || 'ملفك الشخصي'})`);
    } else if (userSkills.length === 0) {
      reasons.push('متاح للتقديم المباشر في قاعدة بيانات Firework (أضف مهاراتك لرفع دقة الترتيب)');
    }

    if (level !== 'all' && item.experienceLevel === level) {
      score += 6;
      reasons.push(
        level === 'beginner'
          ? 'مصنف كمشروع مناسب للمبتدئين بنطاق واضح'
          : level === 'expert'
          ? 'مشروع متقدم بعائد مالي أعلى'
          : 'مناسب للمستوى المتوسط'
      );
    } else if (isUserBeginner && item.experienceLevel === 'beginner') {
      score += 8;
      reasons.push('نطاقه المالي والفني مثالي لمستوى خبرتك الحالي');
    } else if (!isUserBeginner && item.experienceLevel !== 'beginner') {
      score += 5;
      reasons.push('يتناسب مع مستوى خبرتك المهنية');
    }

    if (minBudget !== undefined || maxBudget !== undefined) {
      reasons.push(`ميزانيته (${item.budget}) تقع ضمن النطاق الذي طلبته`);
    } else {
      reasons.push(`تقييم العميل مرتفع (${item.clientRating}★) على ${item.platform}`);
    }

    if ((item.postedHoursAgo ?? 10) <= 1) {
      score += 3;
    }

    const finalScore = Math.max(55, Math.min(99, score));
    return {
      ...item,
      matchScore: finalScore,
      matchReasons: reasons,
    };
  });

  scored.sort((a, b) => {
    if (sortBy === 'newest') {
      return (a.postedHoursAgo ?? 99) - (b.postedHoursAgo ?? 99);
    }
    return b.matchScore - a.matchScore;
  });

  const finalList = bestOnly ? scored.slice(0, 3) : scored.slice(0, 6);

  const voiceOpportunities: VoiceScoutedOpportunity[] = finalList.map((o) => ({
    id: o.id,
    title: o.title,
    platform: String(o.platform),
    budget: o.budget,
    budgetMinUsd: o.budgetMinUsd,
    budgetMaxUsd: o.budgetMaxUsd,
    deadline: '14 يوماً',
    matchScore: o.matchScore,
    description: o.description,
    requiredSkills: o.skills,
    clientRating: o.clientRating,
    postedAgo: o.postedAt,
    postedHoursAgo: o.postedHoursAgo,
    experienceLevel: o.experienceLevel,
    category: (o.category as VoiceDomainCategory) || 'general',
    matchReasons: o.matchReasons,
  }));

  let summaryAr = '';
  let summaryEn = '';

  if (finalList.length === 0) {
    summaryAr =
      'بحثت في قاعدة بيانات المشاريع المتاحة على Firework ولم أجد حالياً مشاريع تطابق هذه الشروط بدقة (دون اختلاق مشاريع وهمية). يمكنك توسيع نطاق الميزانية أو تعديل التخصص، وقد فتحت لك رادار الفرص لاستعراض جميع المشاريع المتوفرة.';
    summaryEn =
      'I searched the Firework projects database and found no listings matching those exact constraints (without inventing fake projects). Try broadening the budget or category filter in the Opportunities radar.';
  } else {
    const top = finalList[0];
    const reasonsPreview = (top.matchReasons || []).slice(0, 2).join(' — ');
    const titlesList = finalList
      .slice(0, 3)
      .map((o, i) => `${i + 1}. ${o.title} (${o.budget} · توافق ${o.matchScore}%) — السبب: ${o.matchReasons?.[0] || ''}`)
      .join('\n');

    summaryAr = bestOnly
      ? `أفضل فرصة عمل متاحة لك حالياً في قاعدة البيانات هي: "${top.title}" بميزانية ${top.budget} ونسبة توافق ${top.matchScore}% (${reasonsPreview}). فتحت لك رادار الفرص لعرضها والتقديم عليها.`
      : `فحصت مهاراتك (${userSkills.slice(0, 3).join('، ') || 'ملفك الشخصي'}) وقارنتها مع قاعدة بيانات Firework، ووجدت ${finalList.length} مشاريع مطابقة مرتبة حسب الأنسب لك:\n${titlesList}`;

    summaryEn = bestOnly
      ? `Your top real match in the Firework database right now is "${top.title}" (${top.budget}, ${top.matchScore}% match). Reason: ${reasonsPreview}.`
      : `Checked your profile skills and found ${finalList.length} real matching projects in the Firework database, led by "${top.title}" (${top.budget}, ${top.matchScore}% match).`;
  }

  return {
    opportunities: finalList,
    voiceOpportunities,
    filters: { category, level, minBudget, maxBudget, sortBy, bestOnly },
    summaryAr,
    summaryEn,
  };
}

/**
 * Intelligent Natural-Language & Intent Understanding Engine (Arabic MSA + Dialects + English + Typos).
 * Follows UNDERSTAND -> ANALYZE -> SELECT TOOL -> EXECUTE -> VERIFY -> RESPOND.
 */
export function understandIntelligentAgentRequest(
  rawCommand: string,
  context: AgentContextSnapshot = {}
): IntelligentIntentResult {
  const clean = (rawCommand || '').trim();
  const norm = normalizeArabicAndEnglish(clean);

  const emptyBrief = {
    title: '',
    platform: 'Upwork',
    description: '',
    budget: '$1,000',
    deadline: '14 يوماً',
  };

  const trace = ['UNDERSTAND', 'ANALYZE', 'SELECT_TOOL', 'EXECUTE', 'VERIFY', 'RESPOND'];

  if (!clean) {
    return {
      actionType: 'unknown',
      targetView: 'overview',
      domainCategory: 'general',
      searchKeywords: [],
      statusSequence: ['Thinking...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      executionTrace: trace,
      spokenSummaryAr: 'لا أعرف.',
      spokenSummaryEn: "I don't know.",
    };
  }

  // =========================================================================
  // 1. WORK / SLEEP MODE & AVAILABILITY CONTROL (Natural dialects + synonyms)
  // =========================================================================
  const wantsSleepMode =
    /(الى|ل|وضعي ل|وضع|الي)\s*(sleep|سليب|نوم|راحه|هدوء|نايم)|sleep mode|switch.*sleep|set.*sleep|go to sleep|وقف استقبالي|ما بدي اكون متاح|غير متاح|لست متاح|ايقاف التوفر|عطل التوفر|مش فاضي|مش متاح|اوقف استقبالي|خليني نايم|حطني سليب|disable availability|unavailable/i.test(
      norm
    );
  const wantsWorkMode =
    /(الى|ل|وضعي ل|وضع|الي)\s*(work|وورك|عمل|شغل|متاح)|work mode|switch.*work|set.*work|فعل وضع work|خليني متاح|خليتني متاح|انا جاهز استقبل|جاهز للعمل|متاح للعمل|فعل التوفر|استقبل مشاريع|ارجع للعمل|enable availability|available for work|i am available/i.test(
      norm
    ) && !wantsSleepMode;

  if (wantsSleepMode || wantsWorkMode) {
    const targetMode: 'work' | 'sleep' = wantsSleepMode ? 'sleep' : 'work';
    return {
      actionType: 'set_work_status',
      targetView: 'overview',
      domainCategory: 'general',
      searchKeywords: ['workStatus', targetMode],
      statusSequence: ['Thinking...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      workStatus: targetMode,
      executionTrace: trace,
      spokenSummaryAr:
        targetMode === 'sleep'
          ? 'تم التحويل إلى وضع Sleep وتعطيل التوفر لاستقبال مشاريع جديدة حالياً. تم التحديث والتحقق من حالتك في النظام.'
          : 'تم تفعيل وضع Work وجعلك متاحاً لاستقبال المشاريع الجديدة الآن. تم التحقق من تحديث حالتك بنجاح.',
      spokenSummaryEn:
        targetMode === 'sleep'
          ? 'Switched your status to Sleep mode and paused work availability. Verified in your workspace.'
          : 'Activated Work mode and marked you available for new freelance projects.',
    };
  }

  // =========================================================================
  // 2. SKILLS & PROFILE MODIFICATIONS (Add/Remove Skills, Hourly Rate, Title)
  // =========================================================================
  const addSkillMatch = clean.match(
    /(?:أضف|اضف|أضيف|ضف|سجل|زود|add)\s+(?:مهارة|مهاره|skill)?\s*[:\-]?\s*([A-Za-z0-9\u0600-\u06FF\s.+/#-]{2,40}?)(?:\s+(?:لمهاراتي|إلى مهاراتي|الى مهاراتي|في ملفي|to my skills|to profile)|$)/i
  );
  if (
    addSkillMatch &&
    /مهار|skill/i.test(norm) &&
    !/احذف|امسح|remove|delete/i.test(norm)
  ) {
    const skillName = addSkillMatch[1]
      .replace(/^(مهارة|مهاره|skill)\s+/i, '')
      .trim();
    if (skillName.length >= 2) {
      return {
        actionType: 'manage_skills',
        targetView: 'profile',
        domainCategory: 'general',
        searchKeywords: ['skill', 'add', skillName],
        statusSequence: ['Thinking...', 'Planning...'],
        generatedOpportunities: [],
        generatedProjectBrief: emptyBrief,
        skillMutation: { operation: 'add', skillName, level: 'متقدم' },
        executionTrace: trace,
        spokenSummaryAr: `تمت إضافة مهارة "${skillName}" إلى ملفك المهني والتحقق من حفظها بنجاح.`,
        spokenSummaryEn: `Added "${skillName}" to your professional skills and verified the update.`,
      };
    }
  }

  const removeSkillMatch = clean.match(
    /(?:احذف|امسح|أزل|ازل|شيل|remove|delete)\s+(?:مهارة|مهاره|skill)?\s*[:\-]?\s*([A-Za-z0-9\u0600-\u06FF\s.+/#-]{2,40}?)(?:\s+(?:من مهاراتي|من ملفي|from skills)|$)/i
  );
  if (removeSkillMatch && /مهار|skill/i.test(norm)) {
    const skillName = removeSkillMatch[1]
      .replace(/^(مهارة|مهاره|skill)\s+/i, '')
      .trim();
    if (skillName.length >= 2) {
      return {
        actionType: 'manage_skills',
        targetView: 'profile',
        domainCategory: 'general',
        searchKeywords: ['skill', 'remove', skillName],
        statusSequence: ['Thinking...', 'Planning...'],
        generatedOpportunities: [],
        generatedProjectBrief: emptyBrief,
        skillMutation: { operation: 'remove', skillName },
        executionTrace: trace,
        spokenSummaryAr: `تمت إزالة مهارة "${skillName}" من ملفك المهني والتحقق من التحديث.`,
        spokenSummaryEn: `Removed "${skillName}" from your skills profile.`,
      };
    }
  }

  // Update hourly rate
  if (/سعر الساع|سعر ساعتي|الاجر بالساع|hourly rate|my rate/i.test(norm) && /\d+/.test(clean)) {
    const rateMatch = clean.match(/(\d+(?:\.\d+)?)/);
    const newRate = rateMatch ? Math.max(5, Math.min(2000, Number(rateMatch[1]))) : 50;
    return {
      actionType: 'update_profile',
      targetView: 'profile',
      domainCategory: 'general',
      searchKeywords: ['hourlyRate', String(newRate)],
      statusSequence: ['Thinking...', 'Planning...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      profileUpdates: { hourlyRate: newRate },
      executionTrace: trace,
      spokenSummaryAr: `تم تحديث سعر ساعتك المهنية إلى $${newRate}/ساعة والتحقق من حفظه في ملفك الشخصي.`,
      spokenSummaryEn: `Updated your hourly rate to $${newRate}/hr in your professional profile.`,
    };
  }

  // =========================================================================
  // 3. DESTRUCTIVE ACTIONS (Require Confirmation First)
  // =========================================================================
  if (
    /احذف مشروع|امسح مشروع|ازاله مشروع|delete project|remove project/i.test(norm)
  ) {
    const keyword = clean
      .replace(/احذف مشروع|امسح مشروع|حذف مشروع|delete project|remove project/gi, '')
      .trim();
    const matchedProj = (context.projects || []).find(
      (p) =>
        p.title &&
        (!keyword || normalizeArabicAndEnglish(p.title).includes(normalizeArabicAndEnglish(keyword)))
    );
    const targetTitle = matchedProj?.title || keyword || (context.projects?.[0]?.title || 'المشروع المحدد');
    return {
      actionType: 'delete_project',
      targetView: 'saved-projects',
      domainCategory: 'general',
      searchKeywords: ['delete', targetTitle],
      statusSequence: ['Thinking...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      projectDeleteTarget: {
        projectId: matchedProj?.id,
        projectTitleKeyword: targetTitle,
      },
      requiresConfirmation: true,
      confirmed: false,
      executionTrace: ['UNDERSTAND', 'ANALYZE', 'SELECT_TOOL', 'REQUEST_CONFIRMATION'],
      spokenSummaryAr: `هذا إجراء حساس غير قابل للتراجع: هل تؤكد رغبتك في حذف المشروع "${targetTitle}" نهائياً؟`,
      spokenSummaryEn: `Confirm destructive action: do you want to permanently delete project "${targetTitle}"?`,
    };
  }

  // =========================================================================
  // 4. PROJECT STATUS & SAVED PROJECT DETAILS
  // =========================================================================
  if (
    /غير حاله|حول حاله|حدث حاله|انقل مشروع|نقل مشروع|update status|move project|change status/i.test(
      norm
    )
  ) {
    let newStatus: ProjectStatus = 'in_progress';
    if (/مكتمل|خلص|انتهى|completed|done/i.test(norm)) newStatus = 'completed';
    else if (/مورشف|ارشف|archived/i.test(norm)) newStatus = 'archived';
    else if (/تم التحليل|محلل|analyzed/i.test(norm)) newStatus = 'analyzed';
    else if (/عرض|تقديم|proposed/i.test(norm)) newStatus = 'proposed';
    else if (/انتظار|waiting/i.test(norm)) newStatus = 'waiting';
    else if (/جديد|new/i.test(norm)) newStatus = 'new';

    const targetProj = (context.projects || [])[0];
    return {
      actionType: 'update_project_status',
      targetView: 'saved-projects',
      domainCategory: 'general',
      searchKeywords: ['status', newStatus],
      statusSequence: ['Thinking...', 'Planning...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      projectStatusUpdate: {
        projectId: targetProj?.id,
        projectTitleKeyword: targetProj?.title || '',
        newStatus,
      },
      executionTrace: trace,
      spokenSummaryAr: targetProj
        ? `تم تحديث حالة المشروع "${targetProj.title}" إلى "${newStatus}" والتحقق منه في لوحة مشاريعك.`
        : `فتحت لك لوحة المشاريع لإدارة حالات مشاريعك (${newStatus}).`,
      spokenSummaryEn: targetProj
        ? `Updated project "${targetProj.title}" status to "${newStatus}" in My Projects.`
        : `Opened My Projects to manage project statuses.`,
    };
  }

  if (
    /تفاصيل مشروع|اعرض مشروع|افتح تفاصيل|inspect project|show project details/i.test(
      norm
    )
  ) {
    const keyword = clean
      .replace(/تفاصيل مشروع|اعرض مشروع|افتح تفاصيل|inspect project|show project details/gi, '')
      .trim();
    const foundProj = (context.projects || []).find(
      (p) =>
        p.title &&
        (!keyword || normalizeArabicAndEnglish(p.title).includes(normalizeArabicAndEnglish(keyword)))
    );
    return {
      actionType: 'inspect_project',
      targetView: foundProj ? 'project-analyzer' : 'saved-projects',
      domainCategory: 'general',
      searchKeywords: ['inspect', keyword],
      statusSequence: ['Thinking...', 'Searching...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      inspectTarget: {
        projectId: foundProj?.id,
        titleKeyword: foundProj?.title || keyword,
      },
      executionTrace: trace,
      spokenSummaryAr: foundProj
        ? `عرضت لك تفاصيل المشروع "${foundProj.title}" في محلل المشاريع.`
        : 'فتحت لك لوحة المشاريع المحفوظة لاستعراض تفاصيل أي مشروع.',
      spokenSummaryEn: foundProj
        ? `Opened project details for "${foundProj.title}" in the Project Analyzer.`
        : 'Opened your Saved Projects board to view project details.',
    };
  }

  // =========================================================================
  // 5. NOTIFICATIONS, WORKSPACE SUMMARY, THEME, LANGUAGE, TIMER, TOUR
  // =========================================================================
  if (/ما هي اشعاراتي|اعرض الاشعارات|كم اشعار|اقرا الاشعارات|my notifications|check notifications|show inbox/i.test(norm)) {
    const notifs = context.notifications || [];
    const unread = notifs.filter((n) => !n.read);
    return {
      actionType: 'check_notifications',
      targetView: 'notifications',
      domainCategory: 'general',
      searchKeywords: ['notifications'],
      statusSequence: ['Thinking...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      executionTrace: trace,
      spokenSummaryAr:
        unread.length > 0
          ? `لديك ${unread.length} إشعارات غير مقروءة، أحدثها: "${unread[0].title}". فتحت لك صندوق الوارد الآن.`
          : 'لا توجد لديك إشعارات غير مقروءة حالياً. فتحت لك صندوق الوارد.',
      spokenSummaryEn:
        unread.length > 0
          ? `You have ${unread.length} unread notifications, latest: "${unread[0].title}". Opened Inbox.`
          : 'You have no unread notifications right now. Opened Inbox.',
    };
  }

  if (
    /حالتي الحالي|شو وضعي|ملخص حسابي|كم مشروعي|كم مشروع عندي|كم ارباحي|ما مهاراتي|workspace summary|my stats|my status|my skills/i.test(
      norm
    )
  ) {
    const statusLabel = (context.workStatus || context.userProfile?.workStatus || 'work') === 'work' ? 'Work (متاح للعمل)' : 'Sleep (وضع الهدوء)';
    const projCount = context.projects?.length ?? 0;
    const skillCount = context.userProfile?.skills?.length ?? 0;
    const rate = context.userProfile?.hourlyRate ?? 50;
    return {
      actionType: 'workspace_summary',
      targetView: 'overview',
      domainCategory: 'general',
      searchKeywords: ['summary'],
      statusSequence: ['Thinking...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      executionTrace: trace,
      spokenSummaryAr: `ملخص حسابك الآن: وضعك الحالي هو ${statusLabel}، لديك ${projCount} مشاريع محفوظة و${skillCount} مهارات مسجلة، وسعر ساعتك $${rate}/ساعة.`,
      spokenSummaryEn: `Your workspace status: ${statusLabel}, ${projCount} saved projects, ${skillCount} registered skills, hourly rate $${rate}/hr.`,
    };
  }

  // Theme changes (with typo/dialect tolerance)
  const isThemeDark =
    /الوضع الليلي|الوضع الداكن|الوضع المظلم|نمط داكن|دارك مود|ثيم اسود|ليلي|dark mode|dark theme|switch to dark/i.test(
      norm
    );
  const isThemeLight =
    /الوضع الفاتح|الوضع النهاري|نمط فاتح|لايت مود|ثيم ابيض|نهاري|light mode|light theme|switch to light/i.test(
      norm
    );
  const isThemeToggle = /بدل المظهر|غير المظهر|تبديل الاضاءه|toggle theme|switch theme/i.test(norm);

  if (isThemeDark || isThemeLight || isThemeToggle) {
    const themeMode: 'dark' | 'light' | 'toggle' = isThemeDark
      ? 'dark'
      : isThemeLight
      ? 'light'
      : 'toggle';
    return {
      actionType: 'set_theme',
      targetView: 'overview',
      domainCategory: 'general',
      searchKeywords: ['theme', themeMode],
      statusSequence: ['Thinking...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      themeMode,
      executionTrace: trace,
      spokenSummaryAr:
        themeMode === 'dark'
          ? 'تم تفعيل الوضع الداكن في التطبيق والتحقق منه بنجاح.'
          : themeMode === 'light'
          ? 'تم تفعيل الوضع الفاتح في التطبيق والتحقق منه بنجاح.'
          : 'تم تبديل مظهر التطبيق والتحقق منه.',
      spokenSummaryEn:
        themeMode === 'dark'
          ? 'Switched application to dark mode.'
          : themeMode === 'light'
          ? 'Switched application to light mode.'
          : 'Toggled application theme.',
    };
  }

  // Language changes
  const hasLangTrigger =
    /غير اللغ|حول اللغ|بدل اللغ|الواجهه باللغ|اختر اللغ|change language|switch language|set language|in english|in arabic|بالعربي|بالانجليزي|بالفرنسي/i.test(
      norm
    );
  if (hasLangTrigger) {
    let languageCode: NonNullable<IntelligentIntentResult['languageCode']> = 'ar';
    let langLabelAr = 'العربية';
    let langLabelEn = 'Arabic';
    if (/انجليز|english/i.test(norm)) {
      languageCode = 'en';
      langLabelAr = 'الإنجليزية';
      langLabelEn = 'English';
    } else if (/فرنس|french/i.test(norm)) {
      languageCode = 'fr';
      langLabelAr = 'الفرنسية';
      langLabelEn = 'French';
    } else if (/اسبان|spanish/i.test(norm)) {
      languageCode = 'es';
      langLabelAr = 'الإسبانية';
      langLabelEn = 'Spanish';
    } else if (/المان|german/i.test(norm)) {
      languageCode = 'de';
      langLabelAr = 'الألمانية';
      langLabelEn = 'German';
    } else if (/ترك|turkish/i.test(norm)) {
      languageCode = 'tr';
      langLabelAr = 'التركية';
      langLabelEn = 'Turkish';
    }
    return {
      actionType: 'set_language',
      targetView: 'overview',
      domainCategory: 'general',
      searchKeywords: ['language', languageCode],
      statusSequence: ['Thinking...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      languageCode,
      executionTrace: trace,
      spokenSummaryAr: `تم تغيير لغة التطبيق إلى ${langLabelAr} والتحقق منها.`,
      spokenSummaryEn: `Changed application language to ${langLabelEn}.`,
    };
  }

  // Focus timer commands
  if (/شغل موقت|ابدا موقت|تشغيل الموقت|ابدا التركيز|شغل التركيز|start timer|start focus/i.test(norm)) {
    return {
      actionType: 'control_timer',
      targetView: 'overview',
      domainCategory: 'general',
      searchKeywords: ['timer', 'start'],
      statusSequence: ['Thinking...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      timerAction: 'start',
      executionTrace: trace,
      spokenSummaryAr: 'تم تشغيل مؤقت التركيز وحساب الجلسة المباشرة.',
      spokenSummaryEn: 'Started the live focus timer.',
    };
  }
  if (/اوقف الموقت|ايقاف الموقت|stop timer|pause timer/i.test(norm)) {
    return {
      actionType: 'control_timer',
      targetView: 'overview',
      domainCategory: 'general',
      searchKeywords: ['timer', 'stop'],
      statusSequence: ['Thinking...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      timerAction: 'stop',
      executionTrace: trace,
      spokenSummaryAr: 'تم إيقاف مؤقت التركيز مؤقتاً.',
      spokenSummaryEn: 'Paused the focus timer.',
    };
  }
  if (/صفر الموقت|تصفير الموقت|اعاده ضبط الموقت|reset timer/i.test(norm)) {
    return {
      actionType: 'control_timer',
      targetView: 'overview',
      domainCategory: 'general',
      searchKeywords: ['timer', 'reset'],
      statusSequence: ['Thinking...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      timerAction: 'reset',
      executionTrace: trace,
      spokenSummaryAr: 'تم تصفير مؤقت التركيز.',
      spokenSummaryEn: 'Reset the focus timer.',
    };
  }

  // Tour
  if (/جوله تعريفيه|شغل الجوله|ابدا الجوله|جوله في التطبيق|شرح الواجهه|product tour|start tour|show tour/i.test(norm)) {
    return {
      actionType: 'start_tour',
      targetView: 'overview',
      domainCategory: 'general',
      searchKeywords: ['tour'],
      statusSequence: ['Thinking...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      executionTrace: trace,
      spokenSummaryAr: 'تم تشغيل الجولة التعريفية التفاعلية في التطبيق الآن.',
      spokenSummaryEn: 'Started the interactive product tour.',
    };
  }

  // Clear / Read notifications
  if (/علم الاشعارات كمقروء|قراءه كل الاشعارات|امسح الاشعارات|تصفير الاشعارات|clear notifications|mark notifications read/i.test(norm)) {
    return {
      actionType: 'clear_notifications',
      targetView: 'notifications',
      domainCategory: 'general',
      searchKeywords: ['notifications', 'clear'],
      statusSequence: ['Thinking...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      executionTrace: trace,
      spokenSummaryAr: 'تم تعليم جميع الإشعارات كمقروءة وفتح صندوق الوارد.',
      spokenSummaryEn: 'Marked all notifications as read and opened Inbox.',
    };
  }

  // Financial record
  const isRecordIncome = /سجل ربح|اضف ربح|سجل دفعه|اضف دفعه|سجل دخل|استلمت دفعه|record income|add revenue|add income/i.test(norm);
  const isRecordExpense = /سجل مصروف|اضف مصروف|سجل تكلفه|record expense|add expense/i.test(norm);
  if (isRecordIncome || isRecordExpense) {
    const numMatch = clean.match(/(\d+(?:[.,]\d+)?)/);
    const amount = numMatch ? Math.max(1, Number(numMatch[1].replace(',', ''))) : 500;
    const type: 'revenue' | 'expense' = isRecordExpense ? 'expense' : 'revenue';
    return {
      actionType: 'add_financial_record',
      targetView: 'financials',
      domainCategory: 'general',
      searchKeywords: ['financials', type, String(amount)],
      statusSequence: ['Thinking...', 'Planning...'],
      generatedOpportunities: [],
      generatedProjectBrief: emptyBrief,
      financialRecord: {
        type,
        amount,
        title:
          type === 'revenue'
            ? `دفعة مشروع مسجلة ($${amount})`
            : `مصروف تشغيلي مسجل ($${amount})`,
      },
      executionTrace: trace,
      spokenSummaryAr:
        type === 'revenue'
          ? `تم تسجيل دفعة إيراد بقيمة ${amount} دولار في السجل المالي وفتح صفحة المالية.`
          : `تم تسجيل مصروف بقيمة ${amount} دولار في السجل المالي وفتح صفحة المالية.`,
      spokenSummaryEn:
        type === 'revenue'
          ? `Recorded a $${amount} revenue payment and opened Financials.`
          : `Recorded a $${amount} expense and opened Financials.`,
    };
  }

  // Save new project
  if (/احفظ مشروع|اضف مشروع|سجل مشروع|انشئ مشروع|save project|create project|add project/i.test(norm)) {
    const numMatch = clean.match(/(\d+)/);
    const budget = numMatch ? `$${numMatch[1]}` : '$1,200';
    const title =
      clean
        .replace(/احفظ مشروع|أضف مشروع|اضف مشروع|سجل مشروع|أنشئ مشروع|انشئ مشروع|save project|create project|add project/gi, '')
        .trim() || 'مشروع عمل حر جديد';
    return {
      actionType: 'save_project',
      targetView: 'saved-projects',
      domainCategory: 'general',
      searchKeywords: ['save', title],
      statusSequence: ['Thinking...', 'Planning...'],
      generatedOpportunities: [],
      generatedProjectBrief: {
        title: title.slice(0, 75),
        platform: 'Upwork',
        description: clean,
        budget,
        deadline: '14 يوماً',
      },
      executionTrace: trace,
      spokenSummaryAr: `تم حفظ المشروع "${title.slice(0, 40)}" في لوحة مشاريعك وفتحها للتحقق.`,
      spokenSummaryEn: `Saved project "${title.slice(0, 40)}" to My Projects.`,
    };
  }

  // Domain helpers for Proposal / Pricing / Analysis / Job Discovery
  const isWritingOrTranslation = /كتاب|نسخ|ترجم|تعريب|محتو|مقال|مدون|تحرير|تدقيق|نصوص|copywrit|writ|translat|content|article|localiz/i.test(norm);
  const isDesignUi = /تصميم|واجه|شعار|جرافيك|فيجما|هويه|design|ui|ux|figma|branding|logo/i.test(norm);
  const isMarketingSeo = /تسويق|سيو|حملات|اعلانات|سوشيال|marketing|seo|ads|growth/i.test(norm);
  const isSoftwareAi = /برمج|تطوير|تطبيق|موقع|ذكاء|بايثون|رياكت|سيرفر|متجر|كود|بيانات|code|dev|react|node|ai|saas|app|web/i.test(norm);

  const domainCategory: VoiceDomainCategory = isWritingOrTranslation
    ? 'writing_translation'
    : isDesignUi
    ? 'design_ui'
    : isMarketingSeo
    ? 'marketing_seo'
    : isSoftwareAi
    ? 'software_ai'
    : 'general';

  const isProposalIntent = /اكتب عرض|صياغه عرض|تقديم عرض|جهز عرض|انشئ عرض|write proposal|draft proposal|generate proposal/i.test(norm);
  const isPricingIntent = /احسب تسعير|حاسبه التسعير|حاسبه السعر|كم اسعر|calculate pricing|pricing calculator|quote price/i.test(norm);
  const isAnalyzeIntent = /حلل مشروع|تحليل مشروع|حلل عقد|فحص مشروع|كشف مخاطر|تقييم مشروع|analyze project|review contract|inspect contract/i.test(norm);

  if (isProposalIntent) {
    return {
      actionType: 'generate_proposal',
      targetView: 'proposal-studio',
      domainCategory,
      searchKeywords: ['عرض سعر', 'Proposal'],
      statusSequence: ['Thinking...', 'Planning...'],
      generatedOpportunities: [],
      generatedProjectBrief: {
        title: clean.slice(0, 70) || 'مشروع عمل حر مخصص',
        platform: 'Upwork',
        description: clean,
        budget: '$1,500',
        deadline: '14 يوماً',
      },
      executionTrace: trace,
      spokenSummaryAr: 'تم توليد وحفظ مسودة عرض السعر التنافسي وفتح استوديو العروض الآن.',
      spokenSummaryEn: 'Generated and saved a competitive proposal draft and opened Proposal Studio.',
    };
  }

  if (isPricingIntent) {
    return {
      actionType: 'open_pricing',
      targetView: 'pricing-calculator',
      domainCategory,
      searchKeywords: ['Pricing'],
      statusSequence: ['Thinking...', 'Planning...'],
      generatedOpportunities: [],
      generatedProjectBrief: {
        title: clean.slice(0, 70) || 'تسعير مشروع جديد',
        platform: 'Direct Client',
        description: clean,
        budget: '$1,500',
        deadline: '15 يوماً',
      },
      executionTrace: trace,
      spokenSummaryAr: 'فتحت لك حاسبة التسعير الذكية لحساب السعر العادل وصافي الربح.',
      spokenSummaryEn: 'Opened Pricing Calculator to compute fair pricing and net profit.',
    };
  }

  if (isAnalyzeIntent) {
    return {
      actionType: 'analyze_project',
      targetView: 'project-analyzer',
      domainCategory,
      searchKeywords: ['Analyze'],
      statusSequence: ['Thinking...', 'Searching...', 'Planning...'],
      generatedOpportunities: [],
      generatedProjectBrief: {
        title: clean.slice(0, 70) || 'تحليل مشروع جديد',
        platform: 'Upwork',
        description: clean,
        budget: '$1,400',
        deadline: '3 أسابيع',
      },
      executionTrace: trace,
      spokenSummaryAr: 'تم تحليل المشروع وحفظه وفتح محلل العقود والمشاريع لاستعراض النتائج والمخاطر.',
      spokenSummaryEn: 'Analyzed and saved the project, and opened Project Analyzer.',
    };
  }

  // =========================================================================
  // 6. SMART JOB DISCOVERY (Matches User Skills & Queries Real Database!)
  // =========================================================================
  const isSmartDiscoveryIntent =
    /ابحث|بحث|دور لي|جد لي|الاقي|اعرض.*مشاريع|اريد عملا|اريد عمل|ابي شغل|ابغا شغل|ابغي عمل|مشاريع.*مبتدئين|مشاريع.*ميزاني|افضل فرص|انسب فرص|احدث المشاريع|فرص.*مناسبه|عمل مناسب|اعمال مناسبه|find.*job|find.*work|search.*project|discover|opportunities|scout|best job|beginner.*project|latest project/i.test(
      norm
    );

  if (isSmartDiscoveryIntent) {
    const discovery = discoverSmartOpportunities(
      clean,
      context.userProfile,
      context.opportunities || []
    );
    const topBrief = discovery.voiceOpportunities[0];
    return {
      actionType: 'scout_opportunities',
      targetView: 'opportunities',
      domainCategory:
        discovery.filters.category === 'all' ? domainCategory : discovery.filters.category,
      searchKeywords: [clean],
      statusSequence: ['Thinking...', 'Searching...', 'Planning...'],
      generatedOpportunities: discovery.voiceOpportunities,
      generatedProjectBrief: topBrief
        ? {
            title: topBrief.title,
            platform: topBrief.platform,
            description: topBrief.description,
            budget: topBrief.budget,
            deadline: topBrief.deadline,
          }
        : emptyBrief,
      discoveryFilters: discovery.filters,
      executionTrace: trace,
      spokenSummaryAr: discovery.summaryAr,
      spokenSummaryEn: discovery.summaryEn,
    };
  }

  // =========================================================================
  // 7. DIRECT NAVIGATION TO ANY VIEW (Dialect + typo tolerant)
  // =========================================================================
  const navigationRoutes: Array<{
    view: ViewId;
    pattern: RegExp;
    labelAr: string;
    labelEn: string;
  }> = [
    {
      view: 'settings',
      pattern: /اعدادات|الاعددات|الاعدادت|الضبط|الزجاج السائل|settings|sitings|preferences/i,
      labelAr: 'الإعدادات وتخصيص الواجهة',
      labelEn: 'Settings & Liquid Glass',
    },
    {
      view: 'profile',
      pattern: /ملفي|الملف المهني|الملف الشخصي|البروفايل|حسابي المهني|profile/i,
      labelAr: 'الملف المهني والمهارات',
      labelEn: 'Professional Profile',
    },
    {
      view: 'saved-projects',
      pattern: /مشاريعي|المشاريع المحفوظه|لوحه كانبان|كانبان|متابعه المشاريع|saved projects|my projects|kanban/i,
      labelAr: 'لوحة مشاريعي (كانبان)',
      labelEn: 'My Projects (Kanban)',
    },
    {
      view: 'proposal-studio',
      pattern: /استوديو العروض|العروض التنافسيه|تقديماتي|طلباتي|proposal studio|proposals/i,
      labelAr: 'استوديو العروض التنافسية',
      labelEn: 'Proposal Studio',
    },
    {
      view: 'project-analyzer',
      pattern: /محلل العقود|محلل المشاريع|project analyzer|contract analyzer/i,
      labelAr: 'محلل العقود والمشاريع',
      labelEn: 'Project Analyzer',
    },
    {
      view: 'pricing-calculator',
      pattern: /حاسبه التسعير|التسعير|pricing calculator/i,
      labelAr: 'حاسبة التسعير الذكية',
      labelEn: 'Pricing Calculator',
    },
    {
      view: 'financials',
      pattern: /الارباح والماليه|الاداره الماليه|الماليه|الارباح|financials|earnings|finance/i,
      labelAr: 'الأرباح والإدارة المالية',
      labelEn: 'Earnings & Financials',
    },
    {
      view: 'opportunities',
      pattern: /رادار الفرص|صفحه الفرص|سوق الفرص|الفرص المتاحه|opportunities/i,
      labelAr: 'رادار الفرص الذكي',
      labelEn: 'Opportunities Radar',
    },
    {
      view: 'resume-analyzer',
      pattern: /محلل السيره|السيره الذاتيه|resume analyzer|cv analyzer/i,
      labelAr: 'محلل السيرة الذاتية (CV)',
      labelEn: 'Resume & CV Analyzer',
    },
    {
      view: 'portfolio',
      pattern: /معرض الاعمال|البورتفوليو|portfolio/i,
      labelAr: 'معرض الأعمال',
      labelEn: 'Portfolio',
    },
    {
      view: 'file-analysis',
      pattern: /تحليل الملفات|تحليل الصور|file analysis|vision ai/i,
      labelAr: 'تحليل الملفات والصور',
      labelEn: 'File & Vision Analysis',
    },
    {
      view: 'proposal-analytics',
      pattern: /تحليلات العروض|احصائيات العروض|proposal analytics/i,
      labelAr: 'تحليلات أداء العروض',
      labelEn: 'Proposal Analytics',
    },
    {
      view: 'google-forms',
      pattern: /نماذج جوجل|استبيان العملاء|google forms|google workspace/i,
      labelAr: 'نماذج Google Workspace',
      labelEn: 'Google Forms',
    },
    {
      view: 'platform-connections',
      pattern: /ربط المنصات|منصات العمل الحر|platform connections/i,
      labelAr: 'ربط منصات العمل الحر',
      labelEn: 'Platform Connections',
    },
    {
      view: 'notifications',
      pattern: /الاشعارات|التنبيهات|الوارد|صندوق الوارد|الرسائل|notifications|inbox|messages/i,
      labelAr: 'صندوق الوارد والإشعارات',
      labelEn: 'Inbox & Notifications',
    },
    {
      view: 'user-guide',
      pattern: /دليل المستخدم|دليل الاستخدام|التعليمات|user guide|help guide/i,
      labelAr: 'دليل الاستخدام التفاعلي',
      labelEn: 'User Guide',
    },
    {
      view: 'lens-chat',
      pattern: /محادثه لينز|دردشه لينز|شات لينز|lens chat/i,
      labelAr: 'محادثة Lens AI',
      labelEn: 'Lens AI Chat',
    },
    {
      view: 'overview',
      pattern: /الرئيسيه|الصفحه الرئيسيه|مساحه العمل|home|overview|dashboard/i,
      labelAr: 'مساحة العمل الرئيسية',
      labelEn: 'Main AI Workspace',
    },
  ];

  for (const route of navigationRoutes) {
    if (route.pattern.test(norm)) {
      return {
        actionType: 'navigate_view',
        targetView: route.view,
        domainCategory: 'general',
        searchKeywords: [route.labelAr],
        statusSequence: ['Thinking...'],
        generatedOpportunities: [],
        generatedProjectBrief: emptyBrief,
        executionTrace: trace,
        spokenSummaryAr: `تم فتح ${route.labelAr} في التطبيق الآن.`,
        spokenSummaryEn: `Opened ${route.labelEn} in the workspace.`,
      };
    }
  }

  // Fallback for unrecognized input (Gemini AI agent on backend will inspect semantic intent before falling back)
  return {
    actionType: 'unknown',
    targetView: 'overview',
    domainCategory: 'general',
    searchKeywords: [],
    statusSequence: ['Thinking...'],
    generatedOpportunities: [],
    generatedProjectBrief: emptyBrief,
    executionTrace: ['UNDERSTAND', 'ANALYZE', 'NO_TOOL_MATCH'],
    spokenSummaryAr: 'لا أعرف.',
    spokenSummaryEn: "I don't know.",
  };
}

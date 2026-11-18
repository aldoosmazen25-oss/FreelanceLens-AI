import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCompetitivePricing,
  calculateProfileCompleteness,
  calculateFinancialSummary,
  calculateLiveSessionEarnings,
  resolveSwipeDirection,
  buildLiquidGlassCssVars,
  DEFAULT_UI_SETTINGS,
  calculateDashboardMetrics,
  resolveMotionTokens,
  validateComposerAttachment,
  formatFileSize,
  resolveVoiceAgentTaskIntent,
  validateRegistrationInput,
  validateOnboardingStep,
  calculateComprehensiveProfileCompleteness,
  buildHonestAIProfileContext,
} from './calculations.ts';

test('calculateCompetitivePricing matches exact specification formulas', () => {
  const result = calculateCompetitivePricing({
    hours: 40,
    rate: 50,
    complexity: 1.5,
    revisions: 2,
    expenses: 100,
    fee: 10,
    profit: 20,
    isRush: false,
  });

  // Base Labor = 40 * 50 = 2000
  assert.equal(result.baseLabor, 2000);
  // Adjusted Labor = 2000 * 1.5 = 3000
  assert.equal(result.adjustedLabor, 3000);
  // Revisions Buffer = 2 * 0.05 * 3000 = 300
  assert.equal(result.revisionsBuffer, 300);
  // Total Cost = 3000 + 300 + 100 + 0 = 3400
  assert.equal(result.totalCost, 3400);
  // Suggested Client Price = Math.round((3400 * 1.2) / 0.9) = Math.round(4080 / 0.9) = 4533
  assert.equal(result.suggestedClientPrice, 4533);
  // Walk-away Price = Math.round(3400 / 0.9) = 3778
  assert.equal(result.walkAwayPrice, 3778);
  // Platform Fee = Math.round(4533 * 0.1) = 453
  assert.equal(result.platformFeeAmount, 453);
  // Net Profit = 4533 - 453 - 100 = 3980
  assert.equal(result.netProfit, 3980);
});

test('calculateCompetitivePricing adds 25% rush fee when isRush is true', () => {
  const result = calculateCompetitivePricing({
    hours: 20,
    rate: 100,
    complexity: 1.0,
    revisions: 0,
    expenses: 0,
    fee: 20,
    profit: 0,
    isRush: true,
  });

  assert.equal(result.baseLabor, 2000);
  assert.equal(result.rushFeeAmount, 500);
  assert.equal(result.totalCost, 2500);
  assert.equal(result.walkAwayPrice, Math.round(2500 / 0.8));
});

test('calculateProfileCompleteness scores complete and partial profiles accurately', () => {
  const fullScore = calculateProfileCompleteness({
    name: 'مازن الدوس',
    title: 'مهندس برمجيات متكامل ومستشار ذكاء اصطناعي',
    bio: 'خبرة أكثر من 8 سنوات في بناء الأنظمة السحابية وتطبيقات الويب المؤسسية.',
    hourlyRate: 75,
    skillsCount: 6,
    portfolioCount: 3,
  });
  assert.equal(fullScore, 100);

  const partialScore = calculateProfileCompleteness({
    name: 'مازن',
    title: '',
    bio: 'مطور',
    hourlyRate: 0,
    skillsCount: 2,
    portfolioCount: 0,
  });
  assert.equal(partialScore, 25);
});

test('calculateFinancialSummary aggregates received, pending, expenses and net cashflow', () => {
  const summary = calculateFinancialSummary([
    { type: 'revenue', amount: 4500, status: 'received' },
    { type: 'revenue', amount: 2200, status: 'pending' },
    { type: 'expense', amount: 350, status: 'received' },
  ]);

  assert.equal(summary.receivedRevenue, 4500);
  assert.equal(summary.pendingMilestones, 2200);
  assert.equal(summary.totalExpenses, 350);
  assert.equal(summary.netCashflow, 4150);
});

test('calculateLiveSessionEarnings computes formatted time and billable USD accurately', () => {
  const halfHour = calculateLiveSessionEarnings(1800, 80);
  assert.equal(halfHour.formattedTime, '30:00');
  assert.equal(halfHour.earnedUsd, 40);

  const overHour = calculateLiveSessionEarnings(3665, 72);
  assert.equal(overHour.formattedTime, '01:01:05');
  assert.equal(overHour.earnedUsd, 73.3);
});

test('resolveSwipeDirection detects gesture direction above threshold', () => {
  assert.equal(resolveSwipeDirection(10, -12, 36), 'none');
  assert.equal(resolveSwipeDirection(80, 15, 36), 'right');
  assert.equal(resolveSwipeDirection(-75, 10, 36), 'left');
  assert.equal(resolveSwipeDirection(10, -65, 36), 'up');
  assert.equal(resolveSwipeDirection(12, 70, 36), 'down');
});

test('buildLiquidGlassCssVars computes CSS variables for custom accent, opacity, blur and corner radius', () => {
  const varsDark = buildLiquidGlassCssVars(
    {
      ...DEFAULT_UI_SETTINGS,
      glassOpacity: 80,
      glassBlur: 60,
      accentPreset: 'cyan',
      cornerRadius: 'modern',
      animationSpeed: 'snappy',
    },
    'dark'
  );
  assert.equal(varsDark['--emerald-glow'], '#38bdf8');
  assert.equal(varsDark['--glass-blur'], '60px');
  assert.equal(varsDark['--ui-radius'], '16px');
  assert.equal(varsDark['--spring-duration'], '140ms');
});

test('calculateDashboardMetrics returns zeroed metrics on empty workspace without fabricated numbers', () => {
  const emptyMetrics = calculateDashboardMetrics({
    projects: [],
    proposals: [],
    financials: [],
  });

  assert.equal(emptyMetrics.totalProjects, 0);
  assert.equal(emptyMetrics.projectsAnalyzed, 0);
  assert.equal(emptyMetrics.proposalsSent, 0);
  assert.equal(emptyMetrics.pendingResponses, 0);
  assert.equal(emptyMetrics.activeProjects, 0);
  assert.equal(emptyMetrics.completedProjects, 0);
  assert.equal(emptyMetrics.recordedEarnings, 0);
  assert.equal(emptyMetrics.proposalResponseRate, 0);
});

test('calculateDashboardMetrics accurately aggregates real projects, proposals, and earnings', () => {
  const populated = calculateDashboardMetrics({
    projects: [
      { status: 'analyzed', analysis: {} },
      { status: 'waiting' },
      { status: 'in_progress' },
      { status: 'completed' },
    ],
    proposals: [
      { status: 'sent' },
      { status: 'replied' },
      { status: 'won' },
      { status: 'sent' },
    ],
    financials: [
      { type: 'revenue', amount: 3200, status: 'received' },
      { type: 'revenue', amount: 1500, status: 'pending' },
    ],
  });

  assert.equal(populated.totalProjects, 4);
  assert.equal(populated.projectsAnalyzed, 4);
  assert.equal(populated.proposalsSent, 4);
  assert.equal(populated.pendingResponses, 1);
  assert.equal(populated.activeProjects, 1);
  assert.equal(populated.completedProjects, 1);
  assert.equal(populated.recordedEarnings, 3200);
  assert.equal(populated.proposalResponseRate, 50);
});

test('resolveMotionTokens respects prefers-reduced-motion and animation speed presets', () => {
  const reduced = resolveMotionTokens('ultra', true);
  assert.equal(reduced.enterYOffsetPx, 0);
  assert.equal(reduced.hoverYOffsetPx, 0);
  assert.equal(reduced.staggerSec, 0);

  const ultra = resolveMotionTokens('ultra', false);
  assert.equal(ultra.pageDurationSec, 0.22);
  assert.equal(ultra.cardHoverDurationSec, 0.18);
  assert.equal(ultra.enterYOffsetPx, 10);
});

test('validateComposerAttachment validates PDF, DOCX, TXT, and images while rejecting unsupported or oversized files', () => {
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(2048), '2.0 KB');

  const pdfCheck = validateComposerAttachment({
    name: 'project-brief.pdf',
    type: 'application/pdf',
    size: 245000,
  });
  assert.equal(pdfCheck.valid, true);
  assert.equal(pdfCheck.category, 'pdf');

  const docxCheck = validateComposerAttachment({
    name: 'client-requirements.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 120000,
  });
  assert.equal(docxCheck.valid, true);
  assert.equal(docxCheck.category, 'docx');

  const badCheck = validateComposerAttachment({
    name: 'archive.exe',
    type: 'application/x-msdownload',
    size: 50000,
  });
  assert.equal(badCheck.valid, false);
  assert.equal(badCheck.category, 'unsupported');

  const oversizedCheck = validateComposerAttachment({
    name: 'huge.pdf',
    type: 'application/pdf',
    size: 12 * 1024 * 1024,
  });
  assert.equal(oversizedCheck.valid, false);
});

test('resolveVoiceAgentTaskIntent detects writing, copywriting, and translation job search commands and generates opportunities', () => {
  const res = resolveVoiceAgentTaskIntent(
    'ابحث لي عن عمل مناسب مثلاً لكتابة أو نسخ أو ترجمة محتوى'
  );
  assert.equal(res.actionType, 'scout_opportunities');
  assert.equal(res.targetView, 'opportunities');
  assert.equal(res.domainCategory, 'writing_translation');
  assert.equal(res.generatedOpportunities.length >= 3, true);
  assert.deepEqual(res.statusSequence, ['Thinking...', 'Searching...', 'Planning...']);
});

test('resolveVoiceAgentTaskIntent routes proposal, pricing, navigation, theme, financials, and unknown commands accurately', () => {
  const propIntent = resolveVoiceAgentTaskIntent('اكتب عرض سعر لمشروع متجر إلكتروني');
  assert.equal(propIntent.actionType, 'generate_proposal');
  assert.equal(propIntent.targetView, 'proposal-studio');

  const priceIntent = resolveVoiceAgentTaskIntent('احسب تسعير مشروع تطبيق جوال');
  assert.equal(priceIntent.actionType, 'open_pricing');
  assert.equal(priceIntent.targetView, 'pricing-calculator');

  const navSettings = resolveVoiceAgentTaskIntent('افتح الإعدادات');
  assert.equal(navSettings.actionType, 'navigate_view');
  assert.equal(navSettings.targetView, 'settings');

  const darkTheme = resolveVoiceAgentTaskIntent('فعل الوضع الليلي');
  assert.equal(darkTheme.actionType, 'set_theme');
  assert.equal(darkTheme.themeMode, 'dark');

  const incomeTx = resolveVoiceAgentTaskIntent('سجل ربح 750 دولار');
  assert.equal(incomeTx.actionType, 'add_financial_record');
  assert.equal(incomeTx.financialRecord?.amount, 750);
  assert.equal(incomeTx.financialRecord?.type, 'revenue');

  const unknownIntent = resolveVoiceAgentTaskIntent('كم درجة الحرارة في طوكيو اليوم؟');
  assert.equal(unknownIntent.actionType, 'unknown');
  assert.equal(unknownIntent.spokenSummaryAr, 'لا أعرف.');
  assert.equal(unknownIntent.spokenSummaryEn, "I don't know.");
});

test('validateRegistrationInput catches invalid email, weak password, mismatched confirmation, and unchecked terms', () => {
  const invalid = validateRegistrationInput({
    fullName: 'أ',
    email: 'invalid-email',
    password: 'short',
    confirmPassword: 'other',
    acceptedTerms: false,
  });
  assert.equal(invalid.valid, false);
  assert.equal(Boolean(invalid.errors.fullName), true);
  assert.equal(Boolean(invalid.errors.email), true);
  assert.equal(Boolean(invalid.errors.password), true);
  assert.equal(Boolean(invalid.errors.confirmPassword), true);
  assert.equal(Boolean(invalid.errors.acceptedTerms), true);

  const valid = validateRegistrationInput({
    fullName: 'سارة المنصور',
    email: 'sara@example.com',
    password: 'StrongPassword9!',
    confirmPassword: 'StrongPassword9!',
    acceptedTerms: true,
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('validateOnboardingStep enforces required fields and supports "No formal education" and "No professional experience yet"', () => {
  // Step 2 with no formal education does not require fieldOfStudy
  const step2NoFormal = validateOnboardingStep(2, {
    education: {
      highestLevel: 'no_formal',
      fieldOfStudy: '',
      graduationStatus: 'self_taught',
    },
  });
  assert.equal(step2NoFormal.valid, true);

  // Step 3 requires 3 skills or honest fewer-than-3-skills flag
  const step3TooFew = validateOnboardingStep(3, {
    skills: [{ id: '1', name: 'React' }],
  });
  assert.equal(step3TooFew.valid, false);

  const step3HonestFewer = validateOnboardingStep(3, {
    skills: [{ id: '1', name: 'React' }],
    fewerThanThreeSkillsReason: 'أنا في بداية مسيرتي المهنية وأتقن هذه المهارة بعمق حالياً',
  });
  assert.equal(step3HonestFewer.valid, true);

  // Step 4 supports "No professional experience yet" (hasWorkExperience === false)
  const step4NoExp = validateOnboardingStep(4, {
    hasWorkExperience: false,
    workExperience: [],
  });
  assert.equal(step4NoExp.valid, true);
});

test('calculateComprehensiveProfileCompleteness and buildHonestAIProfileContext work without fabricating experience', () => {
  const profile = {
    fullName: 'خالد العتيبي',
    professionalHeadline: 'UI/UX Designer',
    professionalCategory: 'Design & Creative',
    specialization: 'Product Design & Design Systems',
    professionalLevel: 'Mid-level',
    country: 'المملكة العربية السعودية',
    preferredLanguage: 'العربية والإنجليزية',
    professionalSummary: 'مصمم واجهات وتجربة مستخدم متخصص في بناء أنظمة التصميم للتطبيقات السحابية.',
    education: {
      highestLevel: 'bachelor',
      fieldOfStudy: 'علوم الحاسب وتفاعل الإنسان مع الحاسوب',
      graduationStatus: 'graduated',
    },
    skills: [
      { id: '1', name: 'Figma', proficiency: 'Expert', yearsOfExperience: 3, isPrimary: true },
      { id: '2', name: 'UI Design', proficiency: 'Advanced', yearsOfExperience: 3 },
      { id: '3', name: 'UX Research', proficiency: 'Intermediate', yearsOfExperience: 2 },
    ],
    hasWorkExperience: false,
    workExperience: [],
    freelancePreferences: {
      preferredCategories: ['Design & Creative'],
      preferredProjectTypes: ['UI/UX Design'],
      preferredIndustries: ['SaaS'],
      preferredComplexity: 'medium',
      preferredCurrency: 'USD ($)',
      weeklyAvailabilityHours: '20-30 ساعة/أسبوع',
      workingArrangement: 'independent',
      platformsOfInterest: ['Upwork'],
      careerGoals: ['بناء عملاء طويلي الأمد'],
    },
  };

  const comp = calculateComprehensiveProfileCompleteness(profile);
  assert.equal(comp.totalPercentage >= 90, true);
  assert.equal(comp.sections.identity, true);
  assert.equal(comp.sections.education, true);
  assert.equal(comp.sections.skills, true);
  assert.equal(comp.sections.experience, true);
  assert.equal(comp.sections.preferences, true);

  const aiContext = buildHonestAIProfileContext(profile);
  assert.equal(aiContext.includes('خالد العتيبي'), true);
  assert.equal(aiContext.includes('Figma (Expert'), true);
  assert.equal(aiContext.includes('لا توجد خبرة عمل مهنية سابقة مسجلة'), true);
});






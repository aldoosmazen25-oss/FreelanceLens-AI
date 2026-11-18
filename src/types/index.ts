export type ViewId =
  | 'overview'
  | 'project-analyzer'
  | 'proposal-studio'
  | 'lens-chat'
  | 'saved-projects'
  | 'opportunities'
  | 'resume-analyzer'
  | 'portfolio'
  | 'file-analysis'
  | 'google-forms'
  | 'pricing-calculator'
  | 'financials'
  | 'proposal-analytics'
  | 'platform-connections'
  | 'profile'
  | 'notifications'
  | 'settings'
  | 'user-guide';

export type ProjectStatus =
  | 'new'
  | 'analyzed'
  | 'proposed'
  | 'waiting'
  | 'in_progress'
  | 'completed'
  | 'archived';

export interface ProjectRisk {
  title: string;
  severity: 'high' | 'medium' | 'low' | string;
  description: string;
}

export interface ProjectAnalysisResult {
  executiveSummary: string;
  clientGoal: string;
  businessProblem: string;
  deliverables: string[];
  mandatorySkills: string[];
  preferredSkills: string[];
  toolsAndStack: string[];
  explicitBudget: string;
  explicitDeadline: string;
  complexity: string;
  risksAndRedFlags: ProjectRisk[];
  clientClarifications: string[];
  matchScore: number;
  strongMatches: string[];
  missingSkills: string[];
  recommendedNextSteps: string[];
  modelMode?: string;
}

export interface SavedProject {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  platform: 'Upwork' | 'Fiverr Pro' | 'Freelancer.com' | 'مشروع مباشر' | string;
  budget: string;
  deadline: string;
  matchScore: number;
  status: ProjectStatus;
  createdAt: string;
  analysis?: ProjectAnalysisResult;
}

export interface OpportunityItem {
  id: string;
  title: string;
  description: string;
  platform: 'Upwork' | 'Fiverr Pro' | 'Freelancer.com' | 'Mostaql' | 'Khamsat' | 'مشروع مباشر' | string;
  budget: string;
  budgetMinUsd?: number;
  budgetMaxUsd?: number;
  category?: 'design_ui' | 'software_ai' | 'writing_translation' | 'marketing_seo' | 'general' | string;
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  postedAt: string;
  postedHoursAgo?: number;
  matchScore: number;
  matchReasons?: string[];
  skills: string[];
  clientRating: number;
  saved?: boolean;
}

export interface ProposalRecord {
  id: string;
  ownerId: string;
  projectId: string;
  projectTitle: string;
  tone: string;
  proposedBudget: string;
  duration: string;
  hook: string;
  problemDiagnosis: string;
  proposedRoadmap: string[];
  outOfScope: string;
  callToAction: string;
  fullText: string;
  persuasionScore: number;
  status: 'draft' | 'sent' | 'replied' | 'won' | 'lost';
  createdAt: string;
  modelMode?: string;
}

export interface FinancialTransaction {
  id: string;
  ownerId: string;
  title: string;
  type: 'revenue' | 'expense';
  amount: number;
  date: string;
  status: 'received' | 'pending';
  projectId?: string;
  projectTitle?: string;
}

export interface ChatMessageAgentMeta {
  actionType?: string;
  executed?: boolean;
  verified?: boolean;
  requiresConfirmation?: boolean;
  targetView?: ViewId;
  pendingIntent?: unknown;
  rawQuery?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelMode?: string;
  agentMeta?: ChatMessageAgentMeta;
}

export interface ChatSession {
  id: string;
  ownerId: string;
  title: string;
  linkedProjectId?: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface VoiceTurn {
  id: string;
  userText: string;
  assistantText: string;
  audioBase64?: string | null;
  timestamp: string;
  modelMode?: string;
}

export interface VoiceSession {
  id: string;
  title: string;
  language: string;
  voiceName: string;
  turns: VoiceTurn[];
  updatedAt: string;
}

export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface SkillItem {
  id: string;
  name: string;
  level: 'خبير' | 'متقدم' | 'متوسط' | 'مبتدئ';
  proficiency?: SkillProficiency;
  category?: string;
  yearsOfExperience?: number;
  isPrimary?: boolean;
  hasEvidence?: boolean;
  verified?: boolean;
}

export interface EducationData {
  highestLevel:
    | 'no_formal'
    | 'high_school'
    | 'vocational'
    | 'diploma'
    | 'bachelor'
    | 'master'
    | 'doctorate'
    | 'other'
    | string;
  fieldOfStudy: string;
  graduationStatus: 'graduated' | 'studying' | 'self_taught' | 'other' | string;
  institutionName?: string;
  graduationYear?: string;
  relevantCourses?: string;
  professionalLicenses?: string;
}

export interface WorkExperienceEntry {
  id: string;
  jobTitle: string;
  experienceType:
    | 'freelance'
    | 'full_time'
    | 'part_time'
    | 'internship'
    | 'volunteer'
    | 'personal_project'
    | 'academic_project'
    | string;
  organizationOrClient?: string;
  industry?: string;
  startDate: string;
  endDate: string;
  currentlyWorking?: boolean;
  responsibilitiesAndAchievements: string;
  skillsOrToolsUsed: string[];
  projectLink?: string;
}

export interface CertificateEntry {
  id: string;
  name: string;
  issuingOrganization: string;
  completionDate: string;
  credentialId?: string;
  credentialUrl?: string;
  relevantSkills: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  impactMetric: string;
  techStack: string[];
  link?: string;
  completedDate: string;
  rolePerformed?: string;
  projectType?: 'professional' | 'personal' | 'academic' | 'demonstration' | string;
}

export interface FreelancePreferences {
  preferredCategories: string[];
  preferredProjectTypes: string[];
  preferredIndustries: string[];
  preferredComplexity: 'small' | 'medium' | 'large' | 'long_term' | 'any' | string;
  minBudget?: number;
  maxBudget?: number;
  preferredDuration?: string;
  preferredCurrency: string;
  weeklyAvailabilityHours: string;
  workingArrangement: 'independent' | 'team' | 'both' | string;
  platformsOfInterest: string[];
  careerGoals: string[];
}

export interface UserProfile {
  uid: string;
  name: string;
  fullName?: string;
  email: string;
  emailVerified?: boolean;
  title: string;
  professionalHeadline?: string;
  professionalCategory?: string;
  specialization?: string;
  professionalLevel?: 'Beginner' | 'Junior' | 'Mid-level' | 'Senior' | 'Expert' | 'Lead / Consultant' | string;
  country?: string;
  preferredLanguage?: string;
  bio: string;
  professionalSummary?: string;
  hourlyRate: number;
  currency: string;
  availability: string;
  workStatus?: 'work' | 'sleep';
  avatarUrl?: string;
  education?: EducationData;
  skills: SkillItem[];
  fewerThanThreeSkillsReason?: string;
  hasWorkExperience?: boolean;
  workExperience?: WorkExperienceEntry[];
  certificates?: CertificateEntry[];
  portfolio: PortfolioItem[];
  freelancePreferences?: FreelancePreferences;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  profileCompletion?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  ownerId: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'opportunity' | 'info';
  read: boolean;
  createdAt: string;
  targetView?: ViewId;
}

export interface GoogleFormRecord {
  formId: string;
  title: string;
  templateType: string;
  responderUri: string;
  editUri: string;
  createdAt: string;
  responsesCount: number;
}

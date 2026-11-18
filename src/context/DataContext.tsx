import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  SavedProject,
  OpportunityItem,
  ProposalRecord,
  FinancialTransaction,
  ChatSession,
  VoiceSession,
  UserProfile,
  NotificationItem,
  GoogleFormRecord,
  ProjectStatus,
  SkillItem,
} from '../types';

import {
  calculateComprehensiveProfileCompleteness,
  FIREWORK_MARKETPLACE_CATALOG,
} from '../utils/calculations';

export function buildEmptyUserProfile(
  uid = '',
  name = '',
  email = ''
): UserProfile {
  const isAuto = uid === 'autostart-verified-user';
  return {
    uid: uid || 'unauthenticated',
    name: name || '',
    fullName: name || '',
    email: email || '',
    emailVerified: isAuto,
    title: isAuto ? 'Full-Stack Developer & AI Engineer' : '',
    professionalHeadline: isAuto ? 'Full-Stack Developer & AI Engineer' : '',
    professionalCategory: isAuto ? 'Software Development & Engineering' : '',
    specialization: isAuto ? 'React, TypeScript & AI Systems' : '',
    professionalLevel: isAuto ? 'Senior' : '',
    country: isAuto ? 'United States' : '',
    preferredLanguage: 'العربية والإنجليزية',
    bio: isAuto
      ? 'Full-Stack Software Engineer specializing in modern web applications and AI integrations.'
      : '',
    professionalSummary: isAuto
      ? 'Full-Stack Software Engineer specializing in modern web applications and AI integrations.'
      : '',
    hourlyRate: 50,
    currency: 'USD',
    availability: 'متاح للعمل الحر',
    workStatus: 'work',
    education: {
      highestLevel: isAuto ? 'bachelor' : '',
      fieldOfStudy: isAuto ? 'Computer Science' : '',
      graduationStatus: isAuto ? 'graduated' : '',
      institutionName: '',
      graduationYear: '',
      relevantCourses: '',
      professionalLicenses: '',
    },
    skills: isAuto
      ? [
          {
            id: 'sk-auto-1',
            name: 'TypeScript',
            level: 'خبير',
            proficiency: 'Expert',
            yearsOfExperience: 5,
            isPrimary: true,
            verified: true,
          },
          {
            id: 'sk-auto-2',
            name: 'React',
            level: 'خبير',
            proficiency: 'Expert',
            yearsOfExperience: 5,
            isPrimary: true,
            verified: true,
          },
          {
            id: 'sk-auto-3',
            name: 'Node.js',
            level: 'متقدم',
            proficiency: 'Advanced',
            yearsOfExperience: 4,
            isPrimary: false,
            verified: true,
          },
        ]
      : [],
    fewerThanThreeSkillsReason: '',
    hasWorkExperience: isAuto ? false : undefined,
    workExperience: [],
    certificates: [],
    portfolio: [],
    freelancePreferences: {
      preferredCategories: isAuto ? ['Software Development & Engineering'] : [],
      preferredProjectTypes: isAuto ? ['Full-Stack Web Apps', 'AI Integration'] : [],
      preferredIndustries: [],
      preferredComplexity: 'medium',
      preferredCurrency: 'USD ($)',
      weeklyAvailabilityHours: '20 - 30 hrs/week',
      workingArrangement: 'independent',
      platformsOfInterest: ['Upwork', 'Mostaql', 'Direct Clients'],
      careerGoals: [],
    },
    onboardingCompleted: isAuto,
    onboardingStep: 1,
    profileCompletion: isAuto ? 90 : 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const WELCOME_CHAT_SESSION: ChatSession = {
  id: 'chat-welcome-lens',
  ownerId: 'workspace_user',
  title: 'مرحباً بك في لينز إيه آي — مستشارك الذكي',
  updatedAt: 'الآن',
  messages: [
    {
      id: 'msg-welcome-1',
      role: 'assistant',
      text: 'مرحباً بك! أنا لينز إيه آي (Lens AI)، مساعدك الاستشاري الذكي بكامل خبراتي في هندسة العقود، تسعير المشاريع، كشف مخاطر تمدد النطاق (Scope Creep)، وصياغة العروض التنافسية الفائزة.\n\nيعتمد تحليلي مباشرة على ملفك المهني الحقيقي الموثق في حسابك دون اختلاق أي خبرات غير موجودة. يمكنك البدء بتحليل أول مشروع حقيقي لك، أو التحدث معي صوتياً أو نصياً في أي وقت!',
      timestamp: 'الآن',
      modelMode: 'استدلال وتفكير عميق',
    },
  ],
};

interface DataContextType {
  userProfile: UserProfile;
  updateUserProfile: (updated: Partial<UserProfile>) => Promise<void>;
  setWorkStatus: (status: 'work' | 'sleep') => Promise<void>;
  addSkillsToProfile: (newSkills: Array<{ name: string; level?: string }>) => Promise<void>;
  removeSkillFromProfile: (skillName: string) => Promise<void>;
  projects: SavedProject[];
  saveProject: (proj: Omit<SavedProject, 'id' | 'ownerId' | 'createdAt'> & { id?: string }) => Promise<SavedProject>;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  opportunities: OpportunityItem[];
  setOpportunities: React.Dispatch<React.SetStateAction<OpportunityItem[]>>;
  toggleSaveOpportunity: (opp: OpportunityItem) => Promise<void>;
  proposals: ProposalRecord[];
  saveProposal: (prop: Omit<ProposalRecord, 'id' | 'ownerId' | 'createdAt'>) => Promise<ProposalRecord>;
  financials: FinancialTransaction[];
  addFinancialTransaction: (tx: Omit<FinancialTransaction, 'id' | 'ownerId'>) => Promise<void>;
  deleteFinancialTransaction: (txId: string) => Promise<void>;
  chatSessions: ChatSession[];
  saveChatSession: (session: ChatSession) => Promise<void>;
  deleteChatSession: (sessionId: string) => Promise<void>;
  voiceSessions: VoiceSession[];
  saveVoiceSession: (session: VoiceSession) => Promise<void>;
  deleteVoiceSession: (sessionId: string) => Promise<void>;
  clearVoiceSessions: () => Promise<void>;
  notifications: NotificationItem[];
  activeToasts: NotificationItem[];
  dismissToast: (id: string) => void;
  markAllNotificationsRead: () => Promise<void>;
  clearOldNotifications: () => Promise<void>;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'ownerId' | 'read' | 'createdAt'>) => void;
  googleForms: GoogleFormRecord[];
  addGoogleFormRecord: (record: GoogleFormRecord) => void;
  selectedProjectForAction: SavedProject | null;
  setSelectedProjectForAction: (proj: SavedProject | null) => void;
  exportFullBackupJson: () => string;
  resetAllWorkspaceData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isFirestoreEligible } = useAuth();
  const activeUid = user?.uid || 'unauthenticated';

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (!user?.uid) {
      return buildEmptyUserProfile('', '', '');
    }
    const saved = loadLocal<UserProfile | null>(`fl_user_profile_${user.uid}`, null);
    if (saved && saved.uid === user.uid) {
      return saved;
    }
    return buildEmptyUserProfile(user.uid, user.name, user.email);
  });

  const [projects, setProjects] = useState<SavedProject[]>(() =>
    user?.uid ? loadLocal(`fl_projects_${user.uid}`, []) : []
  );
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(() =>
    user?.uid
      ? loadLocal(`fl_opportunities_${user.uid}`, FIREWORK_MARKETPLACE_CATALOG)
      : FIREWORK_MARKETPLACE_CATALOG
  );
  const [proposals, setProposals] = useState<ProposalRecord[]>(() =>
    user?.uid ? loadLocal(`fl_proposals_${user.uid}`, []) : []
  );
  const [financials, setFinancials] = useState<FinancialTransaction[]>(() =>
    user?.uid ? loadLocal(`fl_financials_${user.uid}`, []) : []
  );
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() =>
    user?.uid ? loadLocal(`fl_chat_${user.uid}`, [WELCOME_CHAT_SESSION]) : [WELCOME_CHAT_SESSION]
  );
  const [voiceSessions, setVoiceSessions] = useState<VoiceSession[]>(() =>
    user?.uid ? loadLocal(`fl_voice_${user.uid}`, []) : []
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    user?.uid ? loadLocal(`fl_notifications_${user.uid}`, []) : []
  );
  const [activeToasts, setActiveToasts] = useState<NotificationItem[]>([]);
  const [googleForms, setGoogleForms] = useState<GoogleFormRecord[]>(() =>
    user?.uid ? loadLocal(`fl_google_forms_${user.uid}`, []) : []
  );
  const [selectedProjectForAction, setSelectedProjectForAction] = useState<SavedProject | null>(
    null
  );

  // Reload isolated per-user data whenever user.uid changes
  useEffect(() => {
    if (!user?.uid) {
      setUserProfile(buildEmptyUserProfile('', '', ''));
      setProjects([]);
      setOpportunities(FIREWORK_MARKETPLACE_CATALOG);
      setProposals([]);
      setFinancials([]);
      setChatSessions([WELCOME_CHAT_SESSION]);
      setVoiceSessions([]);
      setNotifications([]);
      return;
    }

    const savedProfile = loadLocal<UserProfile | null>(`fl_user_profile_${user.uid}`, null);
    if (savedProfile && savedProfile.uid === user.uid) {
      setUserProfile({
        ...savedProfile,
        name: savedProfile.name || savedProfile.fullName || user.name,
        fullName: savedProfile.fullName || savedProfile.name || user.name,
        email: savedProfile.email || user.email,
        workStatus: savedProfile.workStatus || 'work',
      });
    } else {
      const fresh = buildEmptyUserProfile(user.uid, user.name, user.email);
      setUserProfile(fresh);
      localStorage.setItem(`fl_user_profile_${user.uid}`, JSON.stringify(fresh));
    }

    setProjects(loadLocal(`fl_projects_${user.uid}`, []));
    setOpportunities(
      loadLocal(`fl_opportunities_${user.uid}`, FIREWORK_MARKETPLACE_CATALOG)
    );
    setProposals(loadLocal(`fl_proposals_${user.uid}`, []));
    setFinancials(loadLocal(`fl_financials_${user.uid}`, []));
    setChatSessions(loadLocal(`fl_chat_${user.uid}`, [WELCOME_CHAT_SESSION]));
    setVoiceSessions(loadLocal(`fl_voice_${user.uid}`, []));
    setNotifications(loadLocal(`fl_notifications_${user.uid}`, []));
    setGoogleForms(loadLocal(`fl_google_forms_${user.uid}`, []));
  }, [user?.uid, user?.name, user?.email]);

  // Persist to per-user localStorage keys
  useEffect(() => {
    if (!user?.uid || userProfile.uid !== user.uid) return;
    localStorage.setItem(`fl_user_profile_${user.uid}`, JSON.stringify(userProfile));
  }, [userProfile, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    localStorage.setItem(`fl_projects_${user.uid}`, JSON.stringify(projects));
  }, [projects, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    localStorage.setItem(`fl_opportunities_${user.uid}`, JSON.stringify(opportunities));
  }, [opportunities, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    localStorage.setItem(`fl_proposals_${user.uid}`, JSON.stringify(proposals));
  }, [proposals, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    localStorage.setItem(`fl_financials_${user.uid}`, JSON.stringify(financials));
  }, [financials, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    localStorage.setItem(`fl_chat_${user.uid}`, JSON.stringify(chatSessions));
  }, [chatSessions, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    localStorage.setItem(`fl_voice_${user.uid}`, JSON.stringify(voiceSessions));
  }, [voiceSessions, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    localStorage.setItem(`fl_notifications_${user.uid}`, JSON.stringify(notifications));
  }, [notifications, user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    localStorage.setItem(`fl_google_forms_${user.uid}`, JSON.stringify(googleForms));
  }, [googleForms, user?.uid]);

  // Firestore real-time synchronization ONLY when isFirestoreEligible is strictly true
  useEffect(() => {
    if (!isFirestoreEligible || !user?.uid) return;

    const uid = user.uid;
    const unsubs: Array<() => void> = [];

    try {
      const userDocRef = doc(db, 'users', uid);
      unsubs.push(
        onSnapshot(
          userDocRef,
          (snap) => {
            if (snap.exists()) {
              const cloudData = snap.data() as Partial<UserProfile>;
              setUserProfile((prev) => {
                const merged: UserProfile = {
                  ...prev,
                  ...cloudData,
                  uid,
                };
                localStorage.setItem(`fl_user_profile_${uid}`, JSON.stringify(merged));
                return merged;
              });
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${uid}`);
          }
        )
      );

      const projectsPath = `users/${uid}/projects`;
      const qProjects = query(collection(db, projectsPath), where('ownerId', '==', uid));
      unsubs.push(
        onSnapshot(
          qProjects,
          (snap) => {
            const items = snap.docs.map((d) => d.data() as SavedProject);
            setProjects(items);
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, projectsPath);
          }
        )
      );

      const proposalsPath = `users/${uid}/proposals`;
      const qProposals = query(collection(db, proposalsPath), where('ownerId', '==', uid));
      unsubs.push(
        onSnapshot(
          qProposals,
          (snap) => {
            const items = snap.docs.map((d) => d.data() as ProposalRecord);
            setProposals(items);
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, proposalsPath);
          }
        )
      );

      const financialsPath = `users/${uid}/financials`;
      const qFinancials = query(collection(db, financialsPath), where('ownerId', '==', uid));
      unsubs.push(
        onSnapshot(
          qFinancials,
          (snap) => {
            const items = snap.docs.map((d) => d.data() as FinancialTransaction);
            setFinancials(items);
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, financialsPath);
          }
        )
      );
    } catch (err) {
      console.warn('Firestore subscription skipped safely:', err);
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [isFirestoreEligible, user?.uid]);

  const updateUserProfile = async (updated: Partial<UserProfile>) => {
    const uid = user?.uid || userProfile.uid || activeUid;
    const syncedName =
      updated.fullName !== undefined
        ? updated.fullName
        : updated.name !== undefined
        ? updated.name
        : userProfile.fullName || userProfile.name;

    const syncedTitle =
      updated.professionalHeadline !== undefined
        ? updated.professionalHeadline
        : updated.title !== undefined
        ? updated.title
        : userProfile.professionalHeadline || userProfile.title;

    const syncedBio =
      updated.professionalSummary !== undefined
        ? updated.professionalSummary
        : updated.bio !== undefined
        ? updated.bio
        : userProfile.professionalSummary || userProfile.bio;

    const draftProfile: UserProfile = {
      ...userProfile,
      ...updated,
      uid,
      name: syncedName,
      fullName: syncedName,
      title: syncedTitle,
      professionalHeadline: syncedTitle,
      bio: syncedBio,
      professionalSummary: syncedBio,
      updatedAt: new Date().toISOString(),
    };

    const completeness = calculateComprehensiveProfileCompleteness(draftProfile);
    const nextProfile: UserProfile = {
      ...draftProfile,
      profileCompletion: completeness.totalPercentage,
    };

    setUserProfile(nextProfile);
    if (uid && uid !== 'unauthenticated') {
      localStorage.setItem(`fl_user_profile_${uid}`, JSON.stringify(nextProfile));
    }

    if (isFirestoreEligible && user?.uid && nextProfile.name.trim()) {
      const path = `users/${user.uid}`;
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            uid: user.uid,
            name: nextProfile.name.slice(0, 120),
            fullName: nextProfile.name.slice(0, 120),
            email: nextProfile.email || user.email || '',
            title: (nextProfile.title || '').slice(0, 160),
            professionalHeadline: (nextProfile.professionalHeadline || '').slice(0, 160),
            professionalCategory: nextProfile.professionalCategory || '',
            specialization: nextProfile.specialization || '',
            professionalLevel: nextProfile.professionalLevel || '',
            country: nextProfile.country || '',
            preferredLanguage: nextProfile.preferredLanguage || '',
            bio: (nextProfile.bio || '').slice(0, 2000),
            professionalSummary: (nextProfile.professionalSummary || '').slice(0, 2000),
            hourlyRate: Number(nextProfile.hourlyRate) || 50,
            currency: (nextProfile.currency || 'USD').slice(0, 10),
            availability: (nextProfile.availability || '').slice(0, 60),
            workStatus: nextProfile.workStatus || 'work',
            education: nextProfile.education || null,
            skills: nextProfile.skills || [],
            fewerThanThreeSkillsReason: nextProfile.fewerThanThreeSkillsReason || '',
            hasWorkExperience: nextProfile.hasWorkExperience ?? null,
            workExperience: nextProfile.workExperience || [],
            certificates: nextProfile.certificates || [],
            portfolio: nextProfile.portfolio || [],
            freelancePreferences: nextProfile.freelancePreferences || null,
            onboardingCompleted: Boolean(nextProfile.onboardingCompleted),
            onboardingStep: Number(nextProfile.onboardingStep) || 1,
            profileCompletion: Number(nextProfile.profileCompletion) || 0,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const setWorkStatus = async (status: 'work' | 'sleep') => {
    await updateUserProfile({
      workStatus: status,
      availability:
        status === 'work'
          ? 'متاح للعمل الحر'
          : 'وضع الهدوء (Sleep) — غير متاح لاستقبال أعمال حالياً',
    });
  };

  const addSkillsToProfile = async (
    newSkills: Array<{ name: string; level?: string }>
  ) => {
    const existingNames = new Set(
      userProfile.skills.map((s) => s.name.toLowerCase())
    );
    const additions: SkillItem[] = [];
    for (const sk of newSkills) {
      if (!existingNames.has(sk.name.toLowerCase())) {
        existingNames.add(sk.name.toLowerCase());
        additions.push({
          id: `sk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: sk.name,
          level:
            sk.level === 'خبير' ||
            sk.level === 'متقدم' ||
            sk.level === 'متوسط' ||
            sk.level === 'مبتدئ'
              ? sk.level
              : 'متقدم',
          verified: true,
        });
      }
    }
    if (additions.length > 0) {
      await updateUserProfile({
        skills: [...userProfile.skills, ...additions],
      });
    }
  };

  const removeSkillFromProfile = async (skillName: string) => {
    const normalized = skillName.trim().toLowerCase();
    if (!normalized) return;
    const filteredSkills = userProfile.skills.filter(
      (s) => !s.name.toLowerCase().includes(normalized)
    );
    if (filteredSkills.length !== userProfile.skills.length) {
      await updateUserProfile({
        skills: filteredSkills,
      });
    }
  };

  const saveProject = async (
    proj: Omit<SavedProject, 'id' | 'ownerId' | 'createdAt'> & { id?: string }
  ): Promise<SavedProject> => {
    const id = proj.id || `proj-${Date.now()}`;
    const ownerId = user?.uid || userProfile.uid || 'real_freelancer_01';
    const record: SavedProject = {
      ...proj,
      id,
      ownerId,
      title: proj.title.slice(0, 240),
      description: (proj.description || '').slice(0, 8000),
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setProjects((prev) => {
      const exists = prev.some((p) => p.id === id);
      if (exists) {
        return prev.map((p) => (p.id === id ? record : p));
      }
      return [record, ...prev];
    });

    if (isFirestoreEligible && user?.uid) {
      const path = `users/${user.uid}/projects/${id}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/projects`, id), {
          id: record.id,
          ownerId: user.uid,
          title: record.title,
          description: record.description,
          platform: record.platform.slice(0, 60),
          budget: record.budget.slice(0, 120),
          deadline: record.deadline.slice(0, 120),
          matchScore: Number(record.matchScore) || 85,
          status: record.status,
          createdAt: record.createdAt,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    return record;
  };

  const updateProjectStatus = async (projectId: string, status: ProjectStatus) => {
    let targetProj: SavedProject | undefined;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          targetProj = { ...p, status };
          return targetProj;
        }
        return p;
      })
    );

    if (isFirestoreEligible && user?.uid && targetProj) {
      const path = `users/${user.uid}/projects/${projectId}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/projects`, projectId), {
          id: targetProj.id,
          ownerId: user.uid,
          title: targetProj.title.slice(0, 240),
          description: (targetProj.description || '').slice(0, 8000),
          platform: targetProj.platform.slice(0, 60),
          budget: targetProj.budget.slice(0, 120),
          deadline: targetProj.deadline.slice(0, 120),
          matchScore: Number(targetProj.matchScore) || 85,
          status,
          createdAt: targetProj.createdAt,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  const deleteProject = async (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (isFirestoreEligible && user?.uid) {
      const path = `users/${user.uid}/projects/${projectId}`;
      try {
        await deleteDoc(doc(db, `users/${user.uid}/projects`, projectId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const toggleSaveOpportunity = async (opp: OpportunityItem) => {
    setOpportunities((prev) =>
      prev.map((item) =>
        item.id === opp.id ? { ...item, saved: !item.saved } : item
      )
    );
    const alreadyInProjects = projects.some((p) => p.title === opp.title);
    if (!alreadyInProjects) {
      await saveProject({
        title: opp.title,
        description: opp.description,
        platform: opp.platform,
        budget: opp.budget,
        deadline: '3 أسابيع',
        matchScore: opp.matchScore,
        status: 'new',
      });
    }
  };

  const saveProposal = async (
    prop: Omit<ProposalRecord, 'id' | 'ownerId' | 'createdAt'>
  ): Promise<ProposalRecord> => {
    const id = `prop-${Date.now()}`;
    const ownerId = user?.uid || userProfile.uid || 'real_freelancer_01';
    const record: ProposalRecord = {
      ...prop,
      id,
      ownerId,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setProposals((prev) => [record, ...prev]);

    if (isFirestoreEligible && user?.uid) {
      const path = `users/${user.uid}/proposals/${id}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/proposals`, id), {
          id: record.id,
          ownerId: user.uid,
          projectId: (record.projectId || '').slice(0, 128),
          projectTitle: record.projectTitle.slice(0, 240),
          tone: record.tone.slice(0, 60),
          proposedBudget: record.proposedBudget.slice(0, 80),
          duration: record.duration.slice(0, 80),
          fullText: record.fullText.slice(0, 10000),
          status: record.status,
          createdAt: record.createdAt,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
    return record;
  };

  const addFinancialTransaction = async (
    tx: Omit<FinancialTransaction, 'id' | 'ownerId'>
  ) => {
    const id = `tx-${Date.now()}`;
    const ownerId = user?.uid || userProfile.uid || 'real_freelancer_01';
    const record: FinancialTransaction = {
      ...tx,
      id,
      ownerId,
      amount: Math.max(0, Number(tx.amount) || 0),
    };
    setFinancials((prev) => [record, ...prev]);

    if (isFirestoreEligible && user?.uid) {
      const path = `users/${user.uid}/financials/${id}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/financials`, id), {
          id: record.id,
          ownerId: user.uid,
          title: record.title.slice(0, 200),
          type: record.type,
          amount: record.amount,
          date: record.date.slice(0, 40),
          status: record.status,
          projectId: (record.projectId || '').slice(0, 128),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
  };

  const deleteFinancialTransaction = async (txId: string) => {
    setFinancials((prev) => prev.filter((t) => t.id !== txId));
    if (isFirestoreEligible && user?.uid) {
      const path = `users/${user.uid}/financials/${txId}`;
      try {
        await deleteDoc(doc(db, `users/${user.uid}/financials`, txId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const saveChatSession = async (session: ChatSession) => {
    setChatSessions((prev) => {
      const exists = prev.some((s) => s.id === session.id);
      if (exists) {
        return prev.map((s) => (s.id === session.id ? session : s));
      }
      return [session, ...prev];
    });

    if (isFirestoreEligible && user?.uid) {
      const path = `users/${user.uid}/chatSessions/${session.id}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/chatSessions`, session.id), {
          id: session.id,
          ownerId: user.uid,
          title: (session.title || 'محادثة مع لينز إيه آي').slice(0, 200),
          updatedAt: session.updatedAt.slice(0, 60),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const deleteChatSession = async (sessionId: string) => {
    setChatSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      return remaining.length > 0 ? remaining : [WELCOME_CHAT_SESSION];
    });
    if (isFirestoreEligible && user?.uid) {
      const path = `users/${user.uid}/chatSessions/${sessionId}`;
      try {
        await deleteDoc(doc(db, `users/${user.uid}/chatSessions`, sessionId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const saveVoiceSession = async (session: VoiceSession) => {
    setVoiceSessions((prev) => {
      const exists = prev.some((s) => s.id === session.id);
      if (exists) {
        return prev.map((s) => (s.id === session.id ? session : s));
      }
      return [session, ...prev];
    });

    if (isFirestoreEligible && user?.uid) {
      const path = `users/${user.uid}/voiceSessions/${session.id}`;
      try {
        await setDoc(doc(db, `users/${user.uid}/voiceSessions`, session.id), {
          id: session.id,
          ownerId: user.uid,
          title: (session.title || 'محادثة صوتية مع لينز إيه آي').slice(0, 200),
          language: (session.language || 'ar').slice(0, 20),
          voiceName: (session.voiceName || 'Kore').slice(0, 40),
          updatedAt: session.updatedAt.slice(0, 60),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const deleteVoiceSession = async (sessionId: string) => {
    setVoiceSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (isFirestoreEligible && user?.uid) {
      const path = `users/${user.uid}/voiceSessions/${sessionId}`;
      try {
        await deleteDoc(doc(db, `users/${user.uid}/voiceSessions`, sessionId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const clearVoiceSessions = async () => {
    setVoiceSessions([]);
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearOldNotifications = async () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  };

  const dismissToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addNotification = (
    notif: Omit<NotificationItem, 'id' | 'ownerId' | 'read' | 'createdAt'>
  ) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ownerId: user?.uid || userProfile.uid || 'real_freelancer_01',
      read: false,
      createdAt: 'الآن',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToasts((prev) => [newNotif, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setActiveToasts((prev) => prev.filter((t) => t.id !== newNotif.id));
    }, 4500);
  };

  const addGoogleFormRecord = (record: GoogleFormRecord) => {
    setGoogleForms((prev) => [record, ...prev]);
  };

  const resetAllWorkspaceData = () => {
    setProjects([]);
    setProposals([]);
    setFinancials([]);
    setOpportunities([]);
    setVoiceSessions([]);
    setChatSessions([WELCOME_CHAT_SESSION]);
    setNotifications([]);
    setActiveToasts([]);
    setGoogleForms([]);
  };

  const exportFullBackupJson = () => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        platform: 'Firework AI',
        assistant: 'Lens AI',
        userProfile,
        projects,
        proposals,
        financials,
        chatSessions,
        voiceSessions,
        googleForms,
      },
      null,
      2
    );
  };

  return (
    <DataContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        setWorkStatus,
        addSkillsToProfile,
        removeSkillFromProfile,
        projects,
        saveProject,
        updateProjectStatus,
        deleteProject,
        opportunities,
        setOpportunities,
        toggleSaveOpportunity,
        proposals,
        saveProposal,
        financials,
        addFinancialTransaction,
        deleteFinancialTransaction,
        chatSessions,
        saveChatSession,
        deleteChatSession,
        voiceSessions,
        saveVoiceSession,
        deleteVoiceSession,
        clearVoiceSessions,
        notifications,
        activeToasts,
        dismissToast,
        markAllNotificationsRead,
        clearOldNotifications,
        addNotification,
        googleForms,
        addGoogleFormRecord,
        selectedProjectForAction,
        setSelectedProjectForAction,
        exportFullBackupJson,
        resetAllWorkspaceData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

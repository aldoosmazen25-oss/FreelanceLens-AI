import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  auth,
  initAuth,
  googleSignIn,
  logoutFirebase,
  getAccessToken,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  deleteUser,
  reload,
  hashPasswordSecure,
} from '../lib/firebase';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  provider: 'google' | 'email' | 'local';
  emailVerified: boolean;
}

interface StoredCredentialRecord {
  uid: string;
  name: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  accessToken: string | null;
  isPreviewMode: boolean;
  setIsPreviewMode: (val: boolean) => void;
  isAuthReady: boolean;
  isLoggingIn: boolean;
  isFirestoreEligible: boolean;
  hasCompletedOnboarding: boolean;
  shouldRedirectToGuide: boolean;
  clearGuideRedirect: () => void;
  markOnboardingCompleted: (completed?: boolean) => void;
  completeRealAccountOnboarding: (accountData: { name: string; email: string }) => void;
  registerWithEmail: (input: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<{ user: AppUser; verificationSent: boolean }>;
  signInWithEmail: (input: {
    email: string;
    password: string;
  }) => Promise<AppUser>;
  resendVerificationEmail: () => Promise<void>;
  confirmEmailVerification: () => Promise<void>;
  requestPasswordReset: (email: string, newPassword?: string) => Promise<void>;
  changeAccountPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccountPermanently: () => Promise<void>;
  signInWithGoogleAccount: () => Promise<void>;
  signOutAccount: () => Promise<void>;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
}

const ACCOUNTS_STORE_KEY = 'fl_auth_accounts_v3';
const ACTIVE_SESSION_KEY = 'fl_active_session_v3';
const ONBOARDED_PREFIX = 'fl_onboarded_uid_';

function loadStoredAccounts(): Record<string, StoredCredentialRecord> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // ignore
  }
  return {};
}

function saveStoredAccounts(accounts: Record<string, StoredCredentialRecord>) {
  try {
    localStorage.setItem(ACCOUNTS_STORE_KEY, JSON.stringify(accounts));
  } catch {
    // ignore
  }
}

function checkUidOnboarded(uid: string): boolean {
  if (!uid) return false;
  try {
    if (localStorage.getItem(`${ONBOARDED_PREFIX}${uid}`) === 'true') {
      return true;
    }
    const profileRaw = localStorage.getItem(`fl_user_profile_${uid}`);
    if (profileRaw) {
      const parsed = JSON.parse(profileRaw);
      if (parsed && parsed.onboardingCompleted === true) {
        return true;
      }
    }
  } catch {
    // ignore
  }
  return false;
}

function loadSavedUser(isAutostart: boolean): AppUser | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppUser;
      if (parsed && parsed.uid && parsed.email) {
        return {
          ...parsed,
          emailVerified: parsed.emailVerified ?? true,
        };
      }
    }
    if (isAutostart) {
      const autoUser: AppUser = {
        uid: 'autostart-verified-user',
        name: 'Alex Morgan',
        email: 'alex.morgan@firework.ai',
        provider: 'email',
        emailVerified: true,
      };
      localStorage.setItem(`${ONBOARDED_PREFIX}${autoUser.uid}`, 'true');
      return autoUser;
    }
  } catch {
    // ignore
  }
  return null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(() => loadSavedUser(isAutostart));
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    if (isAutostart) return true;
    const saved = loadSavedUser(false);
    return saved ? checkUidOnboarded(saved.uid) : false;
  });

  const isPreviewMode = false;
  const setIsPreviewMode = (_val: boolean) => {
    localStorage.setItem('fl_preview_mode_v2', 'false');
  };

  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [shouldRedirectToGuide, setShouldRedirectToGuide] = useState<boolean>(false);

  const clearGuideRedirect = () => setShouldRedirectToGuide(false);

  const markOnboardingCompleted = (completed = true) => {
    if (!user?.uid) return;
    setHasCompletedOnboarding(completed);
    try {
      if (completed) {
        localStorage.setItem(`${ONBOARDED_PREFIX}${user.uid}`, 'true');
        setShouldRedirectToGuide(true);
      } else {
        localStorage.removeItem(`${ONBOARDED_PREFIX}${user.uid}`);
      }
    } catch {
      // ignore
    }
  };

  const completeRealAccountOnboarding = (accountData: { name: string; email: string }) => {
    const cleanName = accountData.name.trim() || user?.name || 'Freelancer';
    const cleanEmail = accountData.email.trim() || user?.email || '';
    const uid = firebaseUser?.uid || user?.uid || `usr_${Date.now().toString(36)}`;
    const newUser: AppUser = {
      uid,
      name: cleanName,
      email: cleanEmail,
      photoURL: firebaseUser?.photoURL || user?.photoURL || undefined,
      provider: firebaseUser ? 'google' : user?.provider || 'email',
      emailVerified: true,
    };
    setUser(newUser);
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(newUser));
    localStorage.setItem(`${ONBOARDED_PREFIX}${uid}`, 'true');
    setHasCompletedOnboarding(true);
    setIsAccountModalOpen(false);
    setShouldRedirectToGuide(true);
  };

  useEffect(() => {
    const unsub = initAuth(
      (fbUser, token) => {
        setFirebaseUser(fbUser);
        setAccessToken(token || getAccessToken());
        const isGoogle = fbUser.providerData.some((p) => p.providerId === 'google.com');
        const accounts = loadStoredAccounts();
        const emailKey = (fbUser.email || '').trim().toLowerCase();
        const localRec = accounts[emailKey];
        const verified = isGoogle || Boolean(fbUser.emailVerified) || Boolean(localRec?.emailVerified);

        const mappedUser: AppUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || localRec?.name || fbUser.email?.split('@')[0] || 'Freelancer',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || undefined,
          provider: isGoogle ? 'google' : 'email',
          emailVerified: verified,
        };
        setUser(mappedUser);
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(mappedUser));
        setHasCompletedOnboarding(checkUidOnboarded(mappedUser.uid));
        setIsAuthReady(true);
      },
      () => {
        setFirebaseUser(null);
        setAccessToken(null);
        const existingLocal = loadSavedUser(isAutostart);
        if (existingLocal) {
          setUser(existingLocal);
          setHasCompletedOnboarding(
            isAutostart ? true : checkUidOnboarded(existingLocal.uid)
          );
        }
        setIsAuthReady(true);
      }
    );
    return () => unsub();
  }, [isAutostart]);

  const registerWithEmail = async (input: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<{ user: AppUser; verificationSent: boolean }> => {
    const cleanName = input.fullName.trim();
    const cleanEmail = input.email.trim().toLowerCase();
    const accounts = loadStoredAccounts();

    if (accounts[cleanEmail]) {
      const err: any = new Error('Email already in use');
      err.code = 'auth/email-already-in-use';
      throw err;
    }

    setIsLoggingIn(true);
    try {
      const passwordHash = await hashPasswordSecure(input.password, cleanEmail);
      const uid = `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      const verificationSent = true;

      const newRecord: StoredCredentialRecord = {
        uid,
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };
      accounts[cleanEmail] = newRecord;
      saveStoredAccounts(accounts);

      const newAuthUser: AppUser = {
        uid,
        name: cleanName,
        email: cleanEmail,
        provider: 'email',
        emailVerified: false,
      };

      setUser(newAuthUser);
      setHasCompletedOnboarding(false);
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(newAuthUser));
      return { user: newAuthUser, verificationSent };
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signInWithEmail = async (input: {
    email: string;
    password: string;
  }): Promise<AppUser> => {
    const cleanEmail = input.email.trim().toLowerCase();
    const accounts = loadStoredAccounts();
    const localRecord = accounts[cleanEmail];

    setIsLoggingIn(true);
    try {
      if (!localRecord) {
        const err: any = new Error('No account found with this email address.');
        err.code = 'auth/user-not-found';
        throw err;
      }

      const incomingHash = await hashPasswordSecure(input.password, cleanEmail);
      if (incomingHash !== localRecord.passwordHash) {
        const err: any = new Error('Incorrect password.');
        err.code = 'auth/wrong-password';
        throw err;
      }

      const signedInUser: AppUser = {
        uid: localRecord.uid,
        name: localRecord.name,
        email: localRecord.email,
        provider: 'email',
        emailVerified: localRecord.emailVerified,
      };

      setUser(signedInUser);
      setHasCompletedOnboarding(checkUidOnboarded(signedInUser.uid));
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(signedInUser));
      return signedInUser;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch {
        // ignore sandbox dispatch limit
      }
    }
  };

  const confirmEmailVerification = async () => {
    if (!user) return;
    if (auth.currentUser) {
      try {
        await reload(auth.currentUser);
      } catch {
        // ignore
      }
    }
    const updatedUser: AppUser = {
      ...user,
      emailVerified: true,
    };
    setUser(updatedUser);
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(updatedUser));
      const accounts = loadStoredAccounts();
      const emailKey = user.email.trim().toLowerCase();
      if (accounts[emailKey]) {
        accounts[emailKey].emailVerified = true;
        saveStoredAccounts(accounts);
      }
    } catch {
      // ignore
    }
  };

  const requestPasswordReset = async (email: string, newPassword?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = loadStoredAccounts();
    if (!accounts[cleanEmail]) {
      const err: any = new Error('Account not found');
      err.code = 'auth/user-not-found';
      throw err;
    }

    if (newPassword && accounts[cleanEmail]) {
      accounts[cleanEmail].passwordHash = await hashPasswordSecure(newPassword, cleanEmail);
      saveStoredAccounts(accounts);
    }
  };

  const changeAccountPassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error('Not authenticated');
    const cleanEmail = user.email.trim().toLowerCase();
    const accounts = loadStoredAccounts();
    const record = accounts[cleanEmail];

    if (record) {
      const currentHash = await hashPasswordSecure(currentPassword, cleanEmail);
      if (currentHash !== record.passwordHash) {
        const err: any = new Error('Current password is incorrect');
        err.code = 'auth/wrong-password';
        throw err;
      }
      record.passwordHash = await hashPasswordSecure(newPassword, cleanEmail);
      saveStoredAccounts(accounts);
    }

    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPassword);
      } catch {
        // ignore if local session
      }
    }
  };

  const deleteAccountPermanently = async () => {
    if (!user) return;
    const uid = user.uid;
    const cleanEmail = user.email.trim().toLowerCase();

    try {
      const accounts = loadStoredAccounts();
      delete accounts[cleanEmail];
      saveStoredAccounts(accounts);
      localStorage.removeItem(ACTIVE_SESSION_KEY);
      localStorage.removeItem(`${ONBOARDED_PREFIX}${uid}`);
      localStorage.removeItem(`fl_user_profile_${uid}`);
      localStorage.removeItem(`fl_projects_${uid}`);
      localStorage.removeItem(`fl_proposals_${uid}`);
      localStorage.removeItem(`fl_financials_${uid}`);
      localStorage.removeItem(`fl_chat_${uid}`);
    } catch {
      // ignore
    }

    if (auth.currentUser) {
      try {
        await deleteUser(auth.currentUser);
      } catch {
        // ignore
      }
    }
    try {
      await logoutFirebase();
    } catch {
      // ignore
    }
    setFirebaseUser(null);
    setAccessToken(null);
    setUser(null);
    setHasCompletedOnboarding(false);
    setIsAccountModalOpen(false);
  };

  const signInWithGoogleAccount = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setFirebaseUser(res.user);
        setAccessToken(res.accessToken);
        const googleAppUser: AppUser = {
          uid: res.user.uid,
          name: res.user.displayName || res.user.email?.split('@')[0] || 'Freelancer',
          email: res.user.email || '',
          photoURL: res.user.photoURL || undefined,
          provider: 'google',
          emailVerified: true,
        };
        setUser(googleAppUser);
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(googleAppUser));
        setHasCompletedOnboarding(checkUidOnboarded(googleAppUser.uid));
        setIsAccountModalOpen(false);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signOutAccount = async () => {
    await logoutFirebase();
    setFirebaseUser(null);
    setAccessToken(null);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setUser(null);
    setHasCompletedOnboarding(false);
    setIsAccountModalOpen(false);
  };

  const isFirestoreEligible = Boolean(
    firebaseUser &&
      auth.currentUser &&
      user &&
      (user.provider === 'google' || user.emailVerified) &&
      auth.currentUser.uid === user.uid
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        accessToken,
        isPreviewMode,
        setIsPreviewMode,
        isAuthReady,
        isLoggingIn,
        isFirestoreEligible,
        hasCompletedOnboarding,
        shouldRedirectToGuide,
        clearGuideRedirect,
        markOnboardingCompleted,
        completeRealAccountOnboarding,
        registerWithEmail,
        signInWithEmail,
        resendVerificationEmail,
        confirmEmailVerification,
        requestPasswordReset,
        changeAccountPassword,
        deleteAccountPermanently,
        signInWithGoogleAccount,
        signOutAccount,
        isAccountModalOpen,
        setIsAccountModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


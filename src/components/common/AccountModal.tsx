import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  Trash2,
  KeyRound,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useMotionSystem } from '../../utils/motionVariants';

export const AccountModal: React.FC = () => {
  const {
    user,
    isAccountModalOpen,
    setIsAccountModalOpen,
    changeAccountPassword,
    deleteAccountPermanently,
    markOnboardingCompleted,
    signOutAccount,
  } = useAuth();

  const { userProfile, resetAllWorkspaceData, addNotification } = useData();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { modalOverlayVariants, modalDialogVariants } = useMotionSystem();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAccountModalOpen) {
        setIsAccountModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAccountModalOpen, setIsAccountModalOpen]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (newPassword.length < 8) {
      setPasswordStatus({
        type: 'error',
        message: isAr
          ? 'يجب أن تتكون كلمة المرور الجديدة من 8 خانات على الأقل.'
          : 'New password must be at least 8 characters.',
      });
      return;
    }

    try {
      await changeAccountPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPasswordStatus({
        type: 'success',
        message: isAr
          ? 'تم تحديث كلمة المرور بنجاح.'
          : 'Password updated successfully.',
      });
    } catch {
      setPasswordStatus({
        type: 'error',
        message: isAr
          ? 'كلمة المرور الحالية غير صحيحة.'
          : 'Current password is incorrect.',
      });
    }
  };

  return (
    <AnimatePresence>
      {isAccountModalOpen && (
        <motion.div
          variants={modalOverlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={() => setIsAccountModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-2xl p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? 'إدارة الحساب والأمان' : 'Account & Security Settings'}
        >
          <motion.div
            variants={modalDialogVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-3xl liquid-glass p-6 lg:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.85)] my-auto space-y-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#007AFF]/15 border border-[#007AFF]/35 flex items-center justify-center text-[#007AFF] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#090E1A] dark:text-white">
                    {isAr
                      ? 'إدارة الحساب والأمان والخصوصية'
                      : 'Account, Security & Privacy'}
                  </h2>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
                    {user?.email || userProfile.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                aria-label={isAr ? 'إغلاق نافذة الحساب' : 'Close account modal'}
                className="p-2 rounded-xl text-[#64748B] hover:text-[#090E1A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account Summary */}
            <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-[#090E1A] dark:text-white">
                  {userProfile.fullName || userProfile.name || user?.name}
                </div>
                <div className="text-xs text-[#475569] dark:text-[#94A3B8]">
                  {userProfile.professionalHeadline ||
                    userProfile.title ||
                    (isAr ? 'مستقل مسجل' : 'Registered Freelancer')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#34C759]/15 text-[#248A3D] dark:text-[#34C759] text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isAr ? 'حساب موثق' : 'Verified Account'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountModalOpen(false);
                    markOnboardingCompleted(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.06] text-xs font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>
                    {isAr
                      ? 'معالج الإعداد (8 خطوات)'
                      : 'Re-open 8-Step Setup'}
                  </span>
                </button>
              </div>
            </div>

            {/* Password Change Form */}
            <form
              onSubmit={handleChangePassword}
              className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 space-y-3"
            >
              <div className="text-xs font-extrabold flex items-center gap-1.5 text-[#090E1A] dark:text-white">
                <KeyRound className="w-4 h-4 text-[#007AFF]" />
                <span>
                  {isAr ? 'تغيير كلمة المرور:' : 'Change Account Password:'}
                </span>
              </div>

              {passwordStatus && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-bold ${
                    passwordStatus.type === 'success'
                      ? 'bg-[#34C759]/15 text-[#248A3D] dark:text-[#34C759]'
                      : 'bg-[#FF3B30]/15 text-[#D70015] dark:text-[#FF6961]'
                  }`}
                >
                  {passwordStatus.message}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={
                    isAr ? 'كلمة المرور الحالية' : 'Current Password'
                  }
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={
                    isAr
                      ? 'كلمة المرور الجديدة (8+ خانات)'
                      : 'New Password (8+ chars)'
                  }
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-black/15 dark:border-white/15 text-xs"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#007AFF] text-white font-bold text-xs"
                >
                  {isAr ? 'تحديث كلمة المرور' : 'Update Password'}
                </button>
              </div>
            </form>

            {/* Sign Out & Workspace Reset / Delete Account */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={signOutAccount}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black/[0.06] dark:bg-white/[0.08] hover:bg-black/10 text-xs font-bold text-[#090E1A] dark:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>
                    {isAr ? 'تسجيل الخروج من الحساب' : 'Sign Out'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetAllWorkspaceData();
                    setIsAccountModalOpen(false);
                    addNotification({
                      title: isAr
                        ? 'تم تصفير مشاريع مساحة العمل'
                        : 'Workspace Projects Cleared',
                      message: isAr
                        ? 'تم مسح المشاريع والعروض المؤقتة مع الاحتفاظ بملفك المهني.'
                        : 'Temporary projects and proposals cleared while keeping your profile.',
                      type: 'info',
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-[#CBD5E1]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {isAr ? 'تصفير مشاريع مساحة العمل' : 'Clear Workspace Data'}
                  </span>
                </button>
              </div>

              {!confirmDeleteOpen ? (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#D70015] dark:text-[#FF6961] hover:bg-[#FF3B30]/10 transition-colors"
                >
                  {isAr
                    ? 'حذف الحساب والملف المهني نهائياً'
                    : 'Delete Account & Profile Permanently'}
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#D70015] dark:text-[#FF6961]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      {isAr
                        ? 'هل أنت متأكد من حذف حسابك وجميع بيانات ملفك المهني نهائياً؟'
                        : 'Are you sure you want to permanently delete your account and profile?'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={deleteAccountPermanently}
                      className="px-4 py-2 rounded-xl bg-[#FF3B30] text-white font-bold text-xs"
                    >
                      {isAr ? 'نعم، احذف الحساب نهائياً' : 'Yes, Delete Permanently'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteOpen(false)}
                      className="px-4 py-2 rounded-xl bg-black/10 dark:bg-white/10 text-xs font-bold"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

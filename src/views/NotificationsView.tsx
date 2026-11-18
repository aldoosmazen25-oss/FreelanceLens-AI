import React from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowUpLeft,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { useData } from '../context/DataContext';
import { ViewId } from '../types';

interface NotificationsViewProps {
  onSelectView: (view: ViewId) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onSelectView,
}) => {
  const {
    notifications,
    markAllNotificationsRead,
    clearOldNotifications,
  } = useData();

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-[#ffc15a]" />
          <div>
            <h2 className="text-lg font-bold text-[#effaf4]">
              مركز الإشعارات والتنبيهات الذكية
            </h2>
            <p className="text-xs text-[#a4c2b4]">
              تنبيهات الفرص الجديدة، تحذيرات تمدد النطاق، وتأكيدات الدفعات المالية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-[#2be38a]"
          >
            <CheckCheck className="w-4 h-4" />
            <span>تحديد الكل كمقروء</span>
          </button>
          <button
            type="button"
            onClick={clearOldNotifications}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-[#ff6b7f]/15 border border-white/10 text-xs text-[#a4c2b4] hover:text-[#ff6b7f]"
          >
            <Trash2 className="w-4 h-4" />
            <span>مسح التنبيهات المقروءة</span>
          </button>
        </div>
      </GlassCard>

      {notifications.length === 0 ? (
        <GlassCard className="p-12 text-center text-sm text-[#6c8a7d]">
          لا توجد إشعارات حالياً — جميع التنبيهات تمت مراجعتها.
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const icon =
              notif.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-[#ffc15a] shrink-0" />
              ) : notif.type === 'opportunity' ? (
                <Sparkles className="w-5 h-5 text-[#62d9ff] shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#2be38a] shrink-0" />
              );

            return (
              <GlassCard
                key={notif.id}
                variant={notif.read ? 'default' : 'hot'}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5">{icon}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#effaf4]">
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="text-[11px] font-semibold text-[#2be38a]">
                          (جديد)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#a4c2b4] leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="text-[11px] font-mono text-[#6c8a7d]">
                      {notif.createdAt}
                    </div>
                  </div>
                </div>

                {notif.targetView && (
                  <button
                    type="button"
                    onClick={() => onSelectView(notif.targetView!)}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-[#effaf4] shrink-0"
                  >
                    <span>الانتقال للقسم</span>
                    <ArrowUpLeft className="w-3.5 h-3.5 text-[#2be38a]" />
                  </button>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

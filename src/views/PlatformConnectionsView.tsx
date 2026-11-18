import React, { useState } from 'react';
import { Link2, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';

interface PlatformItem {
  id: string;
  name: string;
  role: string;
  status: 'connected' | 'guided' | 'disconnected';
  currencies: string[];
  permissions: string[];
}

export const PlatformConnectionsView: React.FC = () => {
  const [platforms, setPlatforms] = useState<PlatformItem[]>([
    {
      id: 'upwork',
      name: 'Upwork',
      role: 'منصة عقود العمل الحر العالمية',
      status: 'connected',
      currencies: ['USD', 'EUR'],
      permissions: ['قراءة الفرص المطابقة', 'تتبع حالة العروض المرسلة', 'حساب العمولة 10%'],
    },
    {
      id: 'fiverr_pro',
      name: 'Fiverr Pro',
      role: 'خدمات استشارية وحزم تقنية معتمدة',
      status: 'connected',
      currencies: ['USD', 'EUR', 'GBP'],
      permissions: ['مزامنة طلبات العملاء', 'تحليل رسائل النطاق', 'حساب العمولة 20%'],
    },
    {
      id: 'freelancer',
      name: 'Freelancer.com',
      role: 'مناقصات المشاريع التقنية والبرمجية',
      status: 'guided',
      currencies: ['USD', 'AUD', 'EUR'],
      permissions: ['استيراد أوصاف المشاريع', 'تقييم المخاطر التعاقدية'],
    },
    {
      id: 'github',
      name: 'GitHub',
      role: 'مستودعات الكود المصدري ومعرض المشاريع',
      status: 'connected',
      currencies: ['N/A (Tech Verification)'],
      permissions: ['توثيق المهارات البرمجية', 'ربط مشاريع معرض الأعمال'],
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      role: 'الشبكة المهنية واستقطاب العقود المباشرة',
      status: 'guided',
      currencies: ['USD', 'SAR', 'AED'],
      permissions: ['مطابقة السيرة الذاتية', 'استلام طلبات التعاقد المباشر (0% عمولة)'],
    },
  ]);

  const toggleStatus = (id: string) => {
    setPlatforms((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nextStatus =
          p.status === 'connected'
            ? 'disconnected'
            : p.status === 'disconnected'
            ? 'connected'
            : 'connected';
        return { ...p, status: nextStatus };
      })
    );
  };

  const getStatusLabel = (st: PlatformItem['status']) => {
    if (st === 'connected') return { text: 'متصل ومصرح', color: 'text-[#2be38a]' };
    if (st === 'guided') return { text: 'اتصال استرشادي', color: 'text-[#ffc15a]' };
    return { text: 'غير متصل', color: 'text-[#6c8a7d]' };
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#effaf4]">
            ربط المنصات الرقمية ومصادر الفرص (Platform Connections)
          </h2>
          <p className="text-xs text-[#a4c2b4] mt-0.5">
            إدارة التكاملات والصلاحيات والعملات المدعومة عبر بروتوكول OAuth 2.0 الآمن دون طلب أو تخزين كلمات المرور
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#2be38a]">
          <ShieldCheck className="w-4 h-4" />
          <span>تشفير رموز الوصول (Zero Password Storage)</span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {platforms.map((plat) => {
          const st = getStatusLabel(plat.status);
          return (
            <GlassCard key={plat.id} className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-[#62d9ff]" />
                    <h3 className="text-base font-bold text-[#effaf4]">
                      {plat.name}
                    </h3>
                  </div>
                  <span className={`text-xs font-semibold ${st.color}`}>
                    {st.text}
                  </span>
                </div>
                <p className="text-xs text-[#a4c2b4]">{plat.role}</p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6c8a7d]">العملات المدعومة:</span>
                  <span className="font-mono text-[#effaf4]">
                    {plat.currencies.join(' · ')}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[#6c8a7d]">الصلاحيات الممنوحة:</div>
                  {plat.permissions.map((perm, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-[11px] text-[#effaf4]"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#2be38a] shrink-0" />
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleStatus(plat.id)}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-colors ${
                  plat.status === 'connected'
                    ? 'bg-white/[0.04] border-white/10 text-[#a4c2b4] hover:text-[#effaf4]'
                    : 'bg-[#2be38a] border-[#2be38a] text-[#020504] font-bold'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  {plat.status === 'connected'
                    ? 'تحديث حالة الربط / قطع الاتصال'
                    : 'تفعيل الربط عبر OAuth 2.0'}
                </span>
              </button>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

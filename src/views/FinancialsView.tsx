import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useData } from '../context/DataContext';
import { calculateFinancialSummary } from '../utils/calculations';

export const FinancialsView: React.FC = () => {
  const {
    financials,
    projects,
    addFinancialTransaction,
    deleteFinancialTransaction,
  } = useData();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'revenue' | 'expense'>('revenue');
  const [amount, setAmount] = useState<string>('1200');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'received' | 'pending'>('received');
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');

  const summary = calculateFinancialSummary(financials);

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const linkedProj = projects.find((p) => p.id === projectId);
    await addFinancialTransaction({
      title: title.trim(),
      type,
      amount: Number(amount) || 0,
      date,
      status,
      projectId: projectId || undefined,
      projectTitle: linkedProj?.title,
    });

    setTitle('');
    setAmount('1000');
  };

  return (
    <div className="space-y-6">
      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5">
          <div className="text-xs text-[#a4c2b4]">إجمالي الإيرادات المقبوضة</div>
          <div className="font-mono text-2xl font-bold text-[#2be38a] tabular-nums mt-2">
            ${summary.receivedRevenue.toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-[#6c8a7d] mt-1">دفعات مكتملة في حسابك</div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="text-xs text-[#a4c2b4]">دفعات المراحل المعلقة</div>
          <div className="font-mono text-2xl font-bold text-[#ffc15a] tabular-nums mt-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>${summary.pendingMilestones.toLocaleString('en-US')}</span>
          </div>
          <div className="text-[11px] text-[#6c8a7d] mt-1">بانتظار تسليم المراحل</div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="text-xs text-[#a4c2b4]">إجمالي المصروفات التشغيلية</div>
          <div className="font-mono text-2xl font-bold text-[#ff6b7f] tabular-nums mt-2">
            -${summary.totalExpenses.toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-[#6c8a7d] mt-1">أدوات، خوادم، واشتراكات</div>
        </GlassCard>

        <GlassCard variant="hot" className="p-5">
          <div className="text-xs text-[#2be38a]">صافي التدفق النقدي (Net Cashflow)</div>
          <div className="font-mono text-2xl font-bold text-[#effaf4] tabular-nums mt-2">
            ${summary.netCashflow.toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-[#a4c2b4] mt-1">بعد خصم كافة المصروفات</div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Add Financial Transaction Form */}
        <GlassCard className="lg:col-span-4 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#2be38a]" />
            <h3 className="text-base font-bold text-[#effaf4]">
              تسجيل معاملة مالية جديدة
            </h3>
          </div>

          <form onSubmit={handleAddTx} className="space-y-3.5">
            <div className="space-y-1">
              <label
                htmlFor="tx-title-input"
                className="block text-xs text-[#a4c2b4]"
              >
                بيان المعاملة / الدفعة
              </label>
              <input
                id="tx-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: دفعة المرحلة الأولى لمشروع..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="tx-type-select"
                  className="block text-xs text-[#a4c2b4]"
                >
                  النوع
                </label>
                <select
                  id="tx-type-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4]"
                >
                  <option value="revenue" className="bg-[#030706]">إيراد (+)</option>
                  <option value="expense" className="bg-[#030706]">مصروف (-)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="tx-amount-input"
                  className="block text-xs text-[#a4c2b4]"
                >
                  المبلغ ($)
                </label>
                <input
                  id="tx-amount-input"
                  type="number"
                  min={1}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs text-[#effaf4]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="tx-status-select"
                  className="block text-xs text-[#a4c2b4]"
                >
                  الحالة
                </label>
                <select
                  id="tx-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4]"
                >
                  <option value="received" className="bg-[#030706]">مستلمة</option>
                  <option value="pending" className="bg-[#030706]">معلقة</option>
                </select>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="tx-date-input"
                  className="block text-xs text-[#a4c2b4]"
                >
                  التاريخ
                </label>
                <input
                  id="tx-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs text-[#effaf4]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="tx-project-select"
                className="block text-xs text-[#a4c2b4]"
              >
                ربط بمشروع (اختياري)
              </label>
              <select
                id="tx-project-select"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4]"
              >
                <option value="" className="bg-[#030706]">عام / بدون مشروع محدد</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#030706]">
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2be38a] text-[#020504] font-bold text-xs hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة المعاملة للسجل المالي</span>
            </button>
          </form>
        </GlassCard>

        {/* Financial Ledger Table */}
        <GlassCard className="lg:col-span-8 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="text-base font-bold text-[#effaf4]">
              سجل المعاملات والتدفقات النقدية
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/[0.04] border-b border-white/10 text-[#a4c2b4]">
                <tr>
                  <th className="py-3 px-4 font-semibold">البيان</th>
                  <th className="py-3 px-4 font-semibold">النوع</th>
                  <th className="py-3 px-4 font-semibold">المبلغ</th>
                  <th className="py-3 px-4 font-semibold">الحالة</th>
                  <th className="py-3 px-4 font-semibold">التاريخ</th>
                  <th className="py-3 px-4 font-semibold">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {financials.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#effaf4]">{tx.title}</div>
                      {tx.projectTitle && (
                        <div className="text-[11px] text-[#6c8a7d]">
                          {tx.projectTitle}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {tx.type === 'revenue' ? (
                        <span className="inline-flex items-center gap-1 text-[#2be38a]">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          إيراد
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#ff6b7f]">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          مصروف
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-3.5 px-4 font-mono font-bold tabular-nums ${
                        tx.type === 'revenue' ? 'text-[#2be38a]' : 'text-[#ff6b7f]'
                      }`}
                    >
                      {tx.type === 'revenue' ? '+' : '-'}$
                      {tx.amount.toLocaleString('en-US')}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#a4c2b4] tabular-nums">
                      {tx.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => deleteFinancialTransaction(tx.id)}
                        aria-label={`حذف المعاملة ${tx.title}`}
                        className="p-1.5 rounded-lg text-[#6c8a7d] hover:text-[#ff6b7f] hover:bg-[#ff6b7f]/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

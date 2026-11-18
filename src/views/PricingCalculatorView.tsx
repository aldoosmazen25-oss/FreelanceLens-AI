import React, { useState } from 'react';
import {
  Calculator,
  Sparkles,
  ShieldAlert,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { useData } from '../context/DataContext';
import { calculateCompetitivePricing } from '../utils/calculations';

export const PricingCalculatorView: React.FC = () => {
  const { userProfile } = useData();

  const [hours, setHours] = useState<number>(45);
  const [rate, setRate] = useState<number>(userProfile.hourlyRate || 75);
  const [complexity, setComplexity] = useState<number>(1.3);
  const [revisions, setRevisions] = useState<number>(2);
  const [expenses, setExpenses] = useState<number>(120);
  const [fee, setFee] = useState<number>(10); // 10% Upwork, 20% Fiverr, 0% Direct
  const [profit, setProfit] = useState<number>(20);
  const [isRush, setIsRush] = useState<boolean>(false);

  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);
  const [aiAdvice, setAiAdvice] = useState<{
    marketPosition: string;
    negotiationScript: string;
    milestoneSplit: string[];
    valueJustification: string;
    modelMode?: string;
  } | null>(null);

  const outputs = calculateCompetitivePricing({
    hours,
    rate,
    complexity,
    revisions,
    expenses,
    fee,
    profit,
    isRush,
  });

  const handleGetPricingAdvice = async () => {
    setIsLoadingAdvice(true);
    try {
      const res = await fetch('/api/gemini/pricing-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: { hours, rate, complexity, revisions, expenses, fee, profit, isRush },
          outputs,
          userProfile,
        }),
      });
      const data = await res.json();
      setAiAdvice(data);
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Parameters Input Card */}
        <GlassCard className="lg:col-span-7 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-[#effaf4]">
                حاسبة التسعير التنافسي وهندسة الربحية
              </h2>
              <p className="text-xs text-[#a4c2b4] mt-0.5">
                احسب السعر المقترح للعميل وصافي الربح وسعر الانسحاب وفق المعادلات الرياضية الدقيقة
              </p>
            </div>
            <Calculator className="w-6 h-6 text-[#2be38a]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="calc-hours"
                className="block text-xs font-medium text-[#a4c2b4]"
              >
                ساعات العمل المقدرة
              </label>
              <input
                id="calc-hours"
                type="number"
                min={1}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-sm text-[#effaf4]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="calc-rate"
                className="block text-xs font-medium text-[#a4c2b4]"
              >
                سعر الساعة الأساسي ($/hr)
              </label>
              <input
                id="calc-rate"
                type="number"
                min={5}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-sm text-[#effaf4]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="calc-complexity"
                className="block text-xs font-medium text-[#a4c2b4]"
              >
                معامل التعقيد التقني ({complexity.toFixed(1)}x)
              </label>
              <input
                id="calc-complexity"
                type="range"
                min={1.0}
                max={2.0}
                step={0.1}
                value={complexity}
                onChange={(e) => setComplexity(Number(e.target.value))}
                className="w-full accent-[#2be38a] mt-2"
              />
              <div className="flex justify-between text-[10px] text-[#6c8a7d] font-mono">
                <span>1.0x عادي</span>
                <span>1.5x متقدم</span>
                <span>2.0x فائق التعقيد</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="calc-revisions"
                className="block text-xs font-medium text-[#a4c2b4]"
              >
                عدد جولات المراجعة (+5% لكل جولة)
              </label>
              <input
                id="calc-revisions"
                type="number"
                min={0}
                max={20}
                value={revisions}
                onChange={(e) => setRevisions(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-sm text-[#effaf4]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="calc-expenses"
                className="block text-xs font-medium text-[#a4c2b4]"
              >
                المصاريف المباشرة (استضافات، قوالب، APIs) ($)
              </label>
              <input
                id="calc-expenses"
                type="number"
                min={0}
                value={expenses}
                onChange={(e) => setExpenses(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-sm text-[#effaf4]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="calc-profit"
                className="block text-xs font-medium text-[#a4c2b4]"
              >
                هامش الربح الإضافي المستهدف (%)
              </label>
              <input
                id="calc-profit"
                type="number"
                min={0}
                max={100}
                value={profit}
                onChange={(e) => setProfit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-sm text-[#effaf4]"
              />
            </div>
          </div>

          {/* Platform Commission Selector */}
          <div className="space-y-2 pt-2">
            <span className="block text-xs font-medium text-[#a4c2b4]">
              عمولة المنصة المقتطعة
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Upwork (10%)', val: 10 },
                { label: 'Fiverr (20%)', val: 20 },
                { label: 'تعاقد مباشر (0%)', val: 0 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setFee(p.val)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                    fee === p.val
                      ? 'bg-[#2be38a]/20 border-[#2be38a] text-[#effaf4]'
                      : 'bg-white/[0.03] border-white/10 text-[#a4c2b4]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rush Fee Toggle (+25%) */}
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#ffc15a]" />
              <div>
                <div className="text-xs font-bold text-[#effaf4]">
                  رسوم التسليم العاجل (Rush Fee +25%)
                </div>
                <div className="text-[11px] text-[#6c8a7d]">
                  يضيف 25% على تكلفة العمالة المعدلة للمشاريع المستعجلة
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isRush}
              onChange={(e) => setIsRush(e.target.checked)}
              className="accent-[#ffc15a] w-4 h-4"
            />
          </label>
        </GlassCard>

        {/* Mathematical Results Card */}
        <div className="lg:col-span-5 space-y-5">
          <GlassCard variant="hot" className="p-6 space-y-5">
            <div>
              <div className="text-xs text-[#2be38a] font-medium">
                التسعير النهائي المحسوب
              </div>
              <div className="font-mono text-4xl font-bold text-[#effaf4] tabular-nums mt-1">
                ${outputs.suggestedClientPrice.toLocaleString('en-US')}
              </div>
              <div className="text-xs text-[#a4c2b4] mt-1">
                السعر المقترح تقديمه للعميل شاملاً العمولة وهامش الربح
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#a4c2b4]">الأجر الأساسي (Base Labor):</span>
                <span className="font-mono text-[#effaf4] tabular-nums">
                  ${outputs.baseLabor.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a4c2b4]">
                  تكلفة العمالة المعدلة ({complexity.toFixed(1)}x):
                </span>
                <span className="font-mono text-[#effaf4] tabular-nums">
                  ${outputs.adjustedLabor.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a4c2b4]">
                  هامش التعديلات ({revisions} جولات × 5%):
                </span>
                <span className="font-mono text-[#effaf4] tabular-nums">
                  +${outputs.revisionsBuffer.toLocaleString('en-US')}
                </span>
              </div>
              {isRush && (
                <div className="flex items-center justify-between text-[#ffc15a]">
                  <span>رسوم الخدمة العاجلة (+25%):</span>
                  <span className="font-mono tabular-nums">
                    +${outputs.rushFeeAmount.toLocaleString('en-US')}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[#a4c2b4]">التكلفة الإجمالية الأساسية:</span>
                <span className="font-mono font-semibold text-[#effaf4] tabular-nums">
                  ${outputs.totalCost.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div className="p-3.5 rounded-xl bg-black/40 border border-[#2be38a]/30">
                <div className="text-[11px] text-[#a4c2b4] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#2be38a]" />
                  <span>صافي الأرباح (Net Profit)</span>
                </div>
                <div className="font-mono text-xl font-bold text-[#2be38a] tabular-nums mt-1">
                  ${outputs.netProfit.toLocaleString('en-US')}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-[#ff6b7f]/30">
                <div className="text-[11px] text-[#a4c2b4] flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#ff6b7f]" />
                  <span>سعر الانسحاب (Walk-away)</span>
                </div>
                <div className="font-mono text-xl font-bold text-[#ff6b7f] tabular-nums mt-1">
                  ${outputs.walkAwayPrice.toLocaleString('en-US')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetPricingAdvice}
              disabled={isLoadingAdvice}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#62d9ff] to-[#1f7bff] text-[#effaf4] font-bold text-xs hover:brightness-110 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isLoadingAdvice
                  ? 'جاري تحليل أسعار السوق العالمية...'
                  : 'استشارة التسعير بالذكاء الاصطناعي'}
              </span>
            </button>
          </GlassCard>

          {aiAdvice && (
            <GlassCard variant="cyan" className="p-5 space-y-3 text-xs">
              <div className="font-bold text-[#62d9ff]">
                توصيات التفاوض وتقسيم الدفعات ({aiAdvice.modelMode})
              </div>
              <p className="text-[#effaf4] leading-relaxed">
                {aiAdvice.marketPosition}
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <div className="font-semibold text-[#2be38a]">سيناريو التفاوض الذكي:</div>
                <p className="text-[#a4c2b4] leading-relaxed">
                  {aiAdvice.negotiationScript}
                </p>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-[#effaf4]">تقسيم الدفعات المقترح:</div>
                {aiAdvice.milestoneSplit.map((m, i) => (
                  <div key={i} className="text-[#a4c2b4]">
                    • {m}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

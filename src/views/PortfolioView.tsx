import React, { useState } from 'react';
import { Briefcase, Plus, TrendingUp, Trash2 } from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { useData } from '../context/DataContext';
import { PortfolioItem } from '../types';

export const PortfolioView: React.FC = () => {
  const { userProfile, updateUserProfile } = useData();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SaaS & AI');
  const [description, setDescription] = useState('');
  const [impactMetric, setImpactMetric] = useState('');
  const [techStackStr, setTechStackStr] = useState('React, TypeScript, Gemini API');

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newItem: PortfolioItem = {
      id: `pf-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim(),
      impactMetric: impactMetric.trim() || '+40% تحسين في كفاءة الأداء التشغيلي',
      techStack: techStackStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      completedDate: new Date().toISOString().slice(0, 7),
    };

    await updateUserProfile({
      portfolio: [newItem, ...userProfile.portfolio],
    });

    setTitle('');
    setDescription('');
    setImpactMetric('');
  };

  const handleDeletePortfolio = async (id: string) => {
    await updateUserProfile({
      portfolio: userProfile.portfolio.filter((p) => p.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Add New Portfolio Project Form */}
        <GlassCard className="lg:col-span-4 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#2be38a]" />
            <h2 className="text-base font-bold text-[#effaf4]">
              إضافة عمل جديد لمعرض الخبرات
            </h2>
          </div>

          <form onSubmit={handleAddPortfolio} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs text-[#a4c2b4]">عنوان المشروع المنفذ</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: منصة أتمتة المبيعات السحابية..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#a4c2b4]">التصنيف</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#a4c2b4]">
                الأثر الرقمي والعائد للعميل (ROI Metric)
              </label>
              <input
                type="text"
                value={impactMetric}
                onChange={(e) => setImpactMetric(e.target.value)}
                placeholder="مثال: +65% زيادة في المبيعات خلال 3 أشهر"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#a4c2b4]">التقنيات (مفصولة بفاصلة)</label>
              <input
                type="text"
                value={techStackStr}
                onChange={(e) => setTechStackStr(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#a4c2b4]">وصف الحل المنفذ</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اشرح كيف قمت بحل مشكلة العميل..."
                className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4]"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2be38a] text-[#020504] font-bold text-xs hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة إلى معرض الأعمال</span>
            </button>
          </form>
        </GlassCard>

        {/* Portfolio Showcase Grid */}
        <div className="lg:col-span-8 space-y-4">
          {userProfile.portfolio.map((item) => (
            <GlassCard key={item.id} className="p-6 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-[#62d9ff] font-medium">
                    {item.category} · <span className="font-mono text-[#6c8a7d]">{item.completedDate}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#effaf4] mt-1">
                    {item.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeletePortfolio(item.id)}
                  aria-label={`حذف العمل ${item.title}`}
                  className="p-1.5 rounded-lg text-[#6c8a7d] hover:text-[#ff6b7f] hover:bg-[#ff6b7f]/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#a4c2b4] leading-relaxed">
                {item.description}
              </p>

              <div className="p-3 rounded-xl bg-[#2be38a]/[0.07] border border-[#2be38a]/25 flex items-center gap-2 text-xs text-[#2be38a] font-semibold">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>الأثر المحقق: {item.impactMetric}</span>
              </div>

              <div className="text-[11px] font-mono text-[#6c8a7d] pt-1">
                {item.techStack.join(' · ')}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

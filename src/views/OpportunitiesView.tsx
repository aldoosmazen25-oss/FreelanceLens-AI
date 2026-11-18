import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  ScanSearch,
  SlidersHorizontal,
  Star,
  Plus,
  Sparkles,
  FilePenLine,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { MatchRing } from '../components/common/MatchRing';
import { useData } from '../context/DataContext';
import { OpportunityItem, ViewId } from '../types';
import { SiriOrbIcon } from '../components/voice/SiriOrbIcon';
import { resolveVoiceAgentTaskIntent } from '../utils/calculations';

interface OpportunitiesViewProps {
  onSelectView: (view: ViewId) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  onSelectView,
}) => {
  const {
    opportunities,
    setOpportunities,
    toggleSaveOpportunity,
    setSelectedProjectForAction,
    userProfile,
  } = useData();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [minMatchScore, setMinMatchScore] = useState<number>(70);

  // Add real opportunity form state
  const [isAddingOpp, setIsAddingOpp] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPlatform, setNewPlatform] = useState<OpportunityItem['platform']>('Upwork');
  const [newBudget, setNewBudget] = useState<string>('$2,500');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newSkills, setNewSkills] = useState<string>('');

  const filtered = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform =
      selectedPlatform === 'all' || opp.platform === selectedPlatform;
    const matchesScore = opp.matchScore >= minMatchScore;
    return matchesSearch && matchesPlatform && matchesScore;
  });

  const handleAnalyzeOpportunity = (opp: OpportunityItem) => {
    setSelectedProjectForAction({
      id: opp.id,
      ownerId: userProfile.uid,
      title: opp.title,
      description: opp.description,
      platform: opp.platform,
      budget: opp.budget,
      deadline: '3 أسابيع',
      matchScore: opp.matchScore,
      status: 'new',
      createdAt: new Date().toISOString().slice(0, 10),
    });
    onSelectView('project-analyzer');
  };

  const handleAddRealOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;
    const parsedSkills = newSkills
      .split(/[،,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const created: OpportunityItem = {
      id: `opp-${Date.now()}`,
      title: newTitle.trim(),
      platform: newPlatform,
      budget: newBudget.trim() || '$2,000',
      matchScore: 92,
      skills:
        parsedSkills.length > 0
          ? parsedSkills
          : userProfile.skills.slice(0, 4).map((s) => s.name),
      postedAt: 'الآن',
      clientRating: 5.0,
      description: newDescription.trim(),
      saved: false,
    };
    setOpportunities((prev) => [created, ...prev]);
    setNewTitle('');
    setNewDescription('');
    setNewSkills('');
    setIsAddingOpp(false);
  };

  const handleScoutWithLensAI = () => {
    const userSkills =
      userProfile.skills.length > 0
        ? userProfile.skills.map((s) => s.name)
        : ['React', 'TypeScript', 'Node.js', 'AI Integration'];
    const baseRate = userProfile.hourlyRate || 50;

    const tailored: OpportunityItem[] = [
      {
        id: `opp-lens-${Date.now()}-1`,
        title: `تطوير نظام أتمتة ذكي ولوحة قيادة تحليلية (${userProfile.title || 'Full-Stack'})`,
        platform: 'Upwork',
        budget: `$${(baseRate * 45).toLocaleString('en-US')} - $${(baseRate * 65).toLocaleString('en-US')}`,
        matchScore: 95,
        skills: userSkills.slice(0, 4),
        postedAt: 'منذ 15 دقيقة',
        clientRating: 4.95,
        description: `فرصة عمل مطابقة لتخصصك (${userProfile.title || 'مستشار تقني'}) تتطلب بناء منصة ويب عالية الأداء وربط واجهات برمجية متقدمة مع تسليم مرحلي خلال 3 أسابيع.`,
        saved: false,
      },
      {
        id: `opp-lens-${Date.now()}-2`,
        title: 'هندسة وتطوير بوابة عملاء تفاعلية مع ربط قواعد بيانات سحابية',
        platform: 'Fiverr Pro',
        budget: `$${(baseRate * 35).toLocaleString('en-US')}`,
        matchScore: 89,
        skills: userSkills.slice(0, 3),
        postedAt: 'منذ ساعة',
        clientRating: 4.88,
        description:
          'مطلوب مستقل محترف لإعادة هيكلة واجهة الاستخدام وتأمين قواعد البيانات السحابية مع توثيق فني واضح.',
        saved: false,
      },
    ];
    setOpportunities((prev) => [...tailored, ...prev]);
  };

  const handleScoutWritingAndTranslation = () => {
    const intent = resolveVoiceAgentTaskIntent(
      'ابحث لي عن عمل مناسب مثلاً لكتابة أو نسخ أو ترجمة محتوى'
    );
    const mapped: OpportunityItem[] = intent.generatedOpportunities.map(
      (item) => ({
        id: item.id,
        title: item.title,
        platform: (item.platform === 'Upwork' ||
        item.platform === 'Fiverr Pro' ||
        item.platform === 'Freelancer.com'
          ? item.platform
          : 'مشروع مباشر') as OpportunityItem['platform'],
        budget: item.budget,
        matchScore: item.matchScore,
        skills: item.requiredSkills,
        postedAt: item.postedAgo,
        clientRating: item.clientRating,
        description: item.description,
        saved: false,
      })
    );
    setOpportunities((prev) => [...mapped, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Multi-Filter Control Card */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#effaf4]">
              رادار استكشاف وإدارة فرص العمل الحر الحقيقية
            </h2>
            <p className="text-xs text-[#a4c2b4] mt-0.5">
              أضف فرص العمل الحقيقية التي تتابعها أو اطلب من لينز إيه آي ترشيح فرص مطابقة لمهاراتك
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddingOpp(!isAddingOpp)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2be38a] text-[#020504] font-bold text-xs hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فرصة عمل حقيقية</span>
            </button>

            <button
              type="button"
              onClick={handleScoutWritingAndTranslation}
              className="spring-btn flex items-center gap-2 px-3.5 py-2 rounded-full cool-glass-spotlight-bar text-white font-bold text-xs shadow-md"
            >
              <SiriOrbIcon size="xs" status="speaking" audioLevel={0.4} />
              <span>بحث Lens Voice: كتابة ونسخ وترجمة محتوى</span>
            </button>

            <button
              type="button"
              onClick={handleScoutWithLensAI}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-[#62d9ff] font-semibold text-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ترشيح فرص لمهاراتي عبر Lens AI</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-[#a4c2b4]">
              <SlidersHorizontal className="w-4 h-4 text-[#2be38a]" />
              <span>التوافق:</span>
              <input
                type="range"
                min={50}
                max={95}
                step={5}
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                aria-label="فلتر الحد الأدنى لنسبة التوافق"
                className="accent-[#2be38a] w-24"
              />
              <span className="font-mono font-bold text-[#2be38a] tabular-nums">
                &gt; {minMatchScore}%
              </span>
            </div>
          </div>
        </div>

        {isAddingOpp && (
          <form
            onSubmit={handleAddRealOpportunity}
            className="p-4 rounded-2xl liquid-glass-hot space-y-3 mt-3"
          >
            <div className="text-xs font-bold text-[#2be38a]">
              إدراج فرصة عمل حقيقية في رادارك للمتابعة والتحليل
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="عنوان الفرصة أو المشروع *"
                className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-[#effaf4] placeholder-[#6c8a7d]"
              />
              <div className="flex gap-2">
                <select
                  aria-label="المنصة"
                  value={newPlatform}
                  onChange={(e) =>
                    setNewPlatform(e.target.value as OpportunityItem['platform'])
                  }
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-[#effaf4]"
                >
                  <option value="Upwork">Upwork</option>
                  <option value="Fiverr Pro">Fiverr Pro</option>
                  <option value="Freelancer.com">Freelancer.com</option>
                  <option value="مشروع مباشر">مشروع مباشر</option>
                </select>
                <input
                  type="text"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="الميزانية ($)"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-[#effaf4] font-mono"
                />
              </div>
            </div>
            <textarea
              rows={2}
              required
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="الصق تفاصيل ومتطلبات الفرصة من العميل هنا..."
              className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-xs text-[#effaf4] placeholder-[#6c8a7d]"
            />
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                placeholder="المهارات المطلوبة مفصولة بفاصلة (اختياري)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-[#effaf4] placeholder-[#6c8a7d]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#2be38a] text-[#020504] font-bold text-xs"
              >
                حفظ الفرصة في الرادار
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-[#6c8a7d] absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالكلمات المفتاحية، التقنيات (React, Gemini, Firebase)..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#effaf4] placeholder-[#6c8a7d] focus:outline-none focus:border-[#2be38a]"
            />
          </div>

          <div className="md:col-span-5 flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-black/40 border border-white/10">
            {['all', 'Upwork', 'Fiverr Pro', 'Freelancer.com', 'مشروع مباشر'].map(
              (plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setSelectedPlatform(plat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedPlatform === plat
                      ? 'bg-[#2be38a] text-[#020504] font-bold'
                      : 'text-[#a4c2b4] hover:text-[#effaf4]'
                  }`}
                >
                  {plat === 'all' ? 'جميع المنصات' : plat}
                </button>
              )
            )}
          </div>
        </div>
      </GlassCard>

      {/* Opportunities Grid */}
      {filtered.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-4">
          <div className="text-base font-bold text-[#effaf4]">
            {opportunities.length === 0
              ? 'رادار الفرص نظيف وجاهز — أضف فرصة عمل حقيقية أو اطلب ترشيحات لينز إيه آي'
              : `لا توجد فرص تطابق معايير التصفية الحالية (> ${minMatchScore}%)`}
          </div>
          <p className="text-xs text-[#a4c2b4] max-w-md mx-auto">
            {opportunities.length === 0
              ? 'حسابك خالٍ من أي فرص أو مشاريع زائفة. يمكنك إضافة الفرص الحقيقية التي ترغب في التقديم عليها أو توليد فرص مطابقة لمهاراتك.'
              : 'جرب تخفيض الحد الأدنى للتوافق أو إعادة ضبط الفلاتر.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {opportunities.length === 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsAddingOpp(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#2be38a] text-[#020504] font-bold text-xs"
                >
                  + إضافة فرصة عمل حقيقية
                </button>
                <button
                  type="button"
                  onClick={handleScoutWithLensAI}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-[#62d9ff] font-bold text-xs"
                >
                  ترشيح فرص عبر لينز إيه آي
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMinMatchScore(70);
                  setSelectedPlatform('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-[#2be38a] text-[#020504] font-bold text-xs"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((opp) => (
            <GlassCard key={opp.id} className="p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#a4c2b4]">
                    <span className="font-semibold text-[#62d9ff]">
                      {opp.platform}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono font-bold text-[#2be38a]">
                      {opp.budget}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-[#ffc15a] font-mono">
                      <Star className="w-3 h-3 fill-[#ffc15a]" />
                      {opp.clientRating}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{opp.postedAt}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#effaf4] leading-snug">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-[#a4c2b4] leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                <MatchRing score={opp.matchScore} size={62} label="التوافق" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <div className="text-[11px] text-[#6c8a7d] font-mono">
                  {opp.skills.join(' · ')}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleSaveOpportunity(opp)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                      opp.saved
                        ? 'bg-[#ffc15a]/20 border-[#ffc15a]/40 text-[#ffc15a]'
                        : 'bg-white/[0.04] border-white/10 text-[#effaf4] hover:bg-white/[0.08]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{opp.saved ? 'تم الحفظ' : 'حفظ كمشروع'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectForAction({
                        id: opp.id,
                        ownerId: userProfile.uid,
                        title: opp.title,
                        description: opp.description,
                        platform: opp.platform,
                        budget: opp.budget,
                        deadline: '14 يوماً',
                        matchScore: opp.matchScore,
                        status: 'in_progress',
                        createdAt: new Date().toISOString().slice(0, 10),
                      });
                      onSelectView('proposal-studio');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-bold text-[#effaf4]"
                  >
                    <FilePenLine className="w-3.5 h-3.5 text-[#FFB84D]" />
                    <span>كتابة عرض وتنفيذ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAnalyzeOpportunity(opp)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2be38a] to-[#62d9ff] text-[#020504] font-bold text-xs hover:brightness-110 transition-all"
                  >
                    <ScanSearch className="w-3.5 h-3.5" />
                    <span>تحليل وتنفيذ المشروع</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

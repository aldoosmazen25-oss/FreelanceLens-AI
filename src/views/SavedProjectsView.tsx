import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Kanban,
  Table,
  Plus,
  Trash2,
  ScanSearch,
  FilePenLine,
  GripVertical,
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { MatchRing } from '../components/common/MatchRing';
import { StatusBadge } from '../components/common/StatusBadge';
import { useData } from '../context/DataContext';
import { ProjectStatus, SavedProject, ViewId } from '../types';
import { useMotionSystem, EASE_OUT_EXPO } from '../utils/motionVariants';

interface SavedProjectsViewProps {
  onSelectView: (view: ViewId) => void;
}

const KANBAN_COLUMNS: Array<{ id: ProjectStatus; label: string; color: string }> = [
  { id: 'new', label: 'طلبات جديدة', color: 'border-[#62d9ff]/30' },
  { id: 'analyzed', label: 'تم التحليل بـ AI', color: 'border-[#2be38a]/30' },
  { id: 'proposed', label: 'تم تقديم العرض', color: 'border-[#ffc15a]/30' },
  { id: 'waiting', label: 'انتظار رد العميل', color: 'border-white/20' },
  { id: 'in_progress', label: 'قيد التنفيذ', color: 'border-[#2be38a]/50' },
  { id: 'completed', label: 'مكتمل', color: 'border-white/15' },
  { id: 'archived', label: 'مؤرشف', color: 'border-white/10' },
];

export const SavedProjectsView: React.FC<SavedProjectsViewProps> = ({
  onSelectView,
}) => {
  const {
    projects,
    updateProjectStatus,
    deleteProject,
    setSelectedProjectForAction,
    addNotification,
  } = useData();
  const { reducedMotion } = useMotionSystem();

  const [displayMode, setDisplayMode] = useState<'kanban' | 'table'>('kanban');
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ProjectStatus | null>(null);

  const handleOpenInAnalyzer = (proj: SavedProject) => {
    setSelectedProjectForAction(proj);
    onSelectView('project-analyzer');
  };

  const handleOpenInProposal = (proj: SavedProject) => {
    setSelectedProjectForAction(proj);
    onSelectView('proposal-studio');
  };

  const handleStatusChangeWithFeedback = async (
    proj: SavedProject,
    newStatus: ProjectStatus
  ) => {
    if (proj.status === newStatus) return;
    const prevStatus = proj.status;
    const targetCol = KANBAN_COLUMNS.find((c) => c.id === newStatus);

    try {
      await updateProjectStatus(proj.id, newStatus);
      addNotification({
        title: 'تم تحديث مرحلة المشروع',
        message: `تم نقل "${proj.title}" إلى "${targetCol?.label || newStatus}".`,
        type: 'success',
      });
    } catch {
      await updateProjectStatus(proj.id, prevStatus);
      addNotification({
        title: 'تعذر حفظ تغيير الحالة',
        message: `تمت استعادة "${proj.title}" إلى مرحلته السابقة.`,
        type: 'error',
      });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, projectId: string) => {
    setDraggedProjectId(projectId);
    e.dataTransfer.setData('text/plain', projectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverColumn = (
    e: React.DragEvent<HTMLDivElement>,
    colId: ProjectStatus
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDropOnColumn = async (
    e: React.DragEvent<HTMLDivElement>,
    colId: ProjectStatus
  ) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain') || draggedProjectId;
    setDragOverColumn(null);
    setDraggedProjectId(null);

    if (!projectId) return;
    const proj = projects.find((p) => p.id === projectId);
    if (!proj || proj.status === colId) return;

    await handleStatusChangeWithFeedback(proj, colId);
  };

  const handleDragEnd = () => {
    setDraggedProjectId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <GlassCard hoverable={false} className="p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#effaf4]">
            إدارة وتتبع مسار المشاريع (Project Pipeline & Kanban)
          </h2>
          <p className="text-xs text-[#a4c2b4] mt-0.5">
            اسحب البطاقات وأفلتها بين المراحل السبع أو استخدم القائمة المنسدلة لتحديث حالة كل عقد فوراً
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Kanban vs Table */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => setDisplayMode('kanban')}
              className={`spring-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                displayMode === 'kanban'
                  ? 'bg-[#2be38a] text-[#020504] font-bold'
                  : 'text-[#a4c2b4] hover:text-[#effaf4]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>لوحة كانبان (Kanban)</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('table')}
              className={`spring-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                displayMode === 'table'
                  ? 'bg-[#2be38a] text-[#020504] font-bold'
                  : 'text-[#a4c2b4] hover:text-[#effaf4]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>عرض الجدول (Table)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSelectView('project-analyzer')}
            className="spring-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2be38a] to-[#62d9ff] text-[#020504] font-bold text-xs hover:brightness-110 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة وتحليل مشروع</span>
          </button>
        </div>
      </GlassCard>

      {/* Kanban Board Mode */}
      {displayMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {KANBAN_COLUMNS.map((col) => {
            const colProjects = projects.filter((p) => p.status === col.id);
            const isDragOver = dragOverColumn === col.id;
            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOverColumn(e, col.id)}
                onDragLeave={() => {
                  if (dragOverColumn === col.id) setDragOverColumn(null);
                }}
                onDrop={(e) => handleDropOnColumn(e, col.id)}
                className={`rounded-2xl border p-4 space-y-3 min-h-[260px] transition-all duration-200 ${
                  isDragOver
                    ? 'bg-[#2be38a]/[0.07] border-[#2be38a] shadow-[0_0_28px_rgba(43,227,138,0.18)]'
                    : 'bg-white/[0.025] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                  <span className="text-xs font-bold text-[#effaf4]">
                    {col.label}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#2be38a] tabular-nums px-2 py-0.5 rounded-full bg-[#2be38a]/10 border border-[#2be38a]/25">
                    {colProjects.length}
                  </span>
                </div>

                {colProjects.length === 0 ? (
                  <div
                    className={`py-10 rounded-xl border border-dashed text-center text-[11px] transition-colors ${
                      isDragOver
                        ? 'border-[#2be38a]/60 text-[#2be38a] bg-[#2be38a]/5'
                        : 'border-white/5 text-[#6c8a7d]'
                    }`}
                  >
                    {isDragOver
                      ? 'أفلت البطاقة هنا لنقل المشروع'
                      : 'لا توجد مشاريع في هذه المرحلة'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {colProjects.map((proj) => {
                        const isDragging = draggedProjectId === proj.id;
                        return (
                          <motion.div
                            key={proj.id}
                            layout
                            initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
                            animate={{
                              opacity: isDragging ? 0.55 : 1,
                              y: 0,
                              scale: isDragging ? 0.98 : 1,
                              transition: {
                                duration: reducedMotion ? 0.01 : 0.2,
                                ease: EASE_OUT_EXPO,
                              },
                            }}
                            exit={{
                              opacity: 0,
                              scale: reducedMotion ? 1 : 0.95,
                              transition: { duration: reducedMotion ? 0.01 : 0.15 },
                            }}
                            draggable
                            onDragStart={(e) =>
                              handleDragStart(
                                e as unknown as React.DragEvent<HTMLDivElement>,
                                proj.id
                              )
                            }
                            onDragEnd={handleDragEnd}
                            className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-[#2be38a]/35 transition-colors space-y-3 cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-1.5 min-w-0">
                                <GripVertical
                                  aria-hidden="true"
                                  className="w-3.5 h-3.5 text-[#6c8a7d] shrink-0 mt-1"
                                />
                                <div className="space-y-1 min-w-0">
                                  <div className="text-[11px] text-[#62d9ff] font-medium">
                                    {proj.platform} ·{' '}
                                    <span
                                      dir="ltr"
                                      className="inline-block font-mono text-[#6c8a7d]"
                                    >
                                      {proj.createdAt}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-bold text-[#effaf4] leading-snug">
                                    {proj.title}
                                  </h4>
                                </div>
                              </div>
                              <MatchRing
                                score={proj.matchScore}
                                size={44}
                                strokeWidth={4}
                              />
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span
                                dir="ltr"
                                className="inline-block font-mono text-[#2be38a] font-bold tabular-nums"
                              >
                                {proj.budget}
                              </span>
                              <span className="text-[#a4c2b4] text-[11px]">
                                {proj.deadline}
                              </span>
                            </div>

                            {/* Accessible Status Dropdown Alternative to Drag-and-Drop */}
                            <div>
                              <select
                                aria-label={`تغيير حالة المشروع ${proj.title}`}
                                value={proj.status}
                                onChange={(e) =>
                                  handleStatusChangeWithFeedback(
                                    proj,
                                    e.target.value as ProjectStatus
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-[11px] text-[#effaf4] focus:outline-none focus:border-[#2be38a]"
                              >
                                {KANBAN_COLUMNS.map((opt) => (
                                  <option
                                    key={opt.id}
                                    value={opt.id}
                                    className="bg-[#030706]"
                                  >
                                    المرحلة: {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/5">
                              <button
                                type="button"
                                onClick={() => handleOpenInAnalyzer(proj)}
                                className="spring-btn flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] text-[#effaf4]"
                              >
                                <ScanSearch className="w-3 h-3 text-[#2be38a]" />
                                <span>تحليل</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenInProposal(proj)}
                                className="spring-btn flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] text-[#effaf4]"
                              >
                                <FilePenLine className="w-3 h-3 text-[#62d9ff]" />
                                <span>العرض</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteProject(proj.id);
                                  addNotification({
                                    title: 'تم حذف المشروع',
                                    message: `تمت إزالة "${proj.title}" من مسار المشاريع.`,
                                    type: 'info',
                                  });
                                }}
                                aria-label={`حذف المشروع ${proj.title}`}
                                className="spring-btn p-1.5 rounded-lg text-[#6c8a7d] hover:text-[#ff6b7f] hover:bg-[#ff6b7f]/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View Mode */
        <GlassCard hoverable={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/[0.04] border-b border-white/10 text-[#a4c2b4]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">عنوان المشروع</th>
                  <th className="py-3.5 px-4 font-semibold">المنصة</th>
                  <th className="py-3.5 px-4 font-semibold">الميزانية</th>
                  <th className="py-3.5 px-4 font-semibold">التوافق</th>
                  <th className="py-3.5 px-4 font-semibold">الحالة</th>
                  <th className="py-3.5 px-4 font-semibold">تاريخ الإضافة</th>
                  <th className="py-3.5 px-4 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.map((proj) => (
                  <tr
                    key={proj.id}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#effaf4] max-w-xs truncate">
                      {proj.title}
                    </td>
                    <td className="py-3.5 px-4 text-[#62d9ff]">{proj.platform}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2be38a] tabular-nums">
                      {proj.budget}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#effaf4] tabular-nums">
                      {proj.matchScore}%
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={proj.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#a4c2b4] tabular-nums">
                      {proj.createdAt}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenInAnalyzer(proj)}
                          className="spring-btn px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#effaf4]"
                        >
                          تحليل
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenInProposal(proj)}
                          className="spring-btn px-2.5 py-1 rounded-lg bg-[#2be38a]/20 text-[#2be38a] font-semibold"
                        >
                          عرض سعر
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

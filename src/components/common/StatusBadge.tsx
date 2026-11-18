import React from 'react';
import { ProjectStatus } from '../../types';

interface StatusBadgeProps {
  status: ProjectStatus | string;
}

const STATUS_MAP: Record<
  string,
  { label: string; colorClass: string }
> = {
  new: {
    label: 'طلب جديد',
    colorClass: 'text-[#62d9ff]',
  },
  analyzed: {
    label: 'تم التحليل بـ AI',
    colorClass: 'text-[#2be38a]',
  },
  proposed: {
    label: 'تم تقديم العرض',
    colorClass: 'text-[#ffc15a]',
  },
  waiting: {
    label: 'بانتظار رد العميل',
    colorClass: 'text-[#a4c2b4]',
  },
  in_progress: {
    label: 'قيد التنفيذ',
    colorClass: 'text-[#2be38a]',
  },
  completed: {
    label: 'مكتمل بنجاح',
    colorClass: 'text-[#effaf4]',
  },
  archived: {
    label: 'مؤرشف',
    colorClass: 'text-[#6c8a7d]',
  },
  received: {
    label: 'دفعة مستلمة',
    colorClass: 'text-[#2be38a]',
  },
  pending: {
    label: 'دفعة معلقة',
    colorClass: 'text-[#ffc15a]',
  },
  won: {
    label: 'عرض فائز',
    colorClass: 'text-[#2be38a]',
  },
  replied: {
    label: 'رد العميل',
    colorClass: 'text-[#62d9ff]',
  },
  sent: {
    label: 'عرض مرسل',
    colorClass: 'text-[#ffc15a]',
  },
  lost: {
    label: 'غير مقبول',
    colorClass: 'text-[#ff6b7f]',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const item = STATUS_MAP[status] || {
    label: status,
    colorClass: 'text-[#a4c2b4]',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${item.colorClass}`}>
      <span>{item.label}</span>
    </span>
  );
};

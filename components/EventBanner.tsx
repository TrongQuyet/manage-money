
import React from 'react';
import { OrgEvent } from '../types';
import { CalendarCheck, ArrowRight, X } from 'lucide-react';

interface Props {
  pendingEvents: OrgEvent[];
  onNavigate: () => void;
  onDismiss: () => void;
}

const EventBanner: React.FC<Props> = ({ pendingEvents, onNavigate, onDismiss }) => {
  if (pendingEvents.length === 0) return null;

  return (
    <div className="mx-0 mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
          <CalendarCheck size={18} />
        </div>
        <p className="text-sm font-semibold text-amber-800">
          Có <span className="font-black">{pendingEvents.length}</span> sự kiện đang chờ bạn bình chọn!
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onNavigate}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3.5 py-2 rounded-xl transition-all active:scale-95"
        >
          Xem ngay <ArrowRight size={13} />
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 text-amber-400 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-all"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default EventBanner;

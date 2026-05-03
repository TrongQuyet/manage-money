
import React from 'react';
import { OrgEvent } from '../types';
import { CalendarCheck, MapPin, ArrowRight, X } from 'lucide-react';

interface Props {
  pendingEvents: OrgEvent[];
  onNavigate: () => void;
  onClose: () => void;
}

const SESSION_KEY = 'event_notification_shown';

export const shouldShowNotification = (): boolean =>
  !sessionStorage.getItem(SESSION_KEY);

export const markNotificationShown = (): void =>
  sessionStorage.setItem(SESSION_KEY, '1');

const EventNotificationModal: React.FC<Props> = ({ pendingEvents, onNavigate, onClose }) => {
  if (pendingEvents.length === 0) return null;

  const preview = pendingEvents.slice(0, 3);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-amber-500 to-orange-500 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/15 hover:bg-white/25 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
          <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-3">
            <CalendarCheck size={28} />
          </div>
          <h3 className="text-xl font-black">Sự kiện mới!</h3>
          <p className="text-amber-100 text-sm mt-1">
            Có {pendingEvents.length} sự kiện đang chờ bạn bình chọn
          </p>
        </div>

        {/* Event list */}
        <div className="p-5 space-y-2">
          {preview.map(event => (
            <div key={event.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-gray-100">
              <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <CalendarCheck size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-snug truncate">{event.title}</p>
                {event.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <MapPin size={10} /><span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {pendingEvents.length > 3 && (
            <p className="text-xs text-gray-400 text-center pt-1">
              và {pendingEvents.length - 3} sự kiện khác...
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors border border-gray-200 text-sm"
          >
            Bỏ qua
          </button>
          <button
            onClick={onNavigate}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-200 text-sm active:scale-95 flex items-center justify-center gap-1.5"
          >
            Vote ngay <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventNotificationModal;

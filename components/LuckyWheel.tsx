
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Member } from '../types';
import { X, RotateCw, Trophy, RefreshCw } from 'lucide-react';

interface LuckyWheelProps {
  members: Member[];
}

const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1',
  '#84cc16', '#a855f7', '#0ea5e9', '#fb923c', '#e11d48',
];

const SPIN_DURATION = 4000;

export default function LuckyWheel({ members }: LuckyWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [slots, setSlots] = useState<Member[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Member | null>(null);
  const [rotation, setRotation] = useState(0);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startRotRef = useRef(0);
  const targetRotRef = useRef(0);

  useEffect(() => {
    setSlots(members);
  }, [members]);

  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = cx - 4;
    const n = slots.length;

    ctx.clearRect(0, 0, size, size);

    if (n === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Không có thành viên', cx, cy);
      return;
    }

    const slice = (Math.PI * 2) / n;

    for (let i = 0; i < n; i++) {
      const start = angle + i * slice;
      const end = start + slice;

      // Sector
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${n > 10 ? 11 : 13}px Inter, sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 3;
      ctx.fillText(slots[i].name, radius - 10, 4);
      ctx.restore();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [slots]);

  useEffect(() => {
    drawWheel(rotation);
  }, [drawWheel, rotation]);

  const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

  const spin = () => {
    if (spinning || slots.length < 2) return;

    setWinner(null);
    setSpinning(true);

    // Pick winner deterministically
    const winnerIdx = Math.floor(Math.random() * slots.length);
    const slice = (Math.PI * 2) / slots.length;

    // Target rotation: pointer is at top (−π/2), so winner sector center should land there
    const winnerAngle = winnerIdx * slice + slice / 2;
    const fullSpins = (6 + Math.floor(Math.random() * 4)) * Math.PI * 2;
    const normalizedCurrent = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const targetAngle = fullSpins + (Math.PI * 2 - winnerAngle) - normalizedCurrent;

    startRotRef.current = rotation;
    targetRotRef.current = rotation + targetAngle;
    startTimeRef.current = null;

    const animate = (ts: number) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const eased = easeOut(progress);
      const currentRot = startRotRef.current + (targetRotRef.current - startRotRef.current) * eased;
      setRotation(currentRot);
      drawWheel(currentRot);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setWinner(slots[winnerIdx]);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const removeSlot = (id: number) => {
    if (spinning) return;
    setSlots(prev => prev.filter(m => m.id !== id));
    setWinner(null);
  };

  const resetSlots = () => {
    if (spinning) return;
    setSlots(members);
    setWinner(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Vòng quay may mắn</h1>
        <p className="text-gray-500 text-sm mt-1">Xóa thành viên khỏi danh sách nếu cần, rồi nhấn quay.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Wheel */}
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <div className="relative">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[22px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-md" />
            </div>
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              className="rounded-full shadow-2xl"
            />
          </div>

          <button
            onClick={spin}
            disabled={spinning || slots.length < 2}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <RotateCw size={18} className={spinning ? 'animate-spin' : ''} />
            {spinning ? 'Đang quay...' : 'Quay ngay!'}
          </button>
        </div>

        {/* Right panel */}
        <div className="flex-1 space-y-4 w-full">
          {/* Winner banner */}
          {winner && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Trophy size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Người may mắn</p>
                <p className="text-lg font-bold text-amber-800">{winner.name}</p>
                {winner.email && <p className="text-sm text-amber-600">{winner.email}</p>}
              </div>
            </div>
          )}

          {/* Member list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-700">
                Danh sách ({slots.length} thành viên)
              </span>
              {slots.length < members.length && (
                <button
                  onClick={resetSlots}
                  disabled={spinning}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
                >
                  <RefreshCw size={12} />
                  Khôi phục
                </button>
              )}
            </div>

            {slots.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                Không còn thành viên nào. Nhấn "Khôi phục" để bắt đầu lại.
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {slots.map((m, i) => (
                  <li key={m.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{m.name}</p>
                      {m.email && <p className="text-xs text-gray-400 truncate">{m.email}</p>}
                    </div>
                    <button
                      onClick={() => removeSlot(m.id)}
                      disabled={spinning}
                      className="p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Xóa khỏi vòng quay"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

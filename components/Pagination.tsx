
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    }
  }

  const items: (number | 'ellipsis')[] = [];
  let prev: number | null = null;
  for (const page of pages) {
    if (prev !== null && page - prev > 1) items.push('ellipsis');
    items.push(page);
    prev = page;
  }

  return (
    <div className="flex items-center justify-center gap-1.5 px-4 py-3 border-t border-gray-50">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={16} />
      </button>
      {items.map((item, i) =>
        item === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-1.5 text-gray-400 text-sm select-none">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
              item === currentPage
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                : 'text-gray-500 hover:bg-slate-100 hover:text-gray-800'
            }`}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;

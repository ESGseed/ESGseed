import { FileText } from 'lucide-react';
import type { PreviewCard as PreviewCardType } from '@/lib/data/esg';
import { PreviewCard } from './PreviewCard';

interface PreviewPanelProps {
  cards: PreviewCardType[];
}

export function PreviewPanel({ cards }: PreviewPanelProps) {
  return (
    <div className="w-[45%] bg-gray-50 p-6 overflow-y-auto hidden lg:block shadow-[inset_6px_0px_15px_-6px_rgba(0,0,0,0.05)]">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-gray-500" />
        실시간 보고서 문단 프리뷰
      </h2>
      <div className="space-y-6">
        {cards.map((card) => (
          <PreviewCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}


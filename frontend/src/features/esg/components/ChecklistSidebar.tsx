import type { ChecklistItem } from '@/lib/data/esg';
import { StatusIcon } from './StatusIcon';

interface ChecklistSidebarProps {
  items: ChecklistItem[];
}

export function ChecklistSidebar({ items }: ChecklistSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
      <div className="p-5 border-b border-gray-100">
        <h2 className="font-semibold text-gray-700 mb-1">IFRS S2 필수 정보 체크리스트</h2>
        <p className="text-xs text-gray-400">진행률 25%</p>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 group cursor-pointer">
            <StatusIcon status={item.status} />
            <span className={`text-sm leading-tight ${
              item.status === 'completed' ? 'text-green-700' :
              item.status === 'missing' ? 'text-red-600 font-medium' : 'text-gray-600'
            }`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


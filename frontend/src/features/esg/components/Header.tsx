import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Header() {
  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3 shadow-sm z-10">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">AI ESG Consultant</h1>
        <Badge>Prototype</Badge>
      </div>
      <div className="text-sm text-gray-500">보고서 버전: v1.0 (초안)</div>
    </header>
  );
}


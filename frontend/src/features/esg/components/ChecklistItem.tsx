import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface ChecklistItemProps {
  status: 'complete' | 'in-progress' | 'incomplete';
  text: string;
}

export function ChecklistItem({ status, text }: ChecklistItemProps) {
  const getIcon = () => {
    switch (status) {
      case 'complete':
        return (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="text-emerald-600" size={14} />
          </div>
        );
      case 'in-progress':
        return (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertCircle className="text-amber-600" size={14} />
          </div>
        );
      case 'incomplete':
        return (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <XCircle className="text-gray-400" size={14} />
          </div>
        );
    }
  };

  const getContainerClass = () => {
    switch (status) {
      case 'complete':
        return 'bg-emerald-50/50 border-emerald-200';
      case 'in-progress':
        return 'bg-amber-50/50 border-amber-200';
      case 'incomplete':
        return 'bg-gray-50/50 border-gray-200';
    }
  };

  const getTextClass = () => {
    switch (status) {
      case 'complete':
        return 'text-emerald-900 font-medium';
      case 'in-progress':
        return 'text-amber-900 font-medium';
      case 'incomplete':
        return 'text-gray-600';
    }
  };

  return (
    <li className={`flex items-center gap-3 p-3 rounded-lg border ${getContainerClass()} transition-all hover:shadow-sm`}>
      {getIcon()}
      <span className={`text-sm ${getTextClass()}`}>{text}</span>
    </li>
  );
}


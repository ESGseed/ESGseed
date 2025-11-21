import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { ChecklistStatus } from '@/lib/data/esg';

interface StatusIconProps {
  status: ChecklistStatus;
}

export function StatusIcon({ status }: StatusIconProps) {
  if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />;
  if (status === 'in-progress') return <Clock className="w-4 h-4 text-yellow-500 mt-0.5" />;
  if (status === 'missing') return <XCircle className="w-4 h-4 text-red-500 mt-0.5" />;
  return null;
}


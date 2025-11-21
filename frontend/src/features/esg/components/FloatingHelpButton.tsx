"use client";

import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingHelpButton() {
  return (
    <Button
      className="fixed bottom-6 right-6 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-105 z-50"
      size="icon"
    >
      <HelpCircle className="w-6 h-6" />
    </Button>
  );
}


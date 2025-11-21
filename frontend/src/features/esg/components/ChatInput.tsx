"use client";

import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { esgApi } from '@/lib/api';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function ChatInput({ value, onChange, onSend }: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  };

  const handleSendClick = async () => {
    console.log('Send button clicked');
    
    try {
      // ESG 체크리스트 항목 조회
      const response = await esgApi.getChecklistItems();
      console.log('ESG Checklist Items:', response);
    } catch (error) {
      console.error('Failed to fetch ESG checklist items:', error);
    }
    
    onSend();
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all bg-white shadow-sm">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="AI의 질문에 답변하거나, 궁금한 점을 입력하세요... (예: 이 문장은 S2-7에 맞나요?)"
          className="flex-1 border-0 outline-none text-sm py-1 focus-visible:ring-0"
        />
        <Button
          onClick={handleSendClick}
          size="icon"
          className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}


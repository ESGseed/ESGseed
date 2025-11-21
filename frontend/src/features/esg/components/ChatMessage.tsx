import { MessageSquare } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/lib/data/esg';
import { Badge } from '@/components/ui/badge';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.type === 'system') {
    return (
      <div className="w-full flex justify-center my-2">
        <Badge variant="secondary">{message.text}</Badge>
      </div>
    );
  }

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
        {message.sender === 'ai' && (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
        )}
        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
          message.sender === 'user'
            ? 'bg-blue-100 text-blue-900 rounded-tr-none'
            : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
        }`}>
          {message.sender === 'ai' && (
            <div className="text-xs font-semibold text-blue-600 mb-1">AI ESG Consultant</div>
          )}
          {message.sender === 'user' && (
            <div className="text-xs font-semibold text-blue-800 mb-1 text-right">사용자</div>
          )}
          {message.text}
        </div>
      </div>
    </div>
  );
}


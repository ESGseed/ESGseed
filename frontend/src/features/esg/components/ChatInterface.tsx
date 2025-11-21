"use client";

import { useRef, useEffect } from 'react';
import type { ChatMessage as ChatMessageType } from '@/lib/data/esg';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

export function ChatInterface({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-w-[400px] border-r border-gray-200">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={onSendMessage}
      />
    </div>
  );
}


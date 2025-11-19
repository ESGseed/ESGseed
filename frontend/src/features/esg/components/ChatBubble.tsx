import { User, Sparkles } from 'lucide-react';

interface ChatBubbleProps {
  type: 'ai' | 'user' | 'system';
  children: React.ReactNode;
}

export function ChatBubble({ type, children }: ChatBubbleProps) {
  if (type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-4 py-2 rounded-full text-xs font-medium border border-emerald-200 shadow-sm">
          {children}
        </div>
      </div>
    );
  }

  if (type === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="flex items-start gap-2 max-w-2xl">
          <div className="flex flex-col items-end">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-2xl rounded-br-md shadow-lg">
              <div className="text-sm leading-relaxed">{children}</div>
            </div>
            <span className="text-xs text-gray-500 mt-1 mr-1">사용자</span>
          </div>
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
            <User className="text-white" size={16} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
        <Sparkles className="text-white" size={18} />
      </div>
      <div className="flex-1 max-w-2xl">
        <div className="bg-white border border-emerald-100 p-5 rounded-2xl rounded-tl-md shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
              AI ESG Consultant
            </span>
          </div>
          <div className="text-gray-700 text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}


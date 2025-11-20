import { MessageSquare, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  showExportButtons: boolean;
  onExportPDF: () => void;
  onExportWord: () => void;
}

export function Header({ showExportButtons, onExportPDF, onExportWord }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm w-full z-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 및 타이틀 */}
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <MessageSquare className="text-white" size={24} />
            </div>
            <h1 className="text-xl text-gray-800">AI ESG Consultant</h1>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              Prototype
            </span>
          </div>

          {/* 버전 및 내보내기 버튼 */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              보고서 버전: v1.0 (초안)
            </span>
            {showExportButtons && (
              <>
                <Button
                  onClick={onExportPDF}
                  className="text-sm bg-red-600 text-white px-4 py-2 hover:bg-red-700"
                >
                  <FileDown className="mr-1.5" size={18} />
                  <span>PDF 내보내기</span>
                </Button>
                <Button
                  onClick={onExportWord}
                  className="text-sm bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
                >
                  <FileDown className="mr-1.5" size={18} />
                  <span>Word 내보내기</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


import { FileDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EsgHeaderProps {
  showExportButtons: boolean;
  onExportPDF: () => void;
  onExportWord: () => void;
}

export function EsgHeader({ showExportButtons, onExportPDF, onExportWord }: EsgHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-b border-emerald-200/50 shadow-md w-full z-10 backdrop-blur-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* 로고 및 타이틀 */}
          <div className="flex items-center space-x-3">
            <Link href="/esg" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  AI ESG Consultant
                </h1>
                <p className="text-xs text-emerald-600 font-medium">IFRS S2 기반 보고서 생성</p>
              </div>
            </Link>
            <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-200">
              Prototype
            </span>
          </div>

          {/* 버전 및 내보내기 버튼 */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-emerald-200/50">
              <span className="text-xs text-emerald-700 font-medium">버전</span>
              <span className="text-sm font-semibold text-emerald-900">v1.0</span>
              <span className="text-xs text-emerald-600">(초안)</span>
            </div>
            {showExportButtons && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={onExportPDF}
                  className="text-sm bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all rounded-lg font-medium"
                >
                  <FileDown className="mr-2" size={18} />
                  <span>PDF</span>
                </Button>
                <Button
                  onClick={onExportWord}
                  className="text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all rounded-lg font-medium"
                >
                  <FileDown className="mr-2" size={18} />
                  <span>Word</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


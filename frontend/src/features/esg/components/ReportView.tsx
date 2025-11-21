import { FileText, FileDown } from 'lucide-react';
import type { ReportSection as ReportSectionType } from '@/lib/data/esg';
import { ReportSection } from './ReportSection';
import { Button } from '@/components/ui/button';

interface ReportViewProps {
  sections: ReportSectionType[];
}

export function ReportView({ sections }: ReportViewProps) {
  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto my-8 p-0">
        {/* Toolbar */}
        <div className="flex justify-end gap-3 mb-6 px-8">
          <Button variant="destructive" size="default">
            <FileDown className="w-4 h-4" /> PDF 내보내기
          </Button>
          <Button variant="default" size="default">
            <FileText className="w-4 h-4" /> Word 내보내기
          </Button>
        </div>

        {/* Document Paper */}
        <div className="bg-white shadow-lg min-h-[29.7cm] p-[2.54cm] mx-8 mb-12 text-gray-900 rounded-sm">
          <div className="border-b-2 border-gray-800 pb-6 mb-10">
            <h1 className="text-3xl font-bold mb-2">연간 기후 공시 보고서 (IFRS S2 기반)</h1>
            <p className="text-gray-500 text-sm">본 보고서는 AI ESG Consultant와의 대화형 정보 수집 및 검증을 통해 생성되었습니다. (버전: v1.0)</p>
          </div>

          <div className="space-y-10">
            {sections.map((section, idx) => (
              <ReportSection key={idx} section={section} />
            ))}
          </div>

          {/* Footer mockup */}
          <div className="mt-20 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            ESG Climate Disclosure Report • Confidential • Page 1
          </div>
        </div>
      </div>
    </div>
  );
}


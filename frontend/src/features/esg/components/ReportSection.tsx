import type { ReportSection as ReportSectionType } from '@/lib/data/esg';

interface ReportSectionProps {
  section: ReportSectionType;
}

export function ReportSection({ section }: ReportSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
        {section.title}
      </h2>
      <div className="text-base leading-8 text-gray-700 whitespace-pre-line text-justify">
        {section.content}
      </div>
    </section>
  );
}


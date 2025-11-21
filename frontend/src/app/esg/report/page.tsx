import { ReportView } from '@/features/esg/components/ReportView';
import { FINAL_REPORT_CONTENT } from '@/lib/data/esg';

export default function Page() {
    return <ReportView sections={FINAL_REPORT_CONTENT} />;
}


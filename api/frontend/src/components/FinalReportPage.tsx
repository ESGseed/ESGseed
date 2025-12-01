import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Download, Eye, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useReportStore, ReportStore, PreviewSection, ChartData } from '@/store/reportStore';
import { pdf } from '@react-pdf/renderer';
import { ESGReportDocument } from '@/components/pdf/ESGReportDocument';

export function FinalReportPage() {
  const companyInfo = useReportStore((state: ReportStore) => state.finalCompanyInfo); // finalCompanyInfo 사용
  const reportMetadata = useReportStore((state: ReportStore) => state.reportMetadata);
  const contentSections = useReportStore((state: ReportStore) => state.contentSections);
  const charts = useReportStore((state: ReportStore) => state.charts);
  const renewableTable = useReportStore((state: ReportStore) => state.renewableTable);
  const removeContentSection = useReportStore((state: ReportStore) => state.removeContentSection);
  const removeChart = useReportStore((state: ReportStore) => state.removeChart);
  const setChecklistItems = useReportStore((state: ReportStore) => state.setChecklistItems);
  const setChatMessages = useReportStore((state: ReportStore) => state.setChatMessages);
  const setRenewableTable = useReportStore((state: ReportStore) => state.setRenewableTable);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportSections] = useState([
    { id: 'company', title: '회사정보', status: 'completed', progress: 100 },
    { id: 'strategy', title: '지속가능경영 전략', status: 'completed', progress: 100 },
    { id: 'environmental', title: '환경 성과', status: 'in-progress', progress: 75 },
    { id: 'social', title: '사회적 책임', status: 'in-progress', progress: 60 },
    { id: 'governance', title: '지배구조', status: 'pending', progress: 30 },
    { id: 'performance', title: '성과 지표', status: 'pending', progress: 20 },
    { id: 'future', title: '향후 계획', status: 'pending', progress: 10 }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">완료</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">진행중</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">대기중</Badge>;
    }
  };

  const overallProgress = Math.round(
    reportSections.reduce((sum, section) => sum + section.progress, 0) / reportSections.length
  );

  // PDF 다운로드 핸들러
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      console.log('=== PDF 생성 시작 ===');
      console.log('CompanyInfo 데이터:', companyInfo);
      console.log('ContentSections 데이터:', contentSections);
      console.log('Charts 데이터:', charts);
      console.log('ReportMetadata:', reportMetadata);

      // 데이터 검증
      if (!companyInfo) {
        alert('⚠️ 회사 정보가 최종 제출되지 않았습니다.\n\nCompanyInfoPage에서:\n1. 모든 정보를 입력\n2. "회사정보 저장" 버튼 클릭\n3. "최종 보고서에 제출" 버튼 클릭\n\n위 단계를 완료한 후 PDF를 생성해주세요.');
        setIsGeneratingPDF(false);
        return;
      }

      const blob = await pdf(
        <ESGReportDocument
          companyInfo={companyInfo}
          reportMetadata={reportMetadata}
          contentSections={contentSections}
          charts={charts}
          renewableTable={renewableTable}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${companyInfo?.companyName || '지속가능경영보고서'}_${reportMetadata.reportYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('=== PDF 생성 완료 ===');
      alert(`PDF가 성공적으로 다운로드되었습니다!\n\n포함된 데이터:\n- 회사정보: ${companyInfo ? '✓' : '✗'}\n- AI 생성 문단: ${contentSections.length}개\n- 저장된 차트: ${charts.length}개`);
      
      // PDF 다운로드 성공 후 데이터 초기화 (회사정보는 유지)
      // contentSections 초기화
      contentSections.forEach((section: PreviewSection) => {
        removeContentSection(section.id);
      });
      // charts 초기화
      charts.forEach((chart: ChartData) => {
        removeChart(chart.id);
      });
      // 재생에너지 표 초기화
      setRenewableTable([]);
      // 체크리스트 및 채팅 메시지 초기화
      setChecklistItems([]);
      setChatMessages([]);
      console.log('✅ 회사정보를 제외한 모든 데이터가 초기화되었습니다.');
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary rounded-2xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">최종보고서</h1>
          <p className="text-lg text-muted-foreground">
            작성된 내용을 종합하여 완성된 지속가능경영 보고서를 생성하고 다운로드하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 보고서 진행 상황 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 전체 진행률 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">보고서 완성도</CardTitle>
                <CardDescription>
                  전체 섹션의 작성 진행 상황입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary mb-2">{overallProgress}%</div>
                  <Progress value={overallProgress} className="w-full" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-semibold text-green-600">
                      {reportSections.filter(s => s.status === 'completed').length}
                    </div>
                    <div className="text-muted-foreground">완료</div>
                  </div>
                  <div>
                    <div className="font-semibold text-yellow-600">
                      {reportSections.filter(s => s.status === 'in-progress').length}
                    </div>
                    <div className="text-muted-foreground">진행중</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-500">
                      {reportSections.filter(s => s.status === 'pending').length}
                    </div>
                    <div className="text-muted-foreground">대기중</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 섹션별 상태 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">섹션별 진행 상황</CardTitle>
                <CardDescription>
                  각 섹션의 작성 상태를 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportSections.map((section, index) => (
                    <div key={section.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(section.status)}
                          <span className="text-sm font-medium">{section.title}</span>
                        </div>
                        {getStatusBadge(section.status)}
                      </div>
                      <Progress value={section.progress} className="h-2" />
                      {index < reportSections.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 액션 버튼 */}
            <div className="space-y-3">
              <Button
                className="w-full bg-primary hover:bg-primary-glow text-white"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || !companyInfo}
              >
                <Download className="mr-2 h-4 w-4" />
                {isGeneratingPDF ? 'PDF 생성 중...' : 'PDF 다운로드'}
              </Button>

              <Button className="w-full border border-input bg-transparent text-gray-700 hover:bg-accent hover:text-accent-foreground">
                <Eye className="mr-2 h-4 w-4" />
                미리보기
              </Button>

              <Button className="w-full border border-input bg-transparent text-gray-700 hover:bg-accent hover:text-accent-foreground">
                <FileText className="mr-2 h-4 w-4" />
                Word 다운로드
              </Button>
            </div>
          </div>

          {/* 보고서 미리보기 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 보고서 커버 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">보고서 미리보기</CardTitle>
                <CardDescription>
                  생성될 최종 보고서의 구조와 내용을 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-seed-light/10 rounded-lg p-8 text-center border-2 border-dashed border-primary/20">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {reportMetadata.reportYear} 지속가능경영 보고서
                    </h2>
                    <p className="text-lg text-muted-foreground mb-4">
                      {companyInfo?.companyName || '그린테크 주식회사'}
                    </p>
                    <Badge className="mb-4 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      IFRS 기준 준수
                    </Badge>
                  </div>

                  <div className="text-left max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>발행일:</span>
                      <span>{new Date(reportMetadata.lastUpdated).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>보고 기간:</span>
                      <span>{reportMetadata.reportPeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>언어:</span>
                      <span>{reportMetadata.language}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="text-xs font-semibold text-foreground mb-2">📊 포함된 데이터</div>
                    <div className="flex justify-between">
                      <span>회사정보 (CompanyInfoPage):</span>
                      <span className={companyInfo ? 'text-green-600 font-semibold' : 'text-red-600'}>
                        {companyInfo ? '✓ 최종 제출됨' : '✗ 미제출'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI 생성 문단 (ContentGenerationPage):</span>
                      <span className={contentSections.length > 0 ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                        {contentSections.length}개 섹션
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>저장된 차트 (ChartsPage):</span>
                      <span className={charts.length > 0 ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                        {charts.length}개 차트
                      </span>
                    </div>
                    {companyInfo && (
                      <>
                        <Separator className="my-2" />
                        <div className="flex justify-between">
                          <span>대표자:</span>
                          <span>{companyInfo.ceoName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>업종:</span>
                          <span>{companyInfo.industry || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>사업자등록번호:</span>
                          <span>{companyInfo.businessNumber || 'N/A'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 목차 미리보기 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">목차</CardTitle>
                <CardDescription>
                  보고서에 포함될 주요 섹션들입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: 'CEO 메시지', page: 3 },
                    { title: '회사 개요', page: 5 },
                    { title: '지속가능경영 전략', page: 8 },
                    { title: '환경 성과 (Environmental)', page: 12 },
                    { title: '사회적 책임 (Social)', page: 20 },
                    { title: '지배구조 (Governance)', page: 28 },
                    { title: '핵심 성과 지표 (KPI)', page: 35 },
                    { title: '향후 계획 및 목표', page: 40 },
                    { title: '부록 및 데이터', page: 43 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center text-xs font-medium text-primary">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.page}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 품질 체크리스트 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">품질 체크리스트</CardTitle>
                <CardDescription>
                  보고서 품질을 보장하기 위한 필수 검토 항목들입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { item: 'IFRS 기준 준수', checked: true },
                    { item: 'GRI 표준 적용', checked: true },
                    { item: '데이터 정확성 검증', checked: false },
                    { item: '이해관계자 검토', checked: false },
                    { item: '법적 요구사항 충족', checked: true },
                    { item: '외부 감사 완료', checked: false }
                  ].map((check, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${check.checked
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300'
                        }`}>
                        {check.checked && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`text-sm ${check.checked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {check.item}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
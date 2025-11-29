import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Download, Eye, FileText, CheckCircle, Clock, AlertCircle, Building2, BarChart3 } from 'lucide-react';
import { useReportStore } from '@/store/reportStore';

export function FinalReportPage() {
  const { companyInfo, contentSections, charts, reportMetadata, getReportData } = useReportStore();
  
  // 실제 데이터 기반으로 섹션 상태 계산
  const reportSections = useMemo(() => {
    const sections = [
      {
        id: 'company',
        title: '회사정보',
        status: companyInfo ? (companyInfo.companyName ? 'completed' : 'in-progress') : 'pending',
        progress: companyInfo ? (companyInfo.companyName ? 100 : 50) : 0,
      },
      {
        id: 'content',
        title: '생성된 문단',
        status: contentSections.length > 0 ? (contentSections.length >= 3 ? 'completed' : 'in-progress') : 'pending',
        progress: Math.min(100, (contentSections.length / 5) * 100),
      },
      {
        id: 'charts',
        title: '차트 및 시각화',
        status: charts.length > 0 ? (charts.length >= 2 ? 'completed' : 'in-progress') : 'pending',
        progress: Math.min(100, (charts.length / 3) * 100),
      },
    ];
    return sections;
  }, [companyInfo, contentSections.length, charts.length]);

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
        return <Badge variant="secondary">대기중</Badge>;
    }
  };

  const overallProgress = useMemo(() => {
    if (reportSections.length === 0) return 0;
    return Math.round(
      reportSections.reduce((sum, section) => sum + section.progress, 0) / reportSections.length
    );
  }, [reportSections]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                disabled={overallProgress < 80}
              >
                <Download className="mr-2 h-4 w-4" />
                PDF 다운로드
              </Button>

              <Button variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                미리보기
              </Button>

              <Button variant="outline" className="w-full">
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
                      {companyInfo?.companyName || '회사명을 입력해주세요'}
                    </p>
                    <Badge variant="secondary" className="mb-4">
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
                      <span>페이지 수:</span>
                      <span>약 {Math.max(20, contentSections.length * 2 + charts.length * 3 + 10)}페이지</span>
                    </div>
                    <div className="flex justify-between">
                      <span>언어:</span>
                      <span>{reportMetadata.language}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 회사 개요 섹션 */}
            {companyInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-primary" />
                    회사 개요
                  </CardTitle>
                  <CardDescription>
                    회사정보 페이지에서 입력한 데이터가 자동으로 표시됩니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {companyInfo.companyName && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">회사명</h4>
                      <p className="text-foreground">{companyInfo.companyName}</p>
                    </div>
                  )}
                  {companyInfo.ceoName && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">대표자</h4>
                      <p className="text-foreground">{companyInfo.ceoName}</p>
                    </div>
                  )}
                  {companyInfo.industry && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">업종</h4>
                      <p className="text-foreground">{companyInfo.industry}</p>
                    </div>
                  )}
                  {companyInfo.mission && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">미션</h4>
                      <p className="text-foreground whitespace-pre-wrap">{companyInfo.mission}</p>
                    </div>
                  )}
                  {companyInfo.vision && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">비전</h4>
                      <p className="text-foreground whitespace-pre-wrap">{companyInfo.vision}</p>
                    </div>
                  )}
                  {companyInfo.esgGoals && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">ESG 핵심 목표</h4>
                      <p className="text-foreground whitespace-pre-wrap">{companyInfo.esgGoals}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 생성된 문단 섹션 */}
            {contentSections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">생성된 IFRS S2 문단</CardTitle>
                  <CardDescription>
                    문단생성 페이지에서 생성된 문단들이 자동으로 표시됩니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contentSections.map((section) => (
                    <div key={section.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <h3 className="text-lg font-bold text-primary mb-3">{section.title}</h3>
                      <div className="bg-muted/50 p-4 rounded-lg mb-3">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {section.content}
                        </p>
                      </div>
                      {section.aiComment && (
                        <div
                          className={`p-3 rounded-lg text-sm ${
                            section.commentType === 'warning'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          <div className="font-semibold mb-1">AI 코멘트</div>
                          <p>{section.aiComment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 차트 섹션 */}
            {charts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                    차트 및 시각화
                  </CardTitle>
                  <CardDescription>
                    도표및그림 페이지에서 생성된 차트들이 자동으로 표시됩니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {charts.map((chart) => (
                    <div key={chart.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <h3 className="text-lg font-bold text-primary mb-3">{chart.chartTitle}</h3>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        {chart.chartImage ? (
                          <img
                            src={chart.chartImage}
                            alt={chart.chartTitle}
                            className="w-full h-auto rounded"
                          />
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>차트 이미지가 없습니다</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        <p>유형: {chart.chartType} | 데이터 소스: {chart.dataSource}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 데이터 없음 안내 */}
            {!companyInfo && contentSections.length === 0 && charts.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">보고서 데이터가 없습니다</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    회사정보, 문단생성, 도표및그림 페이지에서 데이터를 입력하면<br />
                    여기에 자동으로 표시됩니다.
                  </p>
                </CardContent>
              </Card>
            )}

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
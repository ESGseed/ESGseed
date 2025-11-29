import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Download, Eye, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function FinalReportPage() {
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
        return <Badge variant="secondary">대기중</Badge>;
    }
  };

  const overallProgress = Math.round(
    reportSections.reduce((sum, section) => sum + section.progress, 0) / reportSections.length
  );

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
                      2024 지속가능경영 보고서
                    </h2>
                    <p className="text-lg text-muted-foreground mb-4">
                      그린테크 주식회사
                    </p>
                    <Badge variant="secondary" className="mb-4">
                      IFRS 기준 준수
                    </Badge>
                  </div>

                  <div className="text-left max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>발행일:</span>
                      <span>2024년 12월</span>
                    </div>
                    <div className="flex justify-between">
                      <span>보고 기간:</span>
                      <span>2024년 1월 - 12월</span>
                    </div>
                    <div className="flex justify-between">
                      <span>페이지 수:</span>
                      <span>약 45페이지</span>
                    </div>
                    <div className="flex justify-between">
                      <span>언어:</span>
                      <span>한국어</span>
                    </div>
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
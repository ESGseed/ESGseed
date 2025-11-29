import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, MapPin, Users, Target, Save, FileText, Globe, Activity, CheckCircle2 } from 'lucide-react';
import { useReportStore, type CompanyData } from '@/store/reportStore';
import { useToast } from '@/hooks/use-toast';

const initialData: CompanyData = {
  companyName: '',
  businessNumber: '',
  ceoName: '',
  industry: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  mission: '',
  vision: '',
  esgGoals: '',
  employees: '',
  shareholders: '',
  stakeholders: '',
  communication: '',
};

export function CompanyInfoPage() {
  const { companyInfo, setCompanyInfo } = useReportStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState<CompanyData>(initialData);
  const [isSaved, setIsSaved] = useState(false);

  // Store에서 저장된 데이터 불러오기
  useEffect(() => {
    if (companyInfo) {
      setFormData(companyInfo);
      setIsSaved(true);
    }
  }, [companyInfo]);

  const handleChange = (field: keyof CompanyData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setIsSaved(false); // 데이터 변경 시 저장 상태 초기화
  };

  const handleSave = () => {
    setCompanyInfo(formData);
    setIsSaved(true);
    toast({
      title: '저장 완료',
      description: '회사정보가 저장되었습니다. 최종보고서에서 확인할 수 있습니다.',
    });
  };

  // 섹션별 필드 그룹화
  const fieldGroups = useMemo(() => {
    return {
      '기업 기본정보': [
        { id: 'companyName', label: '회사명', icon: Building2 },
        { id: 'businessNumber', label: '사업자등록번호', icon: FileText },
        { id: 'ceoName', label: '대표자명', icon: Users },
        { id: 'industry', label: '업종', icon: Activity },
      ],
      '연락처 정보': [
        { id: 'address', label: '본사 주소', icon: MapPin },
        { id: 'phone', label: '대표 전화번호', icon: MapPin },
        { id: 'email', label: '대표 이메일', icon: MapPin },
        { id: 'website', label: '웹사이트', icon: Globe },
      ],
      'ESG 목표 및 비전': [
        { id: 'mission', label: '미션', icon: Target },
        { id: 'vision', label: '비전', icon: Target },
        { id: 'esgGoals', label: 'ESG 핵심 목표', icon: Target },
      ],
      '이해관계자 정보': [
        { id: 'employees', label: '임직원 수', icon: Users },
        { id: 'shareholders', label: '주요 주주', icon: Users },
        { id: 'stakeholders', label: '기타 이해관계자', icon: Users },
        { id: 'communication', label: '소통 채널', icon: Users },
      ],
    };
  }, []);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary rounded-2xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">회사정보 관리</h1>
          <p className="text-lg text-muted-foreground">
            지속가능경영 보고서 작성을 위한 기업 기본정보를 입력하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 입력 폼 (왼쪽) */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(fieldGroups).map(([sectionName, fields]) => {
              const sectionIcons: { [key: string]: typeof Building2 } = {
                '기업 기본정보': Building2,
                '연락처 정보': MapPin,
                'ESG 목표 및 비전': Target,
                '이해관계자 정보': Users,
              };
              const SectionIcon = sectionIcons[sectionName] || Building2;

              return (
                <Card key={sectionName} className="border-2 border-transparent hover:border-primary/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <SectionIcon className="h-5 w-5 text-secondary" />
                      <span>{sectionName}</span>
                    </CardTitle>
                    <CardDescription>
                      {sectionName === '기업 기본정보' && '회사의 기본적인 정보를 입력해주세요'}
                      {sectionName === '연락처 정보' && '회사의 연락처와 주소 정보를 입력해주세요'}
                      {sectionName === 'ESG 목표 및 비전' && '회사의 지속가능경영 목표와 비전을 설정하세요'}
                      {sectionName === '이해관계자 정보' && '주요 이해관계자와 소통 방식을 정의하세요'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {fields.map((field) => {
                      const isTextarea = ['address', 'mission', 'vision', 'esgGoals', 'shareholders', 'stakeholders', 'communication'].includes(field.id);
                      const Icon = field.icon;

                      return (
                        <div key={field.id}>
                          <Label htmlFor={field.id} className="flex items-center space-x-2">
                            <Icon className="h-4 w-4 text-secondary" />
                            <span>{field.label}</span>
                          </Label>
                          {isTextarea ? (
                            <Textarea
                              id={field.id}
                              value={formData[field.id as keyof CompanyData]}
                              onChange={(e) => handleChange(field.id as keyof CompanyData, e.target.value)}
                              placeholder={
                                field.id === 'address' ? '서울특별시 강남구 테헤란로 123, 그린빌딩 10층' :
                                  field.id === 'mission' ? '지속가능한 기술혁신을 통해 더 나은 미래를 만들어갑니다' :
                                    field.id === 'vision' ? '2030년까지 탄소중립을 달성하는 글로벌 친환경 기업' :
                                      field.id === 'esgGoals' ? '• 환경: 2030년 탄소중립 달성\n• 사회: 지역사회 일자리 창출 1000개\n• 지배구조: 투명한 경영 시스템 구축' :
                                        field.id === 'shareholders' ? '• 창립자 및 경영진: 40%\n• 기관투자자: 35%\n• 일반 주주: 25%' :
                                          field.id === 'stakeholders' ? '고객, 협력업체, 지역사회, 정부기관, NGO 등' :
                                            '• 정기 주주총회\n• 분기별 실적발표\n• 지속가능경영 보고서\n• 홈페이지 및 SNS'
                              }
                              className="mt-1 min-h-[80px]"
                            />
                          ) : (
                            <Input
                              id={field.id}
                              type={field.id === 'employees' ? 'number' : field.id === 'email' ? 'email' : 'text'}
                              value={formData[field.id as keyof CompanyData]}
                              onChange={(e) => handleChange(field.id as keyof CompanyData, e.target.value)}
                              placeholder={
                                field.id === 'companyName' ? '예: 그린테크 주식회사' :
                                  field.id === 'businessNumber' ? '000-00-00000' :
                                    field.id === 'ceoName' ? '홍길동' :
                                      field.id === 'industry' ? '예: 재생에너지, 제조업, IT서비스' :
                                        field.id === 'phone' ? '02-1234-5678' :
                                          field.id === 'email' ? 'info@greentech.co.kr' :
                                            field.id === 'website' ? 'https://www.greentech.co.kr' :
                                              '250'
                              }
                              className="mt-1"
                            />
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 요약 미리보기 (오른쪽) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-l-4 border-secondary">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-secondary">
                  보고서 요약 미리보기
                </CardTitle>
                <CardDescription>
                  입력된 정보가 실시간으로 표시됩니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {Object.entries(fieldGroups).map(([sectionName, fields]) => (
                    <div key={sectionName} className="pb-4 border-b last:border-b-0">
                      <h3 className="text-lg font-bold text-secondary mb-3 pb-2 border-b">
                        {sectionName}
                      </h3>
                      <div className="space-y-3">
                        {fields.map((field) => {
                          const Icon = field.icon;
                          const value = formData[field.id as keyof CompanyData];
                          return (
                            <div key={field.id} className="flex flex-col space-y-1">
                              <div className="flex items-center text-sm font-medium text-muted-foreground">
                                <Icon className="w-4 h-4 mr-1 opacity-70" />
                                {field.label}
                              </div>
                              <div className="text-sm text-foreground bg-muted/50 p-2 rounded-md min-h-[2rem]">
                                {value || <span className="text-muted-foreground italic">N/A (데이터 없음)</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-xs text-muted-foreground italic p-3 border-t bg-muted/30 rounded">
                  * 이 요약 정보는 최종 보고서의 '조직 개요' 섹션에 사용되는 핵심 데이터입니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={handleSave}
            className="bg-primary hover:bg-primary-glow text-white px-8 py-4 shadow-seed"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                저장됨
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                회사정보 저장
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
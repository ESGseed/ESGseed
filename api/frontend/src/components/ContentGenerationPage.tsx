import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Sparkles, Send, CheckCircle2, Clock, XCircle, Upload, Bot } from 'lucide-react';
import { useReportStore, ChecklistItem, ChatMessage } from '@/store/reportStore';

interface PreviewSection {
  id: string;
  title: string;
  content: string;
  aiComment?: string;
  commentType?: 'info' | 'warning';
}

export function ContentGenerationPage() {
  const checklistItems = useReportStore((state) => state.checklistItems);
  const setChecklistItems = useReportStore((state) => state.setChecklistItems);
  const chatMessages = useReportStore((state) => state.chatMessages);
  const setChatMessages = useReportStore((state) => state.setChatMessages);
  const addChatMessage = useReportStore((state) => state.addChatMessage);

  // 초기화 플래그 (한 번만 실행)
  const hasInitialized = useRef(false);
  
  // 초기 데이터 설정 (한 번만 실행)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      if (checklistItems.length === 0) {
        setChecklistItems([
          { id: 's2-5', label: 'S2-5: 거버넌스 (감독 주체)', status: 'completed' },
          { id: 's2-7', label: 'S2-7: 리스크 및 기회 (전략 우선순위)', status: 'in-progress' },
          { id: 's2-15', label: 'S2-15: 시나리오 분석 (기준 연도)', status: 'pending' },
          { id: 'scope', label: 'Scope 1, 2, 3 배출량', status: 'pending' },
        ]);
      }
      if (chatMessages.length === 0) {
        setChatMessages([
          {
            id: '1',
            role: 'ai',
            content: '1단계: TCFD 보고서.pdf (7.8MB) 업로드됨',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            role: 'ai',
            content: '2단계: 문단 분석 및 누락 정보 파악이 완료되었습니다. 이제 질문을 시작하겠습니다.',
            timestamp: new Date().toISOString(),
          },
          {
            id: '3',
            role: 'ai',
            content: 'S2-5 거버넌스 관련 질문입니다: 기후 리스크 관리의 감독 주체는 누구인가요? (예: 이사회, ESG 위원회)',
            timestamp: new Date().toISOString(),
          },
          {
            id: '4',
            role: 'user',
            content: "이사회 산하 '지속가능경영위원회'가 분기별로 감독합니다.",
            timestamp: new Date().toISOString(),
          },
          {
            id: '5',
            role: 'ai',
            content: '좋습니다. S2-5 문단이 오른쪽에 생성되었습니다. 확인해주세요.',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    }
  }, [checklistItems.length, chatMessages.length, setChecklistItems, setChatMessages]);

  // ChatMessage를 Message 형식으로 변환
  const messages = useMemo(() => {
    return chatMessages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
    }));
  }, [chatMessages]);

  const [inputMessage, setInputMessage] = useState('');
  const contentSections = useReportStore((state) => state.contentSections);
  const addContentSection = useReportStore((state) => state.addContentSection);
  const updateContentSection = useReportStore((state) => state.updateContentSection);
  
  // store의 contentSections를 PreviewSection 형식으로 변환 (Date 필드 제외)
  const previewSections = useMemo(() => {
    return contentSections.map(section => ({
      id: section.id,
      title: section.title,
      content: section.content,
      aiComment: section.aiComment,
      commentType: section.commentType,
    }));
  }, [contentSections]);

  // 초기 데이터가 없으면 기본 섹션 추가 (한 번만 실행)
  const hasInitializedSections = useRef(false);
  useEffect(() => {
    if (!hasInitializedSections.current && contentSections.length === 0) {
      hasInitializedSections.current = true;
      addContentSection({
        id: 's2-5',
        title: 'IFRS S2-5: GOVERNANCE',
        content: '본 회사는 기후 관련 리스크 및 기회를 관리하기 위해 이사회 산하에 "지속가능경영위원회"를 운영하고 있습니다. 이 위원회는 분기별로 기후 리스크 및 기회에 대한 감독 역할을 수행합니다.',
        aiComment: '표준 충족. "위원회"의 구체적 역할(예: 성과 측정, 보상 연계)을 추가하면 더 좋습니다.',
        commentType: 'info',
      });
      addContentSection({
        id: 's2-15',
        title: 'IFRS S2-15: SCENARIO ANALYSIS',
        content: '본 회사는 NZE 2050 및 2도 시나리오를 활용하여 기후 관련 전환 리스크를 분석하고 있습니다. [기준연도 데이터 입력 필요]',
        aiComment: '정량적 요소 누락. 왼쪽 채팅창에 "Scope 1,2 기준연도 데이터"를 입력해주세요.',
        commentType: 'warning',
      });
    }
  }, [contentSections.length, addContentSection]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUploaded, setIsUploaded] = useState(true);

  const progress = useMemo(() => {
    const completed = checklistItems.filter(item => item.status === 'completed').length;
    return Math.round((completed / checklistItems.length) * 100);
  }, [checklistItems]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    addChatMessage({
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
    });
    const currentInput = inputMessage;
    setInputMessage('');

    // AI 응답 시뮬레이션
    setTimeout(() => {
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '답변을 확인했습니다. 관련 문단을 업데이트하겠습니다.',
      });

      // 체크리스트 업데이트 시뮬레이션
      if (currentInput.includes('S2-7') || currentInput.includes('리스크')) {
        setChecklistItems(
          checklistItems.map(item =>
            item.id === 's2-7' ? { ...item, status: 'completed' } : item
          )
        );
      }

      // 예시: 문단이 생성되면 store에 저장
      // 실제로는 AI 응답에 따라 동적으로 생성되어야 함
      if (currentInput.includes('S2-5') || currentInput.includes('거버넌스')) {
        addContentSection({
          id: 's2-5',
          title: 'IFRS S2-5: GOVERNANCE',
          content: currentInput,
          aiComment: '표준 충족. "위원회"의 구체적 역할(예: 성과 측정, 보상 연계)을 추가하면 더 좋습니다.',
          commentType: 'info',
        });
      }
    }, 1000);
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-secondary rounded-2xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">스마트 문단생성</h1>
          <p className="text-lg text-muted-foreground">
            AI 기반으로 전문적이고 일관성 있는 지속가능경영 보고서 문단을 생성하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 왼쪽: IFRS S2 필수 정보 체크리스트 */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">IFRS S2 필수 정보 체크리스트</CardTitle>
                <CardDescription>
                  진행률 {progress}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="mb-4" />
                <div className="space-y-3">
                  {checklistItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      {getStatusIcon(item.status)}
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 중앙: AI ESG Consultant 채팅 */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="flex flex-col h-[calc(100vh-200px)]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-secondary" />
                  <span>AI ESG Consultant</span>
                </CardTitle>
                {isUploaded && (
                  <div className="mt-2 p-2 bg-secondary/10 rounded-lg text-sm text-secondary">
                    <Upload className="h-4 w-4 inline mr-2" />
                    1단계: TCFD 보고서.pdf (7.8MB) 업로드됨
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                          ? 'bg-secondary text-white'
                          : 'bg-muted text-foreground'
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t pt-4">
                  <div className="flex space-x-2">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="AI의 질문에 답변하거나 질문을 입력하세요... (예: S2-7 문장이 맞나요?)"
                      className="min-h-[80px] resize-none"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="bg-secondary hover:bg-secondary/90 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 실시간 보고서 문단 프리뷰 */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="h-[calc(100vh-200px)] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-lg">실시간 보고서 문단 프리뷰</CardTitle>
                <CardDescription>
                  생성된 문단을 실시간으로 확인하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {previewSections.map((section) => (
                  <div key={section.id} className="border-b pb-6 last:border-b-0">
                    <h3 className="text-lg font-bold text-primary mb-3">{section.title}</h3>
                    <div className="bg-muted/50 p-4 rounded-lg mb-3">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {section.content}
                      </p>
                    </div>
                    {section.aiComment && (
                      <div
                        className={`p-3 rounded-lg text-sm ${section.commentType === 'warning'
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
                {previewSections.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>생성된 문단이 여기에 표시됩니다</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
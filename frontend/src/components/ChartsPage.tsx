import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, PieChart, TrendingUp, Download, RefreshCw, Settings, Plus, Minus, Save } from 'lucide-react';
import { useReportStore, type ChartData } from '@/store/reportStore';
import { toast } from 'sonner';

interface DataPoint {
  label: string;
  value: number;
}

interface SavedChart {
  id: string;
  chartType: string;
  dataSource: string;
  chartTitle: string;
  xAxisLabel: string;
  yAxisLabel: string;
  dataPoints: DataPoint[];
  thumbnail?: string;
}

interface TableRow {
  id: string;
  division: string;
  type: string;
  unit: string;
  values: { [key: string]: string }; // 동적 연도별 값
}

export function ChartsPage() {
  const { charts, addChart } = useReportStore();
  const [chartType, setChartType] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chartTitle, setChartTitle] = useState('연도별 CO2 배출량 (Scope 1+2)');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { label: '2021년', value: 1200 },
    { label: '2022년', value: 1150 },
    { label: '2023년', value: 1080 },
    { label: '2024년', value: 1010 },
  ]);
  const [xAxisLabel, setXAxisLabel] = useState('월별');
  const [yAxisLabel, setYAxisLabel] = useState('배출량 (tCO2eq)');
  
  // store의 charts를 SavedChart 형식으로 변환
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>(() =>
    charts.slice(0, 4).map((chart: ChartData) => ({
      id: chart.id,
      chartType: chart.chartType,
      dataSource: chart.dataSource,
      chartTitle: chart.chartTitle,
      xAxisLabel: chart.xAxisLabel,
      yAxisLabel: chart.yAxisLabel,
      dataPoints: chart.dataPoints,
      thumbnail: chart.chartImage,
    }))
  );
  
  // store의 charts 변경 시 savedCharts 동기화
  useEffect(() => {
    setSavedCharts(
      charts.slice(0, 4).map((chart: ChartData) => ({
        id: chart.id,
        chartType: chart.chartType,
        dataSource: chart.dataSource,
        chartTitle: chart.chartTitle,
        xAxisLabel: chart.xAxisLabel,
        yAxisLabel: chart.yAxisLabel,
        dataPoints: chart.dataPoints,
        thumbnail: chart.chartImage,
      }))
    );
  }, [charts]);
  const [tableData] = useState<TableRow[]>([
    { id: '1', division: '수원 데이터센터', type: '탄소 배출량', unit: 'MWh', values: { '2022년': '85.84', '2023년': '79.89' } },
    { id: '2', division: '수원 데이터센터', type: '에너지 사용량', unit: 'MWh', values: { '2022년': '19.11', '2023년': '62.96' } },
    { id: '3', division: '수원 데이터센터', type: '폐기물 처리', unit: 'MWh', values: { '2022년': '56.73', '2023년': '55.34' } },
    { id: '4', division: '수원 데이터센터', type: '융수 사용량', unit: 'MWh', values: { '2022년': '-', '2023년': '435.62' } },
    { id: '5', division: '수원 데이터센터', type: '직원 다양성', unit: 'MWh', values: { '2022년': '144.63', '2023년': '196.36' } },
    { id: '6', division: '수원 데이터센터', type: '태양광 발전', unit: 'MWh', values: { '2022년': '-', '2023년': '385.08' } },
  ]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartInstanceRef = useRef<any>(null);

  const chartTypes = [
    { value: 'bar', label: '막대 차트', icon: BarChart3, description: '카테고리별 데이터 비교에 적합' },
    { value: 'pie', label: '원형 차트', icon: PieChart, description: '전체 대비 비율 표시에 적합' },
    { value: 'line', label: '선형 차트', icon: TrendingUp, description: '시간별 변화 추이 표시에 적합' },
    { value: 'area', label: '영역 차트', icon: TrendingUp, description: '누적 데이터 변화 표시에 적합' }
  ];

  const dataSources = [
    { value: 'carbon', label: '탄소 배출량 데이터' },
    { value: 'energy', label: '에너지 사용량 데이터' },
    { value: 'waste', label: '폐기물 처리 데이터' },
    { value: 'water', label: '용수 사용량 데이터' },
    { value: 'employee', label: '직원 다양성 데이터' },
    { value: 'safety', label: '안전 사고 데이터' },
    { value: 'training', label: '교육 훈련 데이터' },
    { value: 'governance', label: '지배구조 지표' }
  ];

  const colors = [
    '#99cc00', // secondary
    '#669900', // primary
    '#CCFF33', // accent
    '#f97316', // Orange
    '#14b8a6', // Teal
    '#c026d3', // Fuchsia
  ];

  // 데이터 포인트 추가
  const addDataPoint = () => {
    if (dataPoints.length >= 10) return;
    setDataPoints([...dataPoints, { label: '', value: 0 }]);
  };

  // 데이터 포인트 제거
  const removeDataPoint = () => {
    if (dataPoints.length > 1) {
      setDataPoints(dataPoints.slice(0, -1));
    }
  };

  // 데이터 포인트 업데이트
  const updateDataPoint = (index: number, field: 'label' | 'value', value: string | number) => {
    const newDataPoints = [...dataPoints];
    if (field === 'label') {
      newDataPoints[index].label = value as string;
    } else {
      newDataPoints[index].value = typeof value === 'string' ? parseFloat(value) || 0 : value;
    }
    setDataPoints(newDataPoints);
  };

  // 차트 렌더링
  useEffect(() => {
    if (!canvasRef.current || !chartType || !dataSource) return;

    // Chart.js 동적 로드
    const loadChartJS = async () => {
      // @ts-expect-error - Chart.js는 window에 동적으로 추가됨
      if (typeof window.Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js';
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      renderChart();
    };

    loadChartJS();
  }, [chartType, chartTitle, dataPoints, xAxisLabel, yAxisLabel, dataSource]);

  // 차트 렌더링 함수
  const renderChart = () => {
    if (!canvasRef.current || !chartType) return;
    // @ts-expect-error - Chart.js는 window에 동적으로 추가됨
    if (typeof window.Chart === 'undefined') return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // 기존 차트 파괴
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = dataPoints.map(d => d.label).filter(l => l.trim() !== '');
    const data = dataPoints.map(d => d.value).slice(0, labels.length);

    if (labels.length === 0) return;

    let backgroundColor, borderColor;
    const actualChartType = chartType === 'area' ? 'line' : chartType;
    if (actualChartType === 'pie') {
      backgroundColor = data.map((_, i) => colors[i % colors.length]);
      borderColor = 'white';
    } else {
      backgroundColor = colors[0] + 'D9';
      borderColor = colors[0];
    }

    // @ts-expect-error - Chart.js는 window에 동적으로 추가됨
    chartInstanceRef.current = new window.Chart(ctx, {
      type: actualChartType,
      data: {
        labels: labels,
        datasets: [{
          label: chartTitle,
          data: data,
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          borderWidth: 2,
          borderRadius: 8,
          ...((actualChartType === 'line' || chartType === 'area') && {
            tension: 0.4,
            fill: chartType === 'area',
            backgroundColor: colors[0] + '33',
            pointBackgroundColor: colors[0],
            pointRadius: 5,
            pointHoverRadius: 7
          })
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: chartTitle,
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            display: (actualChartType === 'pie'),
            position: 'bottom',
          }
        },
        scales: (actualChartType === 'bar' || actualChartType === 'line') ? {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: yAxisLabel
            }
          },
          x: {
            title: {
              display: true,
              text: xAxisLabel
            }
          }
        } : undefined
      }
    });
  };

  const handleGenerate = () => {
    if (!chartType || !dataSource) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      renderChart();
    }, 500);
  };

  // 차트 다운로드
  const downloadChart = () => {
    if (!chartInstanceRef.current) return;

    const imageURL = chartInstanceRef.current.toBase64Image('image/png', 1.0);
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = `${chartTitle.replace(/[^a-z0-9\uAC00-\uD7A3]/gi, '_') || 'chart'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 차트 저장
  const saveChart = () => {
    if (!chartInstanceRef.current || !chartType || !dataSource) {
      toast.error('차트를 먼저 생성해주세요.');
      return;
    }

    const thumbnail = chartInstanceRef.current.toBase64Image('image/png', 0.3);
    
    // store에 저장
    addChart({
      chartType: chartType as 'bar' | 'pie' | 'line' | 'area',
      dataSource,
      chartTitle,
      xAxisLabel,
      yAxisLabel,
      dataPoints: [...dataPoints],
      chartImage: thumbnail,
    });
    
    toast.success('차트가 저장되었습니다.', {
      description: '최종보고서 페이지에서 확인할 수 있습니다.',
    });
  };

  // 저장된 차트 로드
  const loadChart = (savedChart: SavedChart) => {
    setChartType(savedChart.chartType);
    setDataSource(savedChart.dataSource);
    setChartTitle(savedChart.chartTitle);
    setXAxisLabel(savedChart.xAxisLabel);
    setYAxisLabel(savedChart.yAxisLabel);
    setDataPoints(savedChart.dataPoints);
    
    // 차트 재생성
    setTimeout(() => {
      renderChart();
    }, 100);
  };

  // 표 합계 계산
  const calculateTotal = (label: string) => {
    return tableData.reduce((sum, row) => {
      const value = row.values[label] || '-';
      const numValue = value === '-' ? 0 : parseFloat(value) || 0;
      return sum + numValue;
    }, 0).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-accent rounded-2xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">도표 및 그래프 생성</h1>
          <p className="text-lg text-muted-foreground">
            ESG 데이터를 직관적인 차트와 인포그래픽으로 시각화하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[25%_75%] gap-8">
          {/* 설정 패널 */}
          <div>
            <div className="space-y-4">
              {/* 차트 설정 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">차트 설정</CardTitle>
                  <CardDescription>
                    차트의 세부 설정을 조정하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="chart-title">차트 제목</Label>
                    <Input
                      id="chart-title"
                      value={chartTitle}
                      onChange={(e) => setChartTitle(e.target.value)}
                      placeholder="예: 2024년 탄소 배출량 현황"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="x-axis">X축 라벨</Label>
                    <Input
                      id="x-axis"
                      value={xAxisLabel}
                      onChange={(e) => setXAxisLabel(e.target.value)}
                      placeholder="예: 월별"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="y-axis">Y축 라벨</Label>
                    <Input
                      id="y-axis"
                      value={yAxisLabel}
                      onChange={(e) => setYAxisLabel(e.target.value)}
                      placeholder="예: 배출량 (tCO2eq)"
                      className="mt-1"
                    />
                  </div>

                  {/* 데이터 포인트 입력 */}
                  <div className="pt-4 border-t">
                    <Label className="mb-2 block">데이터 포인트</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {dataPoints.map((point, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <span className="font-bold text-muted-foreground text-xs w-4">{index + 1}.</span>
                          <Input
                            placeholder="레이블"
                            value={point.label}
                            onChange={(e) => updateDataPoint(index, 'label', e.target.value)}
                            className="flex-1 text-sm"
                          />
                          <Input
                            type="number"
                            placeholder="값"
                            value={point.value || ''}
                            onChange={(e) => updateDataPoint(index, 'value', e.target.value)}
                            className="w-20 text-right text-sm"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={addDataPoint}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={dataPoints.length >= 10}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        추가
                      </Button>
                      <Button
                        onClick={removeDataPoint}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={dataPoints.length <= 1}
                      >
                        <Minus className="h-3 w-3 mr-1" />
                        제거
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 차트 유형 선택 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-secondary" />
                    차트 유형
                  </CardTitle>
                  <CardDescription>
                    데이터에 적합한 차트 유형을 선택하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {chartTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.value}
                          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${chartType === type.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                            }`}
                          onClick={() => setChartType(type.value)}
                        >
                          <Icon className={`h-6 w-6 mb-2 ${chartType === type.value ? 'text-secondary' : 'text-muted-foreground'}`} />
                          <h4 className="font-medium text-sm mb-1">{type.label}</h4>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 데이터 소스 선택 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">데이터 소스</CardTitle>
                  <CardDescription>
                    시각화할 데이터 유형을 선택하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={dataSource} onValueChange={setDataSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="데이터 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* 생성 버튼 */}
              <Button
                onClick={handleGenerate}
                disabled={!chartType || !dataSource || isGenerating}
                className="w-full bg-accent hover:bg-accent/90 text-white py-3"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    차트 생성하기
                  </>
                )}
              </Button>
            </div>

            {/* 차트 갤러리 */}
            <Card className="mt-4 w-[410px] h-[380px]">
              <CardHeader>
                <CardTitle className="text-lg">차트 갤러리</CardTitle>
                <CardDescription>
                  최근 생성된 차트들을 확인하고 재사용하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {savedCharts.length > 0 ? (
                    savedCharts.map((savedChart) => (
                      <div
                        key={savedChart.id}
                        onClick={() => loadChart(savedChart)}
                        className="w-[170px] h-[120px] bg-seed-light/20 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-all duration-200 overflow-hidden group relative"
                      >
                        {savedChart.thumbnail ? (
                          <img 
                            src={savedChart.thumbnail} 
                            alt={savedChart.chartTitle}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <BarChart3 className="h-10 w-10 mx-auto mb-2 text-secondary opacity-60 group-hover:opacity-100 transition-opacity" />
                              <p className="text-xs text-muted-foreground truncate px-2">{savedChart.chartTitle}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    [1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className="w-[170px] h-[120px] bg-seed-light/20 rounded-lg border border-border flex items-center justify-center"
                      >
                        <div className="text-center">
                          <BarChart3 className="h-10 w-10 mx-auto mb-2 text-secondary opacity-30" />
                          <p className="text-xs text-muted-foreground opacity-50">비어있음</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 미리보기 및 결과 패널 */}
          <div className="space-y-6">
            {/* 차트 미리보기 */}
            <Card className="min-h-[800px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">차트 미리보기</CardTitle>
                    <CardDescription>
                      생성된 차트를 확인하고 다운로드하세요
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={downloadChart} disabled={!chartInstanceRef.current}>
                      <Download className="h-4 w-4 mr-1" />
                      PNG
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveChart} disabled={!chartInstanceRef.current}>
                      <Save className="h-4 w-4 mr-1" />
                      저장
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {chartType && dataSource && dataPoints.filter(p => p.label.trim() !== '').length > 0 ? (
                  <div className="flex items-center justify-center h-[650px] bg-seed-light/10 rounded-lg border-2 border-dashed border-primary/20">
                    <div className="w-full h-full p-4">
                      <canvas ref={canvasRef} className="w-full h-full"></canvas>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[650px] text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>차트 유형과 데이터 소스를 선택한 후<br />차트 생성하기 버튼을 클릭하세요</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 재생에너지 생산 표 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">재생에너지 생산</CardTitle>
                    <CardDescription>
                      데이터센터별 재생에너지 생산량
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left p-3 font-semibold bg-muted/50">구분</th>
                        <th className="text-left p-3 font-semibold bg-muted/50">종류</th>
                        <th className="text-center p-3 font-semibold bg-muted/50">단위</th>
                        {dataPoints.filter(p => p.label.trim() !== '').map((point) => (
                          <th key={point.label} className="text-right p-3 font-semibold bg-muted/50">
                            {point.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row) => (
                        <tr key={row.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="p-3">{row.division}</td>
                          <td className="p-3">{row.type}</td>
                          <td className="p-3 text-center">{row.unit}</td>
                          {dataPoints.filter(p => p.label.trim() !== '').map((point) => {
                            const value = row.values[point.label] || '-';
                            return (
                              <td 
                                key={point.label} 
                                className={`p-3 text-right ${value === '-' ? 'text-muted-foreground' : 'text-blue-600'}`}
                              >
                                {value}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                        <td colSpan={3} className="p-3 text-center">합계</td>
                        {dataPoints.filter(p => p.label.trim() !== '').map((point) => (
                          <td key={point.label} className="p-3 text-right text-blue-600">
                            {calculateTotal(point.label)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* 인포그래픽 템플릿 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">인포그래픽 템플릿</CardTitle>
                <CardDescription>
                  전문적인 ESG 인포그래픽 템플릿을 활용하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg hover:border-primary/30 cursor-pointer transition-all duration-200">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="font-medium">ESG 성과 대시보드</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      환경, 사회, 지배구조 핵심 지표를 한눈에 보여주는 종합 대시보드
                    </p>
                  </div>

                  <div className="p-4 border border-border rounded-lg hover:border-primary/30 cursor-pointer transition-all duration-200">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center mr-3">
                        <PieChart className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="font-medium">탄소 발자국 분석</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Scope 1, 2, 3 탄소 배출량을 시각적으로 분석하는 인포그래픽
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
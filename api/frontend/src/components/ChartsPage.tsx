import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BarChart3, PieChart, TrendingUp, Download, RefreshCw, Settings, Plus, Minus, Save, X } from 'lucide-react';
import { useReportStore, ReportStore } from '@/store/reportStore';

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
  const currentChart = useReportStore((state: ReportStore) => state.currentChart);
  const setCurrentChart = useReportStore((state: ReportStore) => state.setCurrentChart);
  const charts = useReportStore((state: ReportStore) => state.charts);
  const addChart = useReportStore((state: ReportStore) => state.addChart);
  const updateChart = useReportStore((state: ReportStore) => state.updateChart);
  const removeChart = useReportStore((state: ReportStore) => state.removeChart);

  const [chartType, setChartType] = useState(currentChart?.chartType || '');
  const [dataSource, setDataSource] = useState(currentChart?.dataSource || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chartTitle, setChartTitle] = useState(currentChart?.chartTitle || '연도별 CO2 배출량 (Scope 1+2)');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(currentChart?.dataPoints || [
    { label: '2021년', value: 1200 },
    { label: '2022년', value: 1150 },
    { label: '2023년', value: 1080 },
    { label: '2024년', value: 1010 },
  ]);
  const [xAxisLabel, setXAxisLabel] = useState(currentChart?.xAxisLabel || '월별');
  const [yAxisLabel, setYAxisLabel] = useState(currentChart?.yAxisLabel || '배출량 (tCO2eq)');

  // 현재 차트 상태를 store에 저장
  useEffect(() => {
    if (chartType || dataSource || chartTitle) {
      setCurrentChart({
        chartType,
        dataSource,
        chartTitle,
        xAxisLabel,
        yAxisLabel,
        dataPoints,
      });
    }
  }, [chartType, dataSource, chartTitle, xAxisLabel, yAxisLabel, dataPoints, setCurrentChart]);

  // store의 charts를 SavedChart 형식으로 변환
  const savedCharts = useMemo(() => {
    return charts.map((chart: any) => ({
      id: chart.id,
      chartType: chart.chartType,
      dataSource: chart.dataSource,
      chartTitle: chart.chartTitle,
      xAxisLabel: chart.xAxisLabel,
      yAxisLabel: chart.yAxisLabel,
      dataPoints: chart.dataPoints,
      thumbnail: chart.chartImage,
    }));
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
  const chartInstanceRef = useRef<any>(null);

  const chartTypes = [
    { value: 'bar', label: '막대 차트', icon: BarChart3, description: '카테고리별 데이터 비교에 적합' },
    { value: 'pie', label: '원형 차트', icon: PieChart, description: '전체 대비 비율 표시에 적합' },
    { value: 'line', label: '선형 차트', icon: TrendingUp, description: '시간별 변화 추이 표시에 적합' },
    { value: 'area', label: '영역 차트', icon: TrendingUp, description: '누적 데이터 변화 표시에 적합' }
  ];

  const dataSources = [
    { value: 'carbon', label: '탄소 배출량 데이터', chartTitle: '연도별 CO2 배출량 (Scope 1+2)', xAxis: '연도', yAxis: '배출량 (tCO2eq)' },
    { value: 'energy', label: '에너지 사용량 데이터', chartTitle: '연도별 에너지 사용량', xAxis: '연도', yAxis: '사용량 (MWh)' },
    { value: 'waste', label: '폐기물 처리 데이터', chartTitle: '연도별 폐기물 처리량', xAxis: '연도', yAxis: '처리량 (ton)' },
    { value: 'water', label: '용수 사용량 데이터', chartTitle: '연도별 용수 사용량', xAxis: '연도', yAxis: '사용량 (m³)' },
    { value: 'employee', label: '직원 다양성 데이터', chartTitle: '직원 다양성 지표', xAxis: '구분', yAxis: '비율 (%)' },
    { value: 'safety', label: '안전 사고 데이터', chartTitle: '연도별 안전 사고 현황', xAxis: '연도', yAxis: '사고 건수' },
    { value: 'training', label: '교육 훈련 데이터', chartTitle: '연도별 교육 훈련 시간', xAxis: '연도', yAxis: '시간 (hour)' },
    { value: 'governance', label: '지배구조 지표', chartTitle: '지배구조 평가 지표', xAxis: '항목', yAxis: '점수' }
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
      // @ts-ignore
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
    // @ts-ignore
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

    // @ts-ignore
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
    if (!chartInstanceRef.current || !chartType || !dataSource) return;

    // PDF 품질을 위해 고품질 이미지로 저장 (0.3 -> 0.9)
    const chartImage = chartInstanceRef.current.toBase64Image('image/png', 0.9);
    
    // store에 차트 저장
    addChart({
      chartType: chartType as 'bar' | 'pie' | 'line' | 'area',
      dataSource,
      chartTitle,
      xAxisLabel,
      yAxisLabel,
      dataPoints: [...dataPoints],
      chartImage: chartImage,
    });
  };

  // 저장된 차트 로드
  const loadChart = (savedChart: SavedChart) => {
    // 저장된 차트의 모든 데이터를 state에 설정
    setChartType(savedChart.chartType);
    setDataSource(savedChart.dataSource);
    setChartTitle(savedChart.chartTitle);
    setXAxisLabel(savedChart.xAxisLabel);
    setYAxisLabel(savedChart.yAxisLabel);
    // 데이터 포인트를 복사해서 설정 (401-416 라인의 Input 필드에 표시됨)
    setDataPoints([...savedChart.dataPoints]);
    
    // useEffect가 자동으로 차트를 렌더링하므로 직접 호출 불필요
    // state 업데이트 후 useEffect (146-167)가 실행되어 차트가 렌더링됨
  };

  // 컴포넌트 마운트 시 저장된 현재 차트 상태 복원
  useEffect(() => {
    if (currentChart && !chartType && !dataSource) {
      setChartType(currentChart.chartType);
      setDataSource(currentChart.dataSource);
      setChartTitle(currentChart.chartTitle);
      setXAxisLabel(currentChart.xAxisLabel);
      setYAxisLabel(currentChart.yAxisLabel);
      setDataPoints(currentChart.dataPoints);
    }
  }, []);

  // dataSource 변경 시 차트 제목, 축 라벨 자동 업데이트
  useEffect(() => {
    if (dataSource) {
      const selectedSource = dataSources.find(source => source.value === dataSource);
      if (selectedSource) {
        setChartTitle(selectedSource.chartTitle);
        setXAxisLabel(selectedSource.xAxis);
        setYAxisLabel(selectedSource.yAxis);
      }
    }
  }, [dataSource]);

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
                        className="flex-1 h-9 rounded-md px-3 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
                        disabled={dataPoints.length >= 10}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        추가
                      </Button>
                      <Button
                        onClick={removeDataPoint}
                        className="flex-1 h-9 rounded-md px-3 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
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
                    savedCharts.slice(0, 4).map((savedChart: SavedChart) => (
                      <div
                        key={savedChart.id}
                        className="w-[170px] h-[120px] bg-seed-light/20 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-all duration-200 overflow-hidden group relative"
                      >
                        <div onClick={() => loadChart(savedChart)} className="w-full h-full">
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
                        {/* 삭제 버튼 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeChart(savedChart.id);
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                          title="차트 삭제"
                        >
                          <X className="h-3 w-3" />
                        </button>
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
                    <Button className="h-9 rounded-md px-3 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground" onClick={downloadChart} disabled={!chartInstanceRef.current}>
                      <Download className="h-4 w-4 mr-1" />
                      PNG
                    </Button>
                    <Button className="h-9 rounded-md px-3 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground" onClick={saveChart} disabled={!chartInstanceRef.current}>
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
            
          </div>
        </div>
      </div>
    </div>
  );
}
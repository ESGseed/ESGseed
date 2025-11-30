<!-- 79f2f66b-147a-4a97-81fb-958c5d709f55 692e06e3-c0d1-4ed0-9fb1-c8d97512fe1c -->
# frontend 디렉토리 구조 개선 전략

## 현재 구조 분석

### 문제점

1. **pages vs containers 개념 혼재**: `features/esgseed/pages/`에 `EsgseedApp.tsx`, `ConsultView.tsx` 등이 있지만 용도가 명확하지 않음
2. **라우팅 구조 불일치**: `/esg` 하나만 있고 `/esg/consult`, `/esg/report` 분리 안됨
3. **컴포넌트 분산**: UI 컴포넌트가 `features/esgseed/components/ui/`에만 있고 전역 `components/ui/` 없음
4. **Store 위치**: 전역 store는 루트에 있지만 feature별 slice 분리가 필요
5. **esgseed vs esg 네이밍 혼재**: `esgseed` 폴더지만 라우트는 `/esg`

### 목표 구조

```
src/
├─ app/
│   ├─ esg/
│   │   ├─ consult/
│   │   │   └─ page.tsx          → ConsultContainer 래핑
│   │   ├─ report/
│   │   │   └─ page.tsx          → ReportContainer 래핑
│   │   ├─ layout.tsx            → ESG 공통 레이아웃 (Header 등)
│   │   └─ page.tsx              → 랜딩 또는 /esg/consult로 리다이렉트
│   ├─ soccer/
│   │   └─ page.tsx
│   ├─ layout.tsx                → 전역 레이아웃
│   └─ page.tsx                  → 홈
│
├─ features/
│   ├─ esg/
│   │   ├─ components/           → ESG 전용 컴포넌트
│   │   │   ├─ ChatBubble.tsx
│   │   │   ├─ ChecklistItem.tsx
│   │   │   └─ ExportButtons.tsx
│   │   ├─ containers/           → 페이지 레벨 컨테이너
│   │   │   ├─ ConsultContainer.tsx
│   │   │   └─ ReportContainer.tsx
│   │   ├─ hooks/                → ESG 전용 커스텀 훅
│   │   │   └─ useEsgExport.ts
│   │   └─ types.ts              → ESG 타입 정의
│   │
│   └─ soccer/
│       ├─ components/
│       ├─ containers/
│       └─ types.ts
│
├─ components/
│   ├─ ui/                       → shadcn/ui 스타일 전역 UI
│   │   ├─ button.tsx
│   │   └─ utils.ts
│   └─ layout/                   → 전역 레이아웃 컴포넌트
│       └─ AppHeader.tsx
│
├─ store/
│   ├─ slices/
│   │   ├─ esgSlice.ts
│   │   ├─ soccerSlice.ts
│   │   └─ uiSlice.ts
│   └─ useStore.ts
│
├─ lib/
│   └─ api.ts
│
└─ types/
    └─ common.ts                 → 공통 타입
```

## 주요 변경 사항

### 1. 네이밍 통일

- `esgseed` → `esg`로 통일
- `pages` → `containers`로 변경 (Next.js App Router와 혼동 방지)

### 2. 라우팅 분리

- `/esg` 메인 페이지
- `/esg/consult` 전문가 상담 페이지
- `/esg/report` 최종 보고서 페이지
- ESG 전용 `layout.tsx` 생성 (공통 Header)

### 3. 컴포넌트 계층 분리

- **전역**: `src/components/ui/` - 프로젝트 전체에서 재사용 가능한 UI
- **Feature별**: `src/features/esg/components/` - ESG에서만 사용
- **Container**: 페이지 레벨 로직 + 컴포넌트 조합

### 4. Store 정리

- `esgseedSlice.ts` → `esgSlice.ts`
- activeTab 제거 (라우팅으로 대체)

### 5. 추가 디렉토리

- `features/esg/hooks/`: ESG 전용 커스텀 훅
- `components/layout/`: 전역 레이아웃 컴포넌트
- `types/`: 공통 타입 정의

## 마이그레이션 순서

1. **디렉토리 생성**

   - `src/components/ui`, `src/components/layout`
   - `src/features/esg` (esgseed 리네이밍)
   - `src/features/esg/containers`, `src/features/esg/hooks`
   - `src/types`

2. **컴포넌트 이동 및 리팩토링**

   - `features/esgseed/pages/ConsultView.tsx` → `features/esg/containers/ConsultContainer.tsx`
   - `features/esgseed/pages/ReportView.tsx` → `features/esg/containers/ReportContainer.tsx`
   - `features/esgseed/pages/EsgseedApp.tsx` 제거 (라우팅으로 대체)
   - `features/esgseed/components/ui/*` → `src/components/ui/`
   - `features/esgseed/components/Header.tsx` → 분리:
     - 전역 부분 → `components/layout/AppHeader.tsx`
     - ESG 전용 부분 → `features/esg/components/EsgHeader.tsx`

3. **라우팅 재구성**

   - `app/esg/layout.tsx` 생성 (ESG 공통 레이아웃)
   - `app/esg/page.tsx` 수정 (리다이렉트 또는 랜딩)
   - `app/esg/consult/page.tsx` 생성
   - `app/esg/report/page.tsx` 생성

4. **Store 정리**

   - `esgseedSlice.ts` → `esgSlice.ts`
   - `activeTab` 제거 (라우팅으로 대체)
   - import 경로 업데이트

5. **타입 정리**

   - 공통 타입을 `src/types/common.ts`로 이동
   - Feature별 타입은 각 `features/*/types.ts`에 정의

6. **Import 경로 일괄 수정**

   - 모든 파일의 import 경로 업데이트
   - ESLint/TypeScript 오류 해결

7. **테스트 및 검증**

   - `pnpm build` 성공 확인
   - 모든 라우트 동작 확인 (`/`, `/soccer`, `/esg`, `/esg/consult`, `/esg/report`)
   - 상태 공유 확인

## 핵심 개선 효과

1. **명확한 책임 분리**: 전역 vs Feature별 vs 페이지별 컴포넌트
2. **확장 가능성**: 새로운 feature 추가 시 동일한 패턴 적용
3. **라우팅 개선**: URL이 기능을 명확히 반영
4. **유지보수성**: 파일 위치만으로 용도 파악 가능
5. **일관성**: 네이밍 및 구조의 일관성 확보

### To-dos

- [ ] pnpm으로 zustand 의존성 설치
- [ ] src/store/index.ts 생성 - 타입, 상태, actions 정의
- [ ] page.tsx의 useState를 useStore로 마이그레이션
- [ ] soccer/page.tsx의 로컬 상태를 Store로 이전
- [ ] pnpm dev로 동작 확인 및 DevTools 점검
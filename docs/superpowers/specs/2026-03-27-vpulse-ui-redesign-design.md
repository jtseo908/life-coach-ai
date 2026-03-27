# VPULSE UI/UX 전체 리디자인 스펙

## Context

현재 "건강-재무 코치"라는 이름의 MVP가 기능적으로 완성된 상태. 핵심 기능(체크인→AI 파싱→점수화→코칭→크로스 인사이트)은 동작하지만, 시각적 아이덴티티와 UI 폴리시가 부족하여 "처음 봤을 때 우와!" 하는 임팩트가 없음. 서비스명 리브랜딩 + 전체 페이지 UI 리디자인을 통해 서비스 정체성을 확립하고 사용자 첫인상을 극적으로 개선한다.

---

## 1. 브랜드 아이덴티티

### 서비스명
- **VPULSE** (Vital + Pulse)
- Vital(삶에 필수적인) + Pulse(맥박, 시장의 맥) = 건강과 자산을 아우르는 삶의 리듬

### 태그라인
- **메인**: 체력 × 자산, 매일 짚는 삶의 맥박
- **훅 카피** (로그인 페이지): 몸이 바뀌면, 수익률도 바뀝니다.
- **서브**: AI가 매일 당신의 체력과 자산을 진단합니다.

### 로고
- **V**: 그린→블루 세로 그래디언트 (#22c55e → #3b82f6) + drop-shadow glow
- **PULSE**: 화이트 (#f1f5f9)
- Shiny Text 효과 적용 (빛이 은은하게 흘러가는 애니메이션)
- 파비콘/앱 아이콘: V만 단독 사용 (그래디언트 유지)

### 색상 시스템

| 역할 | 색상 | 용도 |
|------|------|------|
| 건강 | #22c55e (green-500) | 건강 점수, 운동, 건강 코칭 |
| 자산 | #3b82f6 (blue-500) | 재무 점수, 포트폴리오, 재무 코칭 |
| AI/크로스 | #a78bfa (violet-400) | 크로스 인사이트, AI 분석, AI 코칭 |
| 주의 | #facc15 (yellow-400) | 경고 상태 (수면 부족 등) |
| 위험 | #f87171 (red-400) | 손실, 위험 경고 |
| 배경 | #050510 | 메인 배경 (현재 #0a0a0a에서 더 깊게) |
| 글래스 카드 | rgba(255,255,255,0.03) | backdrop-blur(16px) + border rgba(255,255,255,0.06) |
| 텍스트 | #f1f5f9 / #e2e8f0 / #94a3b8 / #64748b / #475569 | 계층별 텍스트 |

### 톤앤매너
- **앵커**: 성장지향 (인생 최적화 세계관)
- **체크인/온보딩**: 캐주얼 + 접근적 (A톤)
- **점수/코칭/진단**: 전문적 + 프리미엄 (B톤)

---

## 2. 비주얼 디자인 방향

### Vital Mix = C(데이터 중심) + B(글래스모피즘) + A(네온 글로우) + WHOOP 스타일

| 요소 | 스타일 |
|------|--------|
| 배경 | Soft Aurora — 그린/블루/퍼플 오로라가 천천히 움직임 |
| 카드 | 글래스모피즘 — rgba(255,255,255,0.03), backdrop-blur(16px), border rgba(255,255,255,0.06), border-radius: 16px |
| 데이터 포인트 | WHOOP 스타일 글로우 — 숫자/도트에 box-shadow, text-shadow로 발광 |
| 차트 | 면적 그래디언트 + 끝점 글로우 도트 |
| 상태 필(pill) | 각 영역 색상의 rgba(0.08) 배경 + rgba(0.15) 보더 + backdrop-blur |
| 크로스 인사이트 카드 | Border Glow (퍼플) — box-shadow: 0 0 20px rgba(167,139,250,0.04) |

### React Bits 효과 (4개)

| 효과 | 적용 위치 | 구현 방식 |
|------|----------|----------|
| **Count Up** | 통합 점수(78.5), 건강(82), 자산(75) | 페이지 진입 / 체크인 저장 후 0→목표값 애니메이션 |
| **Shiny Text** | VPULSE 로고, "TODAY'S VPULSE" 라벨 | 빛이 좌→우로 은은하게 흘러감 |
| **Soft Aurora** | 모든 페이지 배경 | 그린/블루/퍼플 radial-gradient가 천천히 이동 (CSS animation) |
| **Border Glow** | 크로스 인사이트 카드, 포트폴리오 진단 등급 카드 | 퍼플 글로우 보더 + subtle pulse |

---

## 3. 반응형 레이아웃

### 브레이크포인트

| 범위 | 레이아웃 | max-width |
|------|---------|-----------|
| ~768px | 모바일 — 세로 스택 | max-w-lg (~512px) |
| 768px~1024px | 태블릿 — 확장된 세로 | max-w-2xl (~672px) |
| 1024px+ | 데스크톱 — 2컬럼 그리드 | max-w-6xl (~1152px) |

### 데스크톱 대시보드 구조
```
[Top Nav: VPULSE 로고 + 태그라인 | 날짜 + 아바타]
[점수 히어로 바 (통합점수 + 체력/자산) | 크로스 인사이트 카드]
[2-Column Grid]
  Left: 데일리 체크인 + AI 코칭(건강/재무 나란히)
  Right: 포트폴리오 + 성장 추이
```

### 모바일 대시보드 구조
```
[Header: VPULSE 로고 | 아바타]
[점수 히어로 카드 (세로)]
[체크인 섹션]
[AI 코칭 섹션]
[포트폴리오 섹션]
[성장 추이 섹션]
```

---

## 4. 페이지별 디자인

### 4.1 로그인 페이지

**모바일:**
- 전체 화면 중앙 정렬
- Soft Aurora 배경
- VPULSE 로고 (Shiny Text, 48px)
- 태그라인: "체력 × 자산, 매일 짚는 삶의 맥박"
- 훅 카피: "몸이 바뀌면, 수익률도 바뀝니다. AI가 매일 당신의 체력과 자산을 진단합니다."
- Google 로그인 버튼 (흰색, rounded-xl, shadow)
- 하단: "🔒 데이터는 안전하게 암호화됩니다"

**데스크톱:**
- 2분할 레이아웃
- 좌측: 대시보드 미리보기 카드 (살짝 3D perspective 틸트) + 훅 카피
- 우측: VPULSE 로고 + 태그라인 + Google 로그인 버튼
- 좌측의 미리보기로 "이런 걸 볼 수 있다"는 기대감 연출

### 4.2 온보딩 페이지

**구조 변경:** 현재 한 페이지 스크롤 → **3스텝 프로그레스 위저드**

**Step 1: 목표 설정** (건강목표 + 재무목표)
- 글래스 카드 안에 2개 입력 필드
- placeholder로 예시 제공
- 스텝 인디케이터: ● — ○ — ○

**Step 2: 신체정보** (선택)
- 기본: 성별, 나이, 키, 체중, 활동수준
- 고급(토글): 골격근량, 체지방, BMI, 기초대사량
- "건너뛰기" 버튼 (ghost style) + "저장" 버튼 (green)
- 스텝 인디케이터: ✓ — ● — ○

**Step 3: 포트폴리오** (필수)
- 자유형 텍스트 입력
- "✦ AI로 분석하기" 버튼 (퍼플 그래디언트, AI 느낌)
- 파싱 결과: 종목 리스트 카드 (수정 가능)
- 스텝 인디케이터: ✓ — ✓ — ●
- 마지막 스텝이라 "시작하기" 버튼 (green, glow shadow)

**공통 디자인:**
- max-w-xl (560px) 중앙 정렬
- 각 스텝의 활성 카드: 해당 영역 색상 보더 glow
- 스텝 인디케이터: 완료=그린 체크 glow, 활성=영역색 보더, 대기=회색

**스텝 순서 근거:**
- 목표→신체정보: 건강 목표 직후 신체 기준점 설정이 자연스러움
- 신체정보→포트폴리오: 선택 항목을 중간에 배치하여 이탈 최소화
- 포트폴리오가 마지막: AI 파싱의 "우와" 순간으로 온보딩 피니시

### 4.3 대시보드 페이지

**점수 히어로 섹션:**
- 통합 VPULSE 점수 (Count Up 애니메이션, 큰 숫자)
- 체력/자산 서브 점수 (글로우 도트 + 프로그레스 바)
- 데스크톱: 옆에 크로스 인사이트 카드 배치
- 모바일: 아래에 크로스 인사이트 카드

**데일리 체크인 섹션:**
- 텍스트 입력 (글래스 카드)
- 이미지 첨부 버튼
- "AI로 분석하기" 버튼 → 파싱 결과 프리뷰
- 상태 필(pill): 운동 등급, 분산도, 수면 상태 등 한줄 요약

**AI 코칭 섹션:**
- 건강 코칭 / 재무 코칭 (데스크톱: 나란히, 모바일: 세로)
- 각 코칭 카드: 영역색 보더 왼쪽 accent line
- Animated List로 항목 순차 등장
- 크로스 인사이트: Border Glow 퍼플 카드

**포트폴리오 섹션:**
- 종목 리스트 (수익률 컬러 코딩: 그린=수익, 레드=손실)
- "포트폴리오 전문 진단" 버튼
- 진단 결과: 등급 카드 (A~F, Border Glow) + 종목별 판정

**성장 추이 섹션:**
- Recharts 라인 차트 유지
- 면적 그래디언트 추가 (그린/블루 fill)
- 끝점 글로우 도트
- 7일/30일 토글 (글래스 스타일 탭)

---

## 5. 컴포넌트 디자인 토큰

### 카드
```
기본 글래스 카드:
  background: rgba(255,255,255,0.03)
  backdrop-filter: blur(16px)
  border: 1px solid rgba(255,255,255,0.06)
  border-radius: 16px
  padding: 16px (모바일) / 20px (데스크톱)

강조 글래스 카드 (크로스 인사이트 등):
  + box-shadow: 0 0 20px rgba(영역색,0.04)
  + border-color: rgba(영역색,0.12)
```

### 버튼
```
Primary (저장/시작):
  background: linear-gradient(135deg, #22c55e, #16a34a)
  color: white
  border-radius: 12px
  box-shadow: 0 4px 20px rgba(34,197,94,0.25)

AI Action (분석/진단):
  background: linear-gradient(135deg, rgba(167,139,250,0.2), rgba(59,130,246,0.2))
  border: 1px solid rgba(167,139,250,0.3)
  color: #c4b5fd

Secondary/Ghost:
  background: transparent
  border: 1px solid rgba(255,255,255,0.1)
  color: #94a3b8

Google Login:
  background: rgba(255,255,255,0.95)
  color: #1f2937
  box-shadow: 0 4px 24px rgba(0,0,0,0.3)
```

### 상태 필(Pill)
```
background: rgba(영역색, 0.08)
border: 1px solid rgba(영역색, 0.15)
color: 영역색의 밝은 톤
font-size: 10px~11px
padding: 4px 10px
border-radius: 20px
backdrop-filter: blur(4px)
```

### 글로우 효과
```
텍스트 글로우: text-shadow: 0 0 20px rgba(색상, 0.4)
도트 글로우: box-shadow: 0 0 6px rgba(색상, 0.5)
카드 글로우: box-shadow: 0 0 20px rgba(색상, 0.04)
```

---

## 6. 애니메이션 가이드

| 효과 | 타이밍 | 용도 |
|------|--------|------|
| Count Up | 1.5s ease-out | 점수 숫자 |
| Shiny Text | 3s linear infinite | 로고, 라벨 |
| Soft Aurora | 20s ease-in-out infinite | 배경 |
| Border Glow pulse | 2s ease-in-out infinite | 크로스 인사이트 카드 |
| Animated List stagger | 0.3s delay per item | 코칭 항목 등장 |
| 페이지 전환 | 0.3s ease-out | 온보딩 스텝 전환 |
| 카드 hover (데스크톱) | 0.2s ease | 살짝 밝아짐 + border 강조 |

**접근성:** `prefers-reduced-motion` 미디어 쿼리 존중. 해당 설정 시 모든 애니메이션 비활성화.

---

## 7. 변경 대상 파일

### 신규 생성
- `src/components/ui/CountUp.tsx` — 카운트업 애니메이션 컴포넌트
- `src/components/ui/ShinyText.tsx` — 빛 흐름 텍스트 컴포넌트
- `src/components/ui/SoftAurora.tsx` — 오로라 배경 컴포넌트
- `src/components/ui/BorderGlow.tsx` — 글로우 보더 카드 컴포넌트
- `src/components/ui/GlassCard.tsx` — 글래스모피즘 카드 컴포넌트
- `src/components/ui/StatusPill.tsx` — 상태 필 컴포넌트
- `src/components/onboarding/GoalSettingSection.tsx` — (기존 유지, 리디자인)
- `src/components/onboarding/StepIndicator.tsx` — 스텝 프로그레스 인디케이터

### 주요 수정
- `src/app/layout.tsx` — 메타데이터(타이틀, 설명) 변경, 폰트 조정
- `src/app/globals.css` — 배경색, 기본 스타일 변경
- `src/app/login/page.tsx` — 전체 리디자인 (오로라 + 로고 + 훅카피 + 데스크톱 2분할)
- `src/app/onboarding/page.tsx` — 3스텝 위저드로 구조 변경, 스텝 순서 변경
- `src/app/page.tsx` — 반응형 2컬럼 그리드, 점수 히어로 바, 헤더 변경
- `src/components/dashboard/DailyCheckinSection.tsx` — 글래스 카드 + 상태 필
- `src/components/dashboard/ScoreSection.tsx` — Count Up + 글로우 + 히어로 통합점수
- `src/components/dashboard/CoachingSection.tsx` — Animated List + 영역색 accent
- `src/components/dashboard/PortfolioSection.tsx` — 글래스 카드 + 수익률 컬러코딩
- `src/components/dashboard/TrendSection.tsx` — 면적 그래디언트 차트 + 글로우 도트
- `src/components/ui/ScoreGauge.tsx` — 글로우 효과 추가 또는 히어로 점수로 대체
- `src/components/onboarding/PortfolioSetupSection.tsx` — 글래스 카드 리디자인
- `src/components/onboarding/BodyProfileSection.tsx` — 글래스 카드 리디자인

### Tailwind 설정
- `tailwind.config.ts` 또는 `globals.css` — 커스텀 애니메이션 키프레임 추가 (aurora, shiny, glow-pulse)

---

## 8. 검증 방법

1. **시각 검증**: 로컬에서 각 페이지(로그인/온보딩/대시보드) 확인
   - 모바일 뷰포트 (375px) 확인
   - 데스크톱 뷰포트 (1280px) 확인
2. **애니메이션 검증**: Count Up, Shiny Text, Aurora, Border Glow 동작 확인
3. **접근성**: `prefers-reduced-motion` 시 애니메이션 비활성화 확인
4. **기능 유지**: 기존 체크인→파싱→코칭 플로우가 정상 동작하는지 확인
5. **온보딩 플로우**: 3스텝 위저드 (목표→신체정보→포트폴리오) 순서 확인, 건너뛰기 동작 확인
6. **반응형**: 768px, 1024px 브레이크포인트에서 레이아웃 전환 확인

# roco 브랜드 가이드라인

**버전**: 1.0
**작성일**: 2026-03-09
**용도**: 디자인 토큰, 컴포넌트, UI 구현의 시각적 기준

---

## 1. 브랜드 퍼스널리티

### 핵심 키워드

| 키워드 | 정의 | Do | Don't |
|--------|------|----|-------|
| **Considered** | 신중하고 깊이 있다. 정보를 과잉 제공하지 않는다 | 꼭 필요한 정보만 노출, 충분한 여백 | 설명 과잉, 기능 나열 |
| **Quiet Authority** | 전문성을 드러내지 않아도 신뢰가 간다 | 간결한 문장, 확신 있는 어조 | 과장된 수식, 자랑 |
| **Warm Minimal** | 차갑지 않다. 소재감에서 오는 온기 | 따뜻한 오프화이트 베이스, 절제된 색상 | 순백·순흑의 차가운 대비 |
| **Honest** | 과장 없이 본질만. "Less but better" | 기능이 곧 형태, 장식 배제 | 불필요한 애니메이션, 장식적 요소 |

### Anti-traits (절대 아닌 것)

- Cute / Playful — 귀엽거나 장난스러운 느낌
- Corporate / Cold — 기업스럽고 차가운 느낌
- Loud / Flashy — 요란하거나 과한 강조

### 디자인 철학 레퍼런스

**Dieter Rams의 10원칙** 중 핵심 3가지를 기준으로 삼는다.

- *Good design is as little design as possible* — 필요한 것만 남긴다
- *Good design is honest* — 실제보다 강하거나 혁신적으로 보이게 만들지 않는다
- *Good design is unobtrusive* — 제품은 도구다. 장식품도, 예술품도 아니다

---

## 2. 컬러 시스템

### 라이트 모드

| 역할 | 토큰명 | 색상값 | 비고 |
|------|--------|--------|------|
| Background | `--color-bg` | `#FDFCFA` | 따뜻한 오프화이트. ACR 라임스톤 톤 |
| Surface (카드 등) | `--color-surface` | `#FFFFFF` | 콘텐츠가 배경 위로 떠 있는 느낌 |
| Border / Divider | `--color-border` | `#EAE6DF` | 배경보다 약간 어두운 웜 톤 |
| Text Primary | `--color-text-primary` | `#111111` | 명확한 가독성 |
| Text Secondary | `--color-text-secondary` | `#6B6560` | 웜 미드 그레이 |
| Text Disabled | `--color-text-disabled` | `#B0AAA3` | |
| Primary Action (버튼 등) | `--color-action` | `#1A1917` | 웜 니어블랙. 강조색 대신 명도 대비 활용 |
| Action Text | `--color-action-text` | `#F7F4F0` | Primary Action 위 텍스트 |
| Accent | `--color-accent` | `#C4A882` | 샌드/웜탠. 매우 제한적 사용 (뱃지, 하이라이트) |

### 다크 모드

| 역할 | 토큰명 | 색상값 | 비고 |
|------|--------|--------|------|
| Background | `--color-bg` | `#1A1917` | 차갑지 않은 다크 차콜 |
| Surface | `--color-surface` | `#252220` | 배경보다 약간 밝은 차콜 |
| Border / Divider | `--color-border` | `#333028` | |
| Text Primary | `--color-text-primary` | `#F0EDE9` | 웜 오프화이트 |
| Text Secondary | `--color-text-secondary` | `#9E9890` | |
| Text Disabled | `--color-text-disabled` | `#5A5550` | |
| Primary Action | `--color-action` | `#F0EDE9` | |
| Action Text | `--color-action-text` | `#1A1917` | |
| Accent | `--color-accent` | `#C4A882` | 라이트/다크 동일 |

### 시맨틱 컬러 (라이트/다크 공통)

| 상태 | 토큰명 | 색상값 |
|------|--------|--------|
| Success | `--color-success` | `#2E7D32` |
| Warning | `--color-warning` | `#7A4F00` |
| Danger | `--color-danger` | `#C62828` |
| Info | `--color-info` | `#1565C0` |

### 접근성 기준

- 일반 텍스트 대비: **최소 4.5:1** (WCAG 2.2 AA)
- 큰 텍스트(18px+ 또는 Bold 14px+): **최소 3:1**
- 색상만으로 상태를 전달하지 않는다. 텍스트/아이콘 병행 필수.

---

## 3. 타이포그래피

### 폰트

**Pretendard** 단일 패밀리 사용.

- 한글 + 라틴 모두 커버
- 웨이트 변화(Light 300 → ExtraBold 800)로 모든 위계 처리
- 별도 디스플레이 폰트 없음 → 디터 람스 철학 부합
- 라이선스: SIL Open Font License (웹/앱 무료)

```
https://github.com/orioncactus/pretendard
```

### 타입 스케일 (base 16px, ratio 1.25)

| 토큰명 | 크기 | Line-height | Weight | 사용처 |
|--------|-----:|-------------|--------|--------|
| `--text-4xl` | 49px | 1.15 | 700 | 랜딩 히어로 |
| `--text-3xl` | 39px | 1.2 | 700 | 페이지 타이틀 |
| `--text-2xl` | 31px | 1.25 | 600 | 섹션 타이틀 |
| `--text-xl` | 25px | 1.3 | 600 | 카드 타이틀 |
| `--text-lg` | 20px | 1.4 | 500 | 서브헤딩 |
| `--text-base` | 16px | 1.55 | 400 | 본문 |
| `--text-sm` | 13px | 1.5 | 400 | 보조 텍스트, 메타 |
| `--text-xs` | 10px | 1.4 | 400 | 캡션, 라벨 |

### 운영 규칙

- 행 길이: 단일 컬럼 기준 **45–75자** 권장
- `--text-xs` (10px) 이하는 UI 라벨 전용. 본문 사용 금지.
- Letter-spacing: 기본값 유지. 의도적 트래킹 조정 금지.

---

## 4. 로고

### 로고마크 구조

2×2 그리드, 셀 크기 47×47, 셀 간 간격 6px, 전체 캔버스 100×100.

| 셀 | 형태 | 설명 |
|----|------|------|
| 좌상 | D자형 | 왼쪽 직선, 오른쪽 반원 |
| 좌하 | 쿼터 원 | 좌하단 꼭짓점 중심, 우상 방향으로 스윕 |
| 우상 | 원 | |
| 우하 | 원 | |

파일 경로: `brand/logo.svg`

### 로고 컬러

| 버전 | 색상값 | 사용처 |
|------|--------|--------|
| Primary | `#1A1917` | 라이트 모드, 밝은 배경 위 |
| Reversed | `#F0EDE9` | 다크 모드, 어두운 배경 위 |

### 로고 사용 규칙

- 최소 크기: 24×24px (마크 단독)
- 로고 주변 여백: 로고 크기의 **1/4 이상** 확보
- 색상 변경 금지. Primary / Reversed 두 버전만 사용.
- 배경색 위에서 대비 4.5:1 미달 시 반드시 다른 버전 사용.

---

## 5. 형태 언어 (Shape Language)

로고의 원/호 기반 기하학에서 파생.

| 요소 | 값 | 비고 |
|------|-----|------|
| 카드 border-radius | `12px` | 과도한 pill 형태 지양 |
| 버튼 border-radius | `8px` | 소형 버튼은 `6px` |
| 입력 필드 border-radius | `8px` | |
| 모달/다이얼로그 border-radius | `16px` | |
| 뱃지/태그 border-radius | `999px` (pill) | 예외적 pill 허용 구간 |

---

## 6. 여백 & 스페이싱

4px 기반 그리드.

| 토큰명 | 값 | 용도 |
|--------|-----|------|
| `--space-1` | 4px | 아이콘-텍스트 간격 등 최소 단위 |
| `--space-2` | 8px | 컴포넌트 내부 소형 패딩 |
| `--space-3` | 12px | |
| `--space-4` | 16px | 기본 패딩 |
| `--space-5` | 20px | |
| `--space-6` | 24px | 섹션 내부 패딩 |
| `--space-8` | 32px | 카드 패딩 |
| `--space-10` | 40px | 섹션 간 간격 |
| `--space-12` | 48px | |
| `--space-16` | 64px | 페이지 레벨 여백 |

---

*이 문서는 디자인 토큰 및 컴포넌트 구현의 기준입니다. 변경 시 토큰 코드(tailwind.config)와 함께 업데이트해야 합니다.*

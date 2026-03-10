# 테스트 계획서

**기반**: PRD v1.30 / impl-checklist.md / state-tree.md v1.0
**작성일**: 2026-03-10
**총 케이스**: P0 78개, P1 53개 (5개 레이어)

---

## 테스트 레이어 구조

| 레이어 | 도구 | 위치 | 실행 커맨드 |
|--------|------|------|-------------|
| 단위 (Unit) | Vitest | `src/lib/*.test.ts`, `src/actions/*.test.ts` | `pnpm test` |
| 컴포넌트 | Vitest + Testing Library | `src/components/**/*.test.tsx` | `pnpm test` |
| 통합 (Integration) | Vitest | `src/**/*.integration.test.ts` | `pnpm test` |
| E2E | Playwright | `tests/e2e/**/*.spec.ts` | `pnpm test:e2e` |
| 추천 정확도 | Vitest | `src/lib/recommender/*.test.ts` | `pnpm test` |

---

## 테스트 인프라 설정

- `.env.test` — `DATABASE_URL` 테스트 전용 DB
- `src/tests/setup.ts` — `beforeEach` 테이블 초기화
- `src/app/api/test/session/route.ts` — E2E OAuth 우회 세션 생성 (test env only)
- `vitest.config.ts` — `projects` 배열로 server/components 분리, `passWithNoTests: true`
- Playwright `globalSetup` — 테스트 시작 전 `/api/test/session`으로 인증 쿠키 획득

---

## 1. 단위 테스트 (Unit)

### 1-1. `formatRegions` (`src/lib/utils.test.ts`)

| # | 입력 | 기대값 | 우선순위 |
|---|------|--------|---------|
| U-01 | `regions=["서울"]`, filter=없음 | `"서울"` | P0 |
| U-02 | `regions=["서울","부산","제주"]`, filter=없음 | `"서울 외 2곳"` | P0 |
| U-03 | `regions=["서울","부산"]`, filterRegions=`["부산"]` | `"서울 · 부산"` | P0 |
| U-04 | `regions=["서울","부산","제주"]`, filterRegions=`["제주"]` | `"서울 · 제주"` | P0 |
| U-05 | `regions=[]` | `""` | P1 |
| U-06 | `regions=["서울"]`, filterRegions=`["서울"]` (대표 지역이 필터 해당) | `"서울"` | P1 |

### 1-2. CF 코사인 유사도 (`src/lib/recommender/item-cf.test.ts`)

| # | 케이스 | 기대값 | 우선순위 |
|---|--------|--------|---------|
| U-07 | 완전히 동일한 두 벡터 | `similarity = 1.0` | P0 |
| U-08 | 완전히 반대 벡터 (공통 평가자 없음) | `similarity = 0.0` | P0 |
| U-09 | 부분 겹치는 벡터 | `0 < similarity < 1` | P0 |
| U-10 | 영벡터 (평가 없음) | `similarity = 0.0` (ZeroDivision 방지) | P0 |
| U-11 | 단일 공통 평가자, 동점 | `similarity = 1.0` | P1 |
| U-12 | 단일 공통 평가자, 다른 점수 | 계산값 검증 | P1 |

### 1-3. `getItemSimilarities` — 아이템 유사도 행렬

| # | 케이스 | 기대값 | 우선순위 |
|---|--------|--------|---------|
| U-13 | 2개 로스터리, 2명이 동일하게 5점 | 유사도 = 1.0 | P0 |
| U-14 | 2개 로스터리, 평가자 없음 | 유사도 = 0.0 | P0 |
| U-15 | 3개 로스터리, 교차 평가 | 행렬 대칭성 검증 | P0 |
| U-16 | 로스터리 1개만 존재 | 빈 행렬 반환 | P1 |

### 1-4. `getRecommendations` — CF 추천 결과

| # | 케이스 | 기대값 | 우선순위 |
|---|--------|--------|---------|
| U-17 | 평가 3개 이상 — CF 결과 반환 | score 내림차순, 평가한 로스터리 제외 | P0 |
| U-18 | 평가 2개 (조건 미달) | 폴백으로 위임 | P0 |
| U-19 | CF 결과 없음 (모든 로스터리 평가함) | 폴백으로 위임 | P0 |
| U-20 | `limit=5` 적용 | 5개 이하 반환 | P0 |
| U-21 | 신규 유저 (평가 0개) | 폴백 반환 | P0 |

### 1-5. `getPopularFallback` — 인기 폴백

| # | 케이스 | 기대값 | 우선순위 |
|---|--------|--------|---------|
| U-22 | 평균 평점 5개 로스터리 존재 | 평점 상위 5개 반환 | P0 |
| U-23 | 이미 평가한 로스터리는 제외 | 평가 안 한 것만 반환 | P0 |
| U-24 | 모든 로스터리 평가함 | 빈 배열 반환 | P1 |
| U-25 | 로스터리 없음 | 빈 배열 반환 | P1 |

### 1-6. Server Action 단위 — `submitOnboarding` (`src/actions/onboarding.test.ts`)

| # | 케이스 | 기대값 | 우선순위 |
|---|--------|--------|---------|
| U-26 | 인증된 유저, 유효한 5문항 | `{ success: true }`, DB에 저장 | P0 |
| U-27 | `q4=FIRST_TIME` — 4문항만 필수 | `{ success: true }` | P0 |
| U-28 | 미인증 유저 | `{ success: false, code: 'UNAUTHORIZED' }` | P0 |
| U-29 | Zod 유효성 실패 (q1 누락) | `{ success: false, code: 'VALIDATION' }` | P0 |
| U-30 | 이미 온보딩 완료한 유저 재시도 | 기존 데이터 덮어씌우거나 오류 | P1 |

### 1-7. Server Action 단위 — `upsertRating` / `deleteRating`

| # | 케이스 | 기대값 | 우선순위 |
|---|--------|--------|---------|
| U-31 | 신규 평가 제출 (1-5점) | `{ success: true }`, Rating 생성 | P0 |
| U-32 | 기존 평가 수정 | `{ success: true }`, 점수 갱신 | P0 |
| U-33 | 평가 삭제 | `{ success: true }`, Rating 삭제 | P0 |
| U-34 | 미인증 유저 | `{ success: false, code: 'UNAUTHORIZED' }` | P0 |
| U-35 | 존재하지 않는 roasteryId | `{ success: false, code: 'NOT_FOUND' }` | P0 |
| U-36 | 점수 범위 위반 (0 또는 6) | `{ success: false, code: 'VALIDATION' }` | P0 |
| U-37 | 클라이언트가 userId 전송 시 서버 userId로 대체 | 서버 auth()에서 조회한 userId 사용 | P0 |

### 1-8. Server Action 단위 — `toggleBookmark`

| # | 케이스 | 기대값 | 우선순위 |
|---|--------|--------|---------|
| U-38 | 북마크 추가 | `{ success: true, bookmarked: true }` | P0 |
| U-39 | 북마크 제거 (toggle) | `{ success: true, bookmarked: false }` | P0 |
| U-40 | 미인증 유저 | `{ success: false, code: 'UNAUTHORIZED' }` | P0 |
| U-41 | 존재하지 않는 roasteryId | `{ success: false, code: 'NOT_FOUND' }` | P0 |

### 1-9. proxy (middleware) 리디렉션 로직 (`src/proxy.test.ts`)

| # | 상태 | 접근 경로 | 기대 동작 | 우선순위 |
|---|------|----------|-----------|---------|
| U-42 | AUTH-ANON | `/home` | `/login` 리디렉션 | P0 |
| U-43 | AUTH-ANON | `/login` | 통과 | P0 |
| U-44 | AUTH-INCOMPLETE | `/home` | `/onboarding` 리디렉션 | P0 |
| U-45 | AUTH-INCOMPLETE | `/onboarding` | 통과 | P0 |
| U-46 | AUTH-COMPLETE | `/login` | `/home` 리디렉션 | P0 |
| U-47 | AUTH-COMPLETE | `/onboarding` | `/home` 리디렉션 | P0 |
| U-48 | AUTH-COMPLETE | `/home` | 통과 | P0 |
| U-49 | 모든 상태 | `/_next/static/**` | 통과 (matcher 제외) | P1 |

---

## 2. 컴포넌트 테스트 (Component)

> Vitest + `@testing-library/react`. 서버 컴포넌트는 통합 테스트로 이관.

### 2-1. `RoasteryCard`

| # | 케이스 | 검증 | 우선순위 |
|---|--------|------|---------|
| C-01 | 기본 렌더링 — 이름, 지역, 가격대 표시 | `getByText`, `getByRole` | P0 |
| C-02 | 단일 지역 | `"서울"` 표시 | P0 |
| C-03 | 복수 지역 (필터 없음) | `"서울 외 2곳"` 표시 | P0 |
| C-04 | 복수 지역 + 필터 해당 | `"서울 · 부산"` 표시 | P0 |
| C-05 | 북마크 버튼 초기 상태 (bookmarked=false) | 빈 하트 아이콘 | P0 |
| C-06 | 북마크 버튼 클릭 | `toggleBookmark` Server Action 호출 | P0 |
| C-07 | `useOptimistic` — 클릭 즉시 UI 반영 | 아이콘 즉시 변경 | P1 |
| C-08 | 평균 평점 표시 (소수점 1자리) | `"4.2"` 포맷 | P1 |

### 2-2. `RatingForm`

| # | 케이스 | 검증 | 우선순위 |
|---|--------|------|---------|
| C-09 | 별점 1-5 선택 | 선택된 별 강조 | P0 |
| C-10 | 한줄평 입력 (선택사항) | textarea 값 바인딩 | P0 |
| C-11 | 제출 버튼 클릭 | `upsertRating` 호출, 인자 검증 | P0 |
| C-12 | 기존 평가 로딩 | 초기값 채워진 상태 | P0 |
| C-13 | 삭제 버튼 클릭 | `deleteRating` 호출 | P0 |
| C-14 | 제출 중 loading 상태 | 버튼 disabled | P1 |
| C-15 | 오류 발생 시 오류 메시지 표시 | `role="alert"` | P1 |

### 2-3. `BookmarkButton`

| # | 케이스 | 검증 | 우선순위 |
|---|--------|------|---------|
| C-16 | bookmarked=false 렌더링 | 빈 하트 | P0 |
| C-17 | bookmarked=true 렌더링 | 채워진 하트 | P0 |
| C-18 | 클릭 → optimistic 업데이트 | 즉시 아이콘 전환 | P0 |
| C-19 | 서버 오류 시 롤백 | 원래 상태로 복귀 | P1 |

### 2-4. `OnboardingForm`

| # | 케이스 | 검증 | 우선순위 |
|---|--------|------|---------|
| C-20 | Q1-Q5 단계 순서 렌더링 | 각 질문 진행 | P0 |
| C-21 | `q4=FIRST_TIME` 선택 → Q5 스킵 | Q5 렌더링 안 됨 | P0 |
| C-22 | 이전 버튼으로 돌아가기 | 이전 질문 표시 | P0 |
| C-23 | 최종 제출 | `submitOnboarding` 호출, 인자 검증 | P0 |
| C-24 | 유효성 오류 (선택 안 함) | 오류 메시지 표시 | P1 |

### 2-5. `Navigation` (레이아웃)

| # | 케이스 | 검증 | 우선순위 |
|---|--------|------|---------|
| C-25 | `lg` 미만 화면 | BottomTab 렌더링, Header 숨김 | P0 |
| C-26 | `lg` 이상 화면 | Header 렌더링, BottomTab 숨김 | P0 |

---

## 3. 통합 테스트 (Integration)

> Vitest + 실제 테스트 DB. 각 테스트 전 DB 초기화.

### 3-1. 온보딩 통합 (`src/actions/onboarding.integration.test.ts`)

| # | 시나리오 | 검증 | 우선순위 |
|---|----------|------|---------|
| I-01 | 유저 생성 → 5문항 온보딩 제출 | `Onboarding` 레코드 생성, `User.preferences.onboardingVersion = 3` | P0 |
| I-02 | `q4=FIRST_TIME` → 4문항 제출 | 정상 저장, q5=null | P0 |
| I-03 | Q5에서 선택한 로스터리 → `Rating(source="onboarding", score=5)` 생성 | Rating 레코드 확인 | P0 |
| I-04 | 온보딩 완료 후 세션 `onboardingVersion` 반영 | session 콜백 검증 | P1 |

### 3-2. 평가 통합 (`src/actions/rating.integration.test.ts`)

| # | 시나리오 | 검증 | 우선순위 |
|---|----------|------|---------|
| I-05 | 첫 평가 제출 | Rating 생성, `Recommendation` 갱신 트리거 | P0 |
| I-06 | 평가 수정 | 기존 Rating 점수 변경 | P0 |
| I-07 | 평가 삭제 | Rating 삭제 확인 | P0 |
| I-08 | 3번째 평가 제출 → CF 활성 조건 충족 | `Recommendation` 레코드 upsert | P0 |
| I-09 | 평가 2개 상태 → 추천 비활성 | `Recommendation` 없음 | P1 |

### 3-3. 북마크 통합 (`src/actions/bookmark.integration.test.ts`)

| # | 시나리오 | 검증 | 우선순위 |
|---|----------|------|---------|
| I-10 | 북마크 추가 | Bookmark 레코드 생성 | P0 |
| I-11 | 북마크 재클릭 (제거) | Bookmark 레코드 삭제 | P0 |
| I-12 | 프로필 페이지에서 북마크 목록 조회 | 추가한 로스터리만 반환 | P0 |

### 3-4. 추천 시스템 통합 (`src/lib/recommender/recommender.integration.test.ts`)

| # | 시나리오 | 검증 | 우선순위 |
|---|----------|------|---------|
| I-13 | 유저 A: 평가 3개 → CF 실행 | `getRecommendations` 호출, score 저장 | P0 |
| I-14 | 유저 A, B 동일 취향 → A에게 B가 높게 평가한 로스터리 추천 | 추천 순위 검증 | P0 |
| I-15 | 평가 2개 유저 → 인기 폴백 반환 | 폴백 상위 5개 검증 | P0 |
| I-16 | 유저가 이미 평가한 로스터리는 추천에서 제외 | 평가 로스터리 목록 확인 | P0 |
| I-17 | EventLog 기록 — `recommendation_clicked` | 이벤트 저장 확인 | P1 |

### 3-5. 검색/필터 통합 (`src/actions/roastery.integration.test.ts`)

| # | 시나리오 | 검증 | 우선순위 |
|---|----------|------|---------|
| I-18 | 가격대 `MID` 필터 | `priceRange=MID` 로스터리만 반환 | P0 |
| I-19 | 디카페인 필터 | `decaf=true` 로스터리만 반환 | P0 |
| I-20 | 지역 `부산` 필터 (GIN index) | `regions` 배열에 "부산" 포함 로스터리 반환 | P0 |
| I-21 | 가격대 + 지역 AND 조합 | 두 조건 모두 만족 | P0 |
| I-22 | 키워드 검색 `"스텀프타운"` | 이름 포함 로스터리 반환 | P1 |
| I-23 | 빈 결과 (조건 없음) | 빈 배열 반환 | P1 |

---

## 4. E2E 테스트 (Playwright)

> `tests/e2e/` 위치. `globalSetup`에서 OAuth 우회 세션 설정.
> `baseURL = http://localhost:3000`

### 4-1. 인증 플로우 (`auth.spec.ts`)

| # | 시나리오 | 기대 동작 | 우선순위 |
|---|----------|-----------|---------|
| E-01 | 비로그인 → `/home` 접근 | `/login` 리디렉션 | P0 |
| E-02 | 로그인 페이지 렌더링 | Google/Kakao/Naver 버튼 표시 | P0 |
| E-03 | 온보딩 미완료 유저 → `/home` 접근 | `/onboarding` 리디렉션 | P0 |
| E-04 | 로그인 완료 유저 → `/login` 접근 | `/home` 리디렉션 | P0 |
| E-05 | 로그아웃 후 `/home` 접근 | `/login` 리디렉션 | P0 |

### 4-2. 온보딩 플로우 (`onboarding.spec.ts`)

| # | 시나리오 | 기대 동작 | 우선순위 |
|---|----------|-----------|---------|
| E-06 | 소셜 로그인 직후 → 온보딩 랜딩 | Q1 페이지 표시 | P0 |
| E-07 | Q1→Q2→Q3→Q4→Q5 순서 진행 | 각 단계 정상 렌더링 | P0 |
| E-08 | `q4=FIRST_TIME` 선택 → Q5 건너뜀 | Q5 없이 완료 | P0 |
| E-09 | Q5에서 로스터리 선택 | 선택 로스터리 Rating 자동 생성 | P0 |
| E-10 | 온보딩 완료 → `/home` 이동 | 홈 피드 렌더링 | P0 |
| E-11 | 온보딩 완료 후 `/onboarding` 재접근 | `/home` 리디렉션 | P0 |
| E-12 | 이전 버튼으로 Q 단계 되돌아가기 | 이전 선택 유지 | P1 |

### 4-3. 로스터리 목록/상세 (`roastery.spec.ts`)

| # | 시나리오 | 기대 동작 | 우선순위 |
|---|----------|-----------|---------|
| E-13 | `/roasteries` 접근 | 로스터리 카드 목록 표시 | P0 |
| E-14 | 카드 클릭 → 상세 페이지 | `/roasteries/[id]` 이동 | P0 |
| E-15 | 상세 페이지 — 이름, 대표 지역, 가격대 | 정보 표시 확인 | P0 |
| E-16 | 상세 페이지 — Bean 목록 | Bean 카드 렌더링 | P0 |
| E-17 | 상세 페이지 — 평균 평점, 평가 수 | 수치 표시 | P1 |

### 4-4. 검색/필터 (`filter.spec.ts`)

| # | 시나리오 | 기대 동작 | 우선순위 |
|---|----------|-----------|---------|
| E-18 | 가격대 `MID` 필터 선택 | 카드 목록 갱신, URL `?price=MID` | P0 |
| E-19 | 디카페인 토글 | 디카페인 로스터리만 표시 | P0 |
| E-20 | 지역 `서울` 선택 | 서울 포함 로스터리만 표시 | P0 |
| E-21 | 필터 복합 적용 (가격 + 지역) | AND 조건 적용 | P0 |
| E-22 | 필터 초기화 | 전체 목록 복귀 | P1 |
| E-23 | 빈 결과 상태 | "검색 결과 없음" 메시지 | P1 |
| E-24 | 페이지 새로고침 시 필터 유지 (URL 기반) | 동일 필터 상태 | P1 |

### 4-5. 평가 시스템 (`rating.spec.ts`)

| # | 시나리오 | 기대 동작 | 우선순위 |
|---|----------|-----------|---------|
| E-25 | 상세 페이지 → 별점 5 클릭 → 제출 | 평가 저장, UI 반영 | P0 |
| E-26 | 기존 평가 수정 | 별점 변경 후 저장 | P0 |
| E-27 | 평가 삭제 | 평가 제거, 별점 초기화 | P0 |
| E-28 | 미인증 상태 → 평가 시도 | 로그인 페이지 이동 | P0 |
| E-29 | 한줄평 입력 후 제출 | 저장된 코멘트 표시 | P1 |

### 4-6. CF 홈 피드 (`home-feed.spec.ts`)

| # | 시나리오 | 기대 동작 | 우선순위 |
|---|----------|-----------|---------|
| E-30 | 평가 0개 유저 `/home` | 인기 로스터리 5개 표시 | P0 |
| E-31 | 평가 1-2개 유저 `/home` | 인기 로스터리 폴백 표시 | P0 |
| E-32 | 평가 3개 이상 유저 `/home` | CF 추천 결과 표시 | P0 |
| E-33 | 추천 카드 클릭 → 상세 페이지 | 이동 + EventLog 기록 | P0 |
| E-34 | 홈 피드 카드 — 로스터리 이름, 지역, 평점 | 표시 확인 | P1 |

### 4-7. 즐겨찾기 (`bookmark.spec.ts`)

| # | 시나리오 | 기대 동작 | 우선순위 |
|---|----------|-----------|---------|
| E-35 | 상세 페이지 → 하트 버튼 클릭 | 즉시 아이콘 변경 (optimistic) | P0 |
| E-36 | 다시 클릭 → 북마크 해제 | 아이콘 복귀 | P0 |
| E-37 | 북마크한 로스터리 → 즐겨찾기 페이지 확인 | 목록에 표시 | P0 |
| E-38 | 즐겨찾기 페이지 → 해제 | 목록에서 제거 | P0 |
| E-39 | 미인증 → 북마크 시도 | 로그인 페이지 이동 | P0 |

### 4-8. 사용자 프로필 (`profile.spec.ts`)

| # | 시나리오 | 기대 동작 | 우선순위 |
|---|----------|-----------|---------|
| E-40 | `/profile` 접근 | 이름, 아바타, 통계 표시 | P0 |
| E-41 | 내 평가 목록 표시 | 평가한 로스터리 카드 | P0 |
| E-42 | 내 즐겨찾기 목록 표시 | 북마크 로스터리 카드 | P0 |
| E-43 | 로그아웃 버튼 클릭 | 세션 종료, `/login` 이동 | P0 |
| E-44 | 온보딩 취향 요약 표시 | Q1-Q5 선택 요약 | P1 |

---

## 5. 추천 정확도 검증

> 실제 DB 데이터 기반 offline evaluation. `pnpm test`로 실행.

### 5-1. 아이템 유사도 정확도 (`src/lib/recommender/accuracy.test.ts`)

| # | 케이스 | 기대값 | 우선순위 |
|---|--------|--------|---------|
| A-01 | 라이트 로스팅 2개 로스터리 — 동일 그룹 평가자 | 유사도 > 0.7 | P0 |
| A-02 | 라이트 vs 다크 로스팅 — 취향 반대 평가자 | 유사도 < 0.3 | P0 |
| A-03 | 5명 유저 × 10개 로스터리 시뮬레이션 | 상위 추천이 유저 미평가 로스터리 | P0 |
| A-04 | cold-start 유저 (평가 0개) | 폴백 결과 반환 (에러 없음) | P0 |
| A-05 | 추천 결과 다양성 — 동일 로스터리 중복 없음 | Set(results).size === results.length | P0 |

---

## 6. 테스트 우선순위 요약

| 레이어 | P0 | P1 | 합계 |
|--------|----|----|------|
| 단위 (Unit) | 29 | 20 | 49 |
| 컴포넌트 | 18 | 8 | 26 |
| 통합 | 18 | 5 | 23 |
| E2E | 29 | 15 | 44 |
| 추천 정확도 | 5 | 0 | 5 |
| **합계** | **99** | **48** | **147** |

---

## 7. 테스트 실행 전 체크리스트

- [ ] `.env.test` 테스트 DB URL 설정
- [ ] `pnpm prisma migrate dev` (테스트 DB)
- [ ] `pnpm prisma db seed` (테스트 시드 데이터)
- [ ] `src/app/api/test/session/route.ts` — `NODE_ENV=test`에서만 활성화 확인
- [ ] Playwright 브라우저 설치: `pnpm exec playwright install chromium`
- [ ] `vitest.config.ts` — `projects` 배열, `passWithNoTests: true` 확인

---

## 8. 주의 사항

- **OAuth 우회**: E2E 테스트는 실제 Google/Kakao/Naver OAuth 사용 불가 → `/api/test/session` API로 세션 직접 생성
- **DB 격리**: 각 통합 테스트 `beforeEach`에서 관련 테이블 `TRUNCATE` (CASCADE)
- **Vitest projects**: Server Action 테스트는 `environment: 'node'`, 컴포넌트 테스트는 `environment: 'jsdom'`
- **GIN index**: 지역 필터 통합 테스트 전 GIN 인덱스 생성 확인
- **EventLog 검증**: E2E에서 DB 직접 조회 또는 API endpoint로 이벤트 로그 확인

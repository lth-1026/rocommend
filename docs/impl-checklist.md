# 구현 체크리스트

**기반**: PRD v1.30 / state-tree.md v1.0
**브랜치 전략**: Git Flow — feat/* → develop (Squash merge)

---

## 진행 현황

| 피처 | 브랜치 | 상태 |
|------|--------|------|
| F-001 소셜 로그인 | `feat/auth-login` | 대기 |
| F-002 온보딩 설문 | `feat/onboarding` | 대기 |
| F-003 로스터리 목록/상세 | `feat/roastery-list-detail` | 대기 |
| F-004 검색/필터 | `feat/roastery-filter` | 대기 |
| F-005 평가 시스템 | `feat/rating-system` | 대기 |
| F-007 즐겨찾기 | `feat/bookmark` | 대기 |
| F-006 CF 추천 홈 피드 | `feat/home-feed-cf` | 대기 |

---

## 사전 작업

- [ ] `Onboarding` 모델에 `version Int @default(3)` 추가 + 마이그레이션
- [ ] `Recommendation` 모델 신규 추가 + 마이그레이션 (F-006 착수 전)
- [ ] `auth.ts` session 콜백에 `onboardingVersion` 주입 로직 추가
- [ ] `src/types/auth.ts` — Session 인터페이스 확장 (`onboardingVersion` 포함)

---

## F-001 소셜 로그인 `feat/auth-login`

### 공통 레이아웃
- [ ] `src/app/(auth)/layout.tsx` — 비로그인 전용 레이아웃 (로그인 상태면 `/home` 리디렉션)
- [ ] `src/app/(main)/layout.tsx` — Header 포함 메인 레이아웃
- [ ] `src/components/layout/Header.tsx` — 로고, 목록, 즐겨찾기, 사용자 메뉴/로그아웃
- [ ] `src/components/layout/SessionProvider.tsx` — NextAuth SessionProvider 래퍼 (`'use client'`)

### 페이지
- [ ] `src/app/(auth)/login/page.tsx` — 로그인 UI
- [ ] `src/app/(auth)/error/page.tsx` — OAuth 오류 페이지 (`?error=` 쿼리 파라미터 처리)
- [ ] `src/app/not-found.tsx` — 전역 404
- [ ] `src/app/page.tsx` — 루트 → `/login` 리디렉션

### 컴포넌트
- [ ] `src/components/auth/LoginButton.tsx` — Google/Kakao/Naver 소셜 로그인 버튼
- [ ] `src/components/auth/ErrorAlert.tsx` — OAuth 오류 메시지 표시

### 프록시 (proxy.ts) 리디렉션 규칙
- [ ] `AUTH-ANON` → 보호 경로 접근 시 `/login` 리디렉션
- [ ] `AUTH-INCOMPLETE` → `/onboarding` 외 경로 접근 시 `/onboarding` 리디렉션
- [ ] `AUTH-COMPLETE` → `/login`, `/onboarding` 접근 시 `/home` 리디렉션

---

## F-002 온보딩 설문 `feat/onboarding`

### 페이지
- [ ] `src/app/(auth)/onboarding/page.tsx` — Server Component (Q5용 로스터리 20개 SSR)

### 컴포넌트
- [ ] `src/components/onboarding/OnboardingWizard.tsx` — 스텝 상태 관리 (`currentStep`, `answers`, `submitStatus`)
- [ ] `src/components/onboarding/ProgressBar.tsx` — "2 / 5" 형식 진행 표시
- [ ] `src/components/onboarding/steps/Q1BrewingMethod.tsx` — 복수 선택, 최소 1개
- [ ] `src/components/onboarding/steps/Q2PurchaseStyle.tsx` — 단일 선택
- [ ] `src/components/onboarding/steps/Q3PriceRange.tsx` — 복수 선택, "크게 신경 안 써요" 상호 배타 규칙
- [ ] `src/components/onboarding/steps/Q4Frequency.tsx` — 단일 선택, `FIRST_TIME` 분기 (4/4 완료 vs 5/5 → Q5)
- [ ] `src/components/onboarding/steps/Q5Roasteries.tsx` — 복수 선택, 최소 3개, 20개 고정 목록

### 서버 액션
- [ ] `src/actions/onboarding.ts` — `submitOnboarding(data)`:
  - [ ] `Onboarding` 레코드 upsert (버전 포함)
  - [ ] Q4 != `FIRST_TIME`이면 Q5 선택 로스터리 → `Rating` bulk upsert (score=5)
  - [ ] 인터랙티브 트랜잭션으로 묶기
  - [ ] `revalidatePath('/home')`

### 타입
- [ ] `src/types/onboarding.ts` — `OnboardingAnswers` 타입

---

## F-003 로스터리 목록/상세 `feat/roastery-list-detail`

### 페이지
- [ ] `src/app/(main)/roasteries/page.tsx` — 목록 (Server Component, SSR)
- [ ] `src/app/(main)/roasteries/[id]/page.tsx` — 상세 (`notFound()` 처리 포함)

### 컴포넌트
- [ ] `src/components/roastery/RoasteryCard.tsx` — 이름, 지역, 가격대, 평균 평점, 디카페인 배지
- [ ] `src/components/roastery/RoasteryGrid.tsx` — 카드 그리드 레이아웃
- [ ] `src/components/roastery/RoasteryDetail.tsx` — 상세 정보 (이름, 대표 지역, 가격대, 외부 링크, 평균 평점)
- [ ] `src/components/roastery/RegionDisplay.tsx` — 지역 표시 로직 재사용 컴포넌트
- [ ] `src/components/roastery/SortSelector.tsx` — 이름순/인기순 정렬 (URL 반영)

### 데이터 레이어
- [ ] `src/lib/queries/roastery.ts` — `getRoasteries(sort)`, `getRoasteryById(id)`, `getAverageRating(roasteryId)`

### 유틸리티
- [ ] `src/lib/utils.ts` — `formatRegions(regions, filterRegions?)` 순수 함수 추가
  - 단일 지역: `"서울"`
  - 복수 (필터 없음): `"서울 외 2곳"`
  - 복수 + 비대표 지역이 필터 해당: `"서울 · 부산"`
- [ ] `src/lib/utils.test.ts` — `formatRegions` 단위 테스트

### 타입
- [ ] `src/types/roastery.ts` — `RoasteryWithStats`, `PriceRange` 등

---

## F-004 검색/필터 `feat/roastery-filter`

### 컴포넌트
- [ ] `src/components/roastery/FilterPanel.tsx` — 가격대(OR) / 디카페인 / 지역(OR) 필터 UI
- [ ] `src/components/roastery/SearchInput.tsx` — 키워드 검색 (디바운스 적용)
- [ ] `src/components/roastery/FilterBadge.tsx` — 적용된 필터 태그 + 초기화 버튼
- [ ] `src/components/roastery/EmptyFilterResult.tsx` — 결과 0개 안내

### 데이터 레이어 수정
- [ ] `src/lib/queries/roastery.ts` — `getRoasteries(filters, sort)` 확장
  - [ ] 가격대: `priceRange` OR 조합
  - [ ] 디카페인: `decaf = true`
  - [ ] 지역: `hasSome: selectedRegions` (Prisma String[] 배열 필터)
  - [ ] 카테고리 간 AND 조합

### URL 상태
- [ ] 필터/정렬/검색 조건 → URL searchParams 반영 (뒤로가기 상태 유지)
- [ ] `src/app/(main)/roasteries/page.tsx` — `searchParams` prop으로 필터 조건 수신

---

## F-005 평가 시스템 `feat/rating-system`

### 컴포넌트
- [ ] `src/components/rating/RatingButton.tsx` — "평가하기" / "내 평가: N점" (비로그인 시 `/login` 리디렉션)
- [ ] `src/components/rating/RatingModal.tsx` — Dialog 래퍼 (shadcn `dialog` 활용)
- [ ] `src/components/rating/StarSelector.tsx` — 1~5점 별점 선택 UI
- [ ] `src/components/rating/RatingForm.tsx` — 별점 + 한줄평(최대 100자) + 제출/수정 버튼
- [ ] `src/components/rating/DeleteRatingDialog.tsx` — M-02 삭제 확인 다이얼로그

### 서버 액션
- [ ] `src/actions/rating.ts`:
  - [ ] `upsertRating({ roasteryId, score, comment })` — upsert 후 `revalidatePath`
  - [ ] `deleteRating({ roasteryId })` — 삭제 후 `revalidatePath`

### 데이터 레이어
- [ ] `src/lib/queries/rating.ts` — `getUserRating(userId, roasteryId)`, `getRatingCount(userId)`

---

## F-007 즐겨찾기 `feat/bookmark`

### 페이지
- [ ] `src/app/(main)/bookmarks/page.tsx` — 즐겨찾기 목록 (Server Component)

### 컴포넌트
- [ ] `src/components/bookmark/BookmarkButton.tsx` — 하트 아이콘 토글 (낙관적 업데이트)
- [ ] `src/components/bookmark/BookmarkList.tsx` — 즐겨찾기 목록 (이름순/내 별점순 정렬)
- [ ] `src/components/bookmark/RemoveBookmarkDialog.tsx` — M-03 해제 확인 다이얼로그
- [ ] `src/components/bookmark/EmptyBookmark.tsx` — 빈 상태 안내

### 서버 액션
- [ ] `src/actions/bookmark.ts`:
  - [ ] `toggleBookmark({ roasteryId })` — upsert 방식 (`@@unique` 활용)
  - [ ] `removeBookmark({ bookmarkId })` — 목록 페이지용

### 데이터 레이어
- [ ] `src/lib/queries/bookmark.ts` — `getBookmarks(userId, sort)`, `isBookmarked(userId, roasteryId)`

---

## F-006 CF 추천 홈 피드 `feat/home-feed-cf`

### 사전 마이그레이션
- [ ] `Recommendation` 모델 `schema.prisma` 추가
- [ ] `pnpm prisma migrate dev` 실행

### 페이지
- [ ] `src/app/(main)/home/page.tsx` — 홈 피드 Server Component

### 컴포넌트 (15개 상태 분기 — state-tree.md P-05 참고)
- [ ] `src/components/home/HomeFeed.tsx` — 디카페인 토글 상태 관리 + 상태 분기 렌더링
- [ ] `src/components/home/DecafToggle.tsx` — "디카페인만 보기" 토글
- [ ] `src/components/home/RecommendSection.tsx` — "새로운 로스터리" / "또 사고 싶은 로스터리" 섹션
- [ ] `src/components/home/PopularSection.tsx` — 인기 로스터리 폴백 섹션
- [ ] `src/components/home/FeedSkeleton.tsx` — 로딩 스켈레톤 UI

### CF 알고리즘
- [ ] `src/lib/cf.ts`:
  - [ ] `calculateCF(userId)` — 사용자 기반 CF (코사인 유사도, 상위 K=20명)
  - [ ] `getPopularRoasteries()` — 폴백용 평균 평점 상위 5개

### 서버 액션
- [ ] `src/actions/recommendation.ts` — `triggerCFCalculation(userId)` — 평가 제출/삭제 후 재계산
- [ ] `src/actions/rating.ts` 수정 — `upsertRating`, `deleteRating`에 CF 트리거 연동

### 데이터 레이어
- [ ] `src/lib/queries/recommendation.ts` — `getRecommendations(userId)`, `getPopularRoasteries()`

### 배치 갱신
- [ ] `src/app/api/cron/route.ts` — 전체 사용자 CF 재계산 (Vercel Cron)

---

## 공통 규칙

### Server Action 응답 패턴
모든 액션은 통일된 응답 형태 사용:
```ts
return { success: boolean, error?: string }
```
에러 시 `throw` 금지 — 반환값으로 처리. 클라이언트에서 `sonner` 토스트로 피드백.

### 필터/정렬 상태
URL searchParams에 반영 필수 (뒤로가기 시 상태 유지).

### 지역 표시
`formatRegions()` 유틸 함수 공통 사용 (F-003에서 구현 후 F-006 홈 피드에서도 재사용).

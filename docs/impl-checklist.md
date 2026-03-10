# 구현 체크리스트

**기반**: PRD v1.30 / state-tree.md v1.0
**브랜치 전략**: Git Flow — feat/* → develop (Squash merge)
**최종 검토**: 2026-03-10 (전문가 검토 반영)

---

## 진행 현황

| 피처 | 브랜치 | 상태 |
|------|--------|------|
| 사전 작업 (스키마·인프라) | `chore/pre-impl` | 대기 |
| F-001 소셜 로그인 | `feat/auth-login` | 대기 |
| F-002 온보딩 설문 | `feat/onboarding` | 대기 |
| F-003 로스터리 목록/상세 | `feat/roastery-list-detail` | 대기 |
| F-004 검색/필터 | `feat/roastery-filter` | 대기 |
| F-005 평가 시스템 | `feat/rating-system` | 대기 |
| F-007 즐겨찾기 | `feat/bookmark` | 대기 |
| F-006 CF 추천 홈 피드 | `feat/home-feed-cf` | 대기 |
| 이벤트 로깅 | `feat/event-logging` | 대기 |

---

## 설계 결정 사항 (변경 금지)

| 항목 | 결정 |
|------|------|
| 즐겨찾기 명칭 | `Bookmark` (PRD의 Favorite 표기 무시, 코드베이스 기준) |
| 원두 데이터 | 별도 `Bean` 모델 (Roastery 1:N) |
| 추천 알고리즘 | Item-based CF → 향후 MF 이전 |
| 이벤트 로깅 | MVP 포함 |
| CF 조건 | 평가 3개 이상 → Item-based CF, 미만 → 인기 폴백 |

---

## 사전 작업 `chore/pre-impl`

### 스키마 변경 (모든 피처 착수 전 완료)

**Onboarding 모델 수정**
- [ ] `version Int @default(3)` 추가
- [ ] 필드 주석 수정: q1=브루잉방법, q2=구매성향, q3=선호가격대, q4=구매빈도, q5=선호로스터리

**User 모델 수정**
- [ ] `preferences Json?` 추가 — `onboardingVersion`, `inferredProfile` 저장

**Rating 모델 수정**
- [ ] `source String?` 추가 — 온보딩 시 `"onboarding"`, 직접 평가 시 `null`

**Roastery 모델 수정**
- [ ] `isOnboardingCandidate Boolean @default(false)` 추가 — Q5 목록용
- [ ] 인덱스 추가: `@@index([priceRange])`, `@@index([decaf])`, `@@index([name])`

**Bean 모델 신규 추가**
```prisma
model Bean {
  id           String   @id @default(cuid())
  roasteryId   String
  name         String
  origins      String[]
  roastingLevel String  // LIGHT | MEDIUM | MEDIUM_DARK | DARK
  decaf        Boolean  @default(false)
  createdAt    DateTime @default(now())
  roastery     Roastery @relation(fields: [roasteryId], references: [id], onDelete: Cascade)

  @@index([roasteryId])
}
```

**Recommendation 모델 신규 추가**
```prisma
model Recommendation {
  id         String   @id @default(cuid())
  userId     String
  roasteryId String
  score      Float
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  roastery   Roastery @relation(fields: [roasteryId], references: [id], onDelete: Cascade)

  @@unique([userId, roasteryId])
  @@index([userId])
}
```

**EventLog 모델 신규 추가**
```prisma
model EventLog {
  id        String   @id @default(cuid())
  userId    String?
  event     String   // rating_submitted | recommendation_clicked | purchase_link_clicked | onboarding_completed
  payload   Json?
  createdAt DateTime @default(now())

  @@index([event])
  @@index([userId])
  @@index([createdAt])
}
```

**마이그레이션 실행**
- [ ] `pnpm prisma migrate dev` 실행

**GIN 인덱스 수동 추가** (Prisma 미지원, 마이그레이션 SQL에 직접 추가)
- [ ] `CREATE INDEX "Roastery_regions_gin_idx" ON "Roastery" USING GIN ("regions");`
- [ ] `CREATE INDEX "Bean_origins_gin_idx" ON "Bean" USING GIN ("origins");`

### 시드 데이터 확장

- [ ] `isOnboardingCandidate=true` 로스터리 20개로 확장 (현재 5개)
- [ ] 각 로스터리에 `Bean` 데이터 추가 (origins, roastingLevel, decaf)

### Auth 인프라

- [ ] `src/types/auth.ts` — `Session` 인터페이스 확장 (`onboardingVersion: number | null`)
- [ ] `auth.ts` — `session` 콜백에서 Prisma로 `User.preferences.onboardingVersion` 조회 후 `session.user`에 주입
- [ ] `auth.config.ts` — `authorized` 콜백에 3가지 AUTH 상태 분기 추가:
  - `AUTH-ANON`: 보호 경로 → `/login` 리디렉션
  - `AUTH-INCOMPLETE`: `/onboarding` 외 → `/onboarding` 리디렉션
  - `AUTH-COMPLETE`: `/login`, `/onboarding` → `/home` 리디렉션

### 공통 타입 및 유틸

- [ ] `src/types/action.ts` — Server Action 공통 응답 타입:
  ```ts
  type ActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string; code?: 'UNAUTHORIZED' | 'VALIDATION' | 'DB_ERROR' | 'NOT_FOUND' }
  ```
- [ ] `src/lib/utils.ts` — `formatRegions(regions: string[], filterRegions?: string[]): string` 추가
  - 단일 지역: `"서울"`
  - 복수 (필터 없음): `"서울 외 2곳"`
  - 복수 + 비대표 지역이 필터 해당: `"서울 · 부산"`
- [ ] `src/lib/utils.test.ts` — `formatRegions` 단위 테스트 (3가지 케이스 전부)

### 테스트 인프라

- [ ] `.env.test` — 테스트 전용 `DATABASE_URL` 설정 (별도 DB or 동일 DB 테스트 스키마)
- [ ] `src/tests/setup.ts` — `beforeEach`에 테스트 테이블 초기화 로직 추가
- [ ] `src/app/api/test/session/route.ts` — E2E 테스트용 세션 생성 API 완성 (OAuth 우회용)

---

## F-001 소셜 로그인 `feat/auth-login`

### 공통 레이아웃
- [ ] `src/components/layout/SessionProvider.tsx` — NextAuth SessionProvider 래퍼 (`'use client'`)
- [ ] `src/components/layout/Header.tsx` — 로고, 목록, 즐겨찾기, 사용자 메뉴/로그아웃
- [ ] `src/app/(auth)/layout.tsx` — 비로그인·온보딩미완료 전용 레이아웃
- [ ] `src/app/(main)/layout.tsx` — Header 포함 메인 레이아웃 (AUTH-COMPLETE 전용)

### 페이지
- [ ] `src/app/page.tsx` — 루트 → `/login` 리디렉션
- [ ] `src/app/(auth)/login/page.tsx` — 로그인 UI
- [ ] `src/app/(auth)/error/page.tsx` — OAuth 오류 페이지 (`?error=` 파라미터 처리)
  - `OAuthAccountNotLinked` 에러 메시지: "해당 이메일로는 다른 로그인 방법을 사용해주세요" (계정 열거 공격 방지)
- [ ] `src/app/not-found.tsx` — 전역 404

### 컴포넌트
- [ ] `src/components/auth/LoginButton.tsx` — Google/Kakao/Naver 소셜 로그인 버튼
- [ ] `src/components/auth/ErrorAlert.tsx` — OAuth 오류 메시지 표시

### 보안
- [ ] 모든 Server Action: `auth()`로 서버에서 `userId` 직접 조회 — 클라이언트 입력에서 `userId` 절대 수신 금지
- [ ] `src/app/api/test/session/route.ts`: `NODE_ENV !== 'test'`이거나 별도 환경변수 미설정 시 404 반환

---

## F-002 온보딩 설문 `feat/onboarding`

### 페이지
- [ ] `src/app/(auth)/onboarding/page.tsx` — Server Component (Q5용 `isOnboardingCandidate=true` 로스터리 20개 SSR)

### 컴포넌트
- [ ] `src/components/onboarding/OnboardingWizard.tsx` — `'use client'`, 스텝 상태 관리
- [ ] `src/components/onboarding/ProgressBar.tsx` — "2 / 5" 형식 진행 표시
- [ ] `src/components/onboarding/steps/Q1BrewingMethod.tsx` — 복수 선택, 최소 1개
- [ ] `src/components/onboarding/steps/Q2PurchaseStyle.tsx` — 단일 선택
- [ ] `src/components/onboarding/steps/Q3PriceRange.tsx` — 복수 선택, "크게 신경 안 써요" 상호 배타
- [ ] `src/components/onboarding/steps/Q4Frequency.tsx` — 단일 선택, `FIRST_TIME` 분기 (4문항 완료 vs Q5 이동)
- [ ] `src/components/onboarding/steps/Q5Roasteries.tsx` — 복수 선택, 최소 3개

### 서버 액션
- [ ] `src/actions/onboarding.ts` — `submitOnboarding(data: OnboardingAnswers): ActionResult`
  - [ ] Zod 스키마 서버 사이드 검증
  - [ ] 인터랙티브 트랜잭션:
    - `Onboarding` upsert (version 포함)
    - Q4 != `FIRST_TIME`이면 Q5 → `Rating` bulk upsert (score=5, source="onboarding")
    - `User.preferences` 업데이트 (onboardingVersion=3, inferredProfile 계산)
  - [ ] 완료 후 NextAuth `update()` 호출 → 세션 `onboardingVersion` 즉시 갱신
  - [ ] `revalidatePath('/home')`
  - [ ] `EventLog` 기록: `onboarding_completed`

### 타입
- [ ] `src/types/onboarding.ts` — `OnboardingAnswers` 타입

### 테스트
- [ ] `src/actions/onboarding.test.ts`:
  - Q4=FIRST_TIME 시 Q5 Rating 미생성 확인
  - 트랜잭션 재시도 시 Rating 중복 미생성 확인
  - inferredProfile 계산 결과 검증

---

## F-003 로스터리 목록/상세 `feat/roastery-list-detail`

### 페이지
- [ ] `src/app/(main)/home/page.tsx` — 홈 피드 (빈 페이지, F-006에서 구현)
- [ ] `src/app/(main)/roasteries/page.tsx` — 목록 (Server Component, `Suspense` 감싸기)
- [ ] `src/app/(main)/roasteries/[id]/page.tsx` — 상세 (`notFound()` 처리 포함)

### 컴포넌트
- [ ] `src/components/roastery/RoasteryCard.tsx` — 이름, 지역(`formatRegions`), 가격대, 평균 평점, 디카페인 배지
- [ ] `src/components/roastery/RoasteryGrid.tsx` — 카드 그리드, 반응형 (1→2→3→4 컬럼)
- [ ] `src/components/roastery/RoasteryDetail.tsx` — 이름, 대표 지역, 가격대, 평균 평점, 외부 링크
- [ ] `src/components/roastery/BeanList.tsx` — 원두 목록 (이름, 원산지, 로스팅 레벨, 디카페인)
- [ ] `src/components/roastery/RegionDisplay.tsx` — `formatRegions` 래퍼 컴포넌트
- [ ] `src/components/roastery/SortSelector.tsx` — 이름순/인기순 (`'use client'`, URL 반영)

### 데이터 레이어
- [ ] `src/lib/queries/roastery.ts`:
  - `getRoasteries(sort)` — N+1 방지: `_count`, 평균 평점을 단일 쿼리로 집계
    ```ts
    // groupBy + aggregate 또는 $queryRaw로 평균 평점 JOIN
    ```
  - `getRoasteryById(id)` — `Bean` 포함 (`include: { beans: true }`)
  - `getAverageRating(roasteryId)` — 상세 페이지용

### 타입
- [ ] `src/types/roastery.ts` — `RoasteryWithStats`, `BeanWithDetails`

---

## F-004 검색/필터 `feat/roastery-filter`

### 컴포넌트 (`'use client'`)
- [ ] `src/components/roastery/FilterPanel.tsx` — 가격대(OR)/디카페인/지역(OR) 필터 패널
- [ ] `src/components/roastery/SearchInput.tsx` — 키워드 검색 (300ms 디바운스, URL 반영)
- [ ] `src/components/roastery/FilterBadge.tsx` — 적용 필터 태그 + 초기화
- [ ] `src/components/roastery/EmptyFilterResult.tsx` — 결과 0개 안내

### 데이터 레이어 수정
- [ ] `src/lib/queries/roastery.ts` — `getRoasteries(filters, sort)` 확장:
  - 가격대: `priceRange IN (...)` OR
  - 디카페인: `decaf = true`
  - 지역: `hasSome: selectedRegions` (GIN 인덱스 활용)
  - 카테고리 간 AND 조합
  - Q3 선호 가격대 폴백 필터 (`getPopularRoasteries`도 동일 파라미터 수용)

### URL 상태
- [ ] 필터/정렬/검색 → URL searchParams 반영 (뒤로가기 상태 유지)
- [ ] `page.tsx` — `searchParams` prop 수신, `Suspense` + `loading.tsx` 처리

---

## F-005 평가 시스템 `feat/rating-system`

### 컴포넌트
- [ ] `src/components/rating/RatingButton.tsx` — "평가하기" / "내 평가: N점" (비로그인 → `/login`)
- [ ] `src/components/rating/RatingModal.tsx` — shadcn `Dialog` 래퍼
- [ ] `src/components/rating/StarSelector.tsx` — 1~5점 별점 선택
- [ ] `src/components/rating/RatingForm.tsx` — 별점 + 한줄평(최대 100자) + 제출
- [ ] `src/components/rating/DeleteRatingDialog.tsx` — M-02 삭제 확인

### 서버 액션
- [ ] `src/actions/rating.ts`:
  - `upsertRating({ roasteryId, score, comment }): ActionResult` — Zod 검증 (score 1-5, comment ≤100자)
    - [ ] `revalidateTag('roastery-${roasteryId}-stats')` — 상세 페이지 평균 평점 갱신
    - [ ] `revalidatePath('/bookmarks')` — 내 별점순 정렬 갱신
    - [ ] `revalidatePath('/home')` — 홈 피드 갱신
    - [ ] `EventLog` 기록: `rating_submitted`
  - `deleteRating({ roasteryId }): ActionResult`
    - [ ] 동일 revalidation 범위 적용

### 데이터 레이어
- [ ] `src/lib/queries/rating.ts`:
  - `getUserRating(userId, roasteryId)` — `source` 포함 조회
  - `getRatingCount(userId)`

---

## F-007 즐겨찾기 `feat/bookmark`

### 페이지
- [ ] `src/app/(main)/bookmarks/page.tsx` — Server Component

### 컴포넌트
- [ ] `src/components/bookmark/BookmarkButton.tsx` — 하트 아이콘 토글 (낙관적 업데이트)
- [ ] `src/components/bookmark/BookmarkList.tsx` — 이름순/내 별점순 정렬
- [ ] `src/components/bookmark/RemoveBookmarkDialog.tsx` — M-03 해제 확인
- [ ] `src/components/bookmark/EmptyBookmark.tsx` — 빈 상태 안내

### 서버 액션
- [ ] `src/actions/bookmark.ts`:
  - `toggleBookmark({ roasteryId }): ActionResult` — upsert 방식 (`@@unique` 활용)
  - `removeBookmark({ roasteryId }): ActionResult` — `roasteryId` 기준 (bookmarkId 불필요)

### 데이터 레이어
- [ ] `src/lib/queries/bookmark.ts`:
  - `getBookmarks(userId, sort)` — Roastery + 내 Rating 포함
  - `getBookmarkStatus(userId, roasteryId): { isBookmarked: boolean }` — bookmarkId 불필요

---

## F-006 CF 추천 홈 피드 `feat/home-feed-cf`

### 추천 로직 설계

**활성 조건**
```
평가 3개 이상 → Item-based CF → 결과 부족 시 인기 폴백으로 자동 보충
평가 3개 미만 → 인기 로스터리 (Q3 선호 가격대 하드 필터 → 평균 평점 상위 5개)
```

**처리 방식**: 평가 제출 후 Server Action에서 비동기로 CF 재계산 → `Recommendation` 테이블 저장. 다음 홈 피드 로드 시 갱신된 결과 반영.

**"또 사고 싶은 로스터리" 분류 조건**
- 이미 평가한 로스터리 중 CF 예측 점수 >= 4.0 AND 내 평점 >= 4

**MF 이전 대비 추상화**
```
src/lib/recommender/
├── index.ts      # 단일 진입점 getRecommendations(userId)
├── types.ts      # RecommenderEngine 인터페이스, RecommendationResult
├── item-cf.ts    # Item-based CF (현재)
├── popular.ts    # 인기 폴백
└── mf.ts         # (미래) MF 구현체
```
MF 전환 시 `index.ts` 알고리즘 선택 로직만 수정. `Rating` 테이블 입력 형태 동일.

### 페이지
- [ ] `src/app/(main)/home/page.tsx` — Server Component (CF 데이터 SSR, `Suspense`)

### 컴포넌트
- [ ] `src/components/home/HomeFeedClient.tsx` — `'use client'`, decafOn 상태만 관리
- [ ] `src/components/home/DecafToggle.tsx` — "디카페인만 보기" 토글
- [ ] `src/components/home/RecommendSection.tsx` — "새로운" / "또 사고 싶은" 섹션 (순수 렌더링)
- [ ] `src/components/home/PopularSection.tsx` — 인기 폴백 (순수 렌더링)
- [ ] `src/components/home/FeedSkeleton.tsx` — 로딩 스켈레톤

### 추천 엔진
- [ ] `src/lib/recommender/types.ts` — `RecommenderEngine` 인터페이스, `RecommendationResult`
- [ ] `src/lib/recommender/popular.ts` — `getPopularRoasteries(preferredPriceRanges?: PriceRange[])` — Q3 가격대 필터 적용
- [ ] `src/lib/recommender/item-cf.ts`:
  - [ ] 전체 Rating으로 로스터리 간 코사인 유사도 행렬 계산
  - [ ] 유저 평가 기반 미평가 로스터리 예측 점수 산출 (가중 평균)
  - [ ] 결과 부족 시 popular로 자동 보충
  - [ ] 결과 → `Recommendation` 테이블 upsert
- [ ] `src/lib/recommender/index.ts`:
  - [ ] 평가 수 확인 (3개 미만 → popular, 이상 → item-cf)
  - [ ] `getRecommendations(userId): RecommendationResult`

### 서버 액션 수정
- [ ] `src/actions/rating.ts` — `upsertRating`, `deleteRating` 완료 후 비동기 CF 재계산 트리거

### 데이터 레이어
- [ ] `src/lib/queries/recommendation.ts`:
  - `getAllRatings()` — CF 계산용 (`userId, roasteryId, score`만 select, covering index)
  - `getUserRatingCount(userId)`
  - `getPopularRoasteries(preferredPriceRanges?)`
  - `getStoredRecommendations(userId)` — Recommendation 테이블 조회

### 테스트
- [ ] `src/lib/recommender/item-cf.test.ts` — mock 데이터로 코사인 유사도 + 예측 점수 검증

---

## 이벤트 로깅 `feat/event-logging`

### 로깅 대상 이벤트 (PRD 9.6절)
| 이벤트 | 트리거 |
|--------|--------|
| `onboarding_completed` | `submitOnboarding` 성공 |
| `rating_submitted` | `upsertRating` 성공 |
| `recommendation_clicked` | 홈 피드 추천 카드 클릭 |
| `purchase_link_clicked` | 로스터리 상세 외부 링크 클릭 |

### 구현
- [ ] `src/lib/logger.ts` — `logEvent(event, payload?, userId?)` 유틸
  - Server Action에서 호출 시 서버 사이드 직접 DB 기록
  - 클라이언트 이벤트는 Server Action 래퍼 경유
- [ ] `src/actions/events.ts` — `logClientEvent({ event, payload }): ActionResult` — 클라이언트 이벤트용 Server Action
- [ ] `recommendation_clicked`: `HomeFeedClient.tsx`에서 카드 클릭 시 `logClientEvent` 호출
- [ ] `purchase_link_clicked`: 상세 페이지 외부 링크 클릭 시 `logClientEvent` 호출

---

## 공통 규칙

### Server Action 패턴
```ts
// 모든 액션 공통 구조
export async function someAction(input: Input): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { success: false, error: '입력값이 올바르지 않습니다', code: 'VALIDATION' }

  // 비즈니스 로직 ...
}
```
- `userId`는 반드시 `auth()`에서 조회 — 클라이언트 입력 사용 금지
- `throw` 금지 — 반환값으로 처리
- 클라이언트: `sonner` 토스트로 피드백

### revalidation 전략
- 평가 제출/삭제: `revalidateTag('roastery-${id}-stats')` + `revalidatePath('/home')` + `revalidatePath('/bookmarks')`
- 북마크 변경: `revalidatePath('/bookmarks')`
- 온보딩 완료: `revalidatePath('/home')`

### URL 기반 상태
필터/정렬/검색 조건 → URL searchParams 반영 필수 (뒤로가기 상태 유지)

### 지역 표시
`formatRegions()` 유틸 함수 공통 사용 (`src/lib/utils.ts`)

### 반응형
모든 컴포넌트 반응형 필수. 페이지 최상위: `<div className="page-wrapper">`. 그리드: 1→2→3→4 컬럼 순서.

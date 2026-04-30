# roco 상태 트리 (State Tree)

**문서 버전**: 1.0
**작성일**: 2026-03-08
**기반 PRD**: v1.30
**기반 화면 흐름**: v1.0
**용도**: 개발 구현 기준 — 렌더링 분기, 상태 관리, QA 체크리스트

> **읽는 법**: 각 섹션은 "결정 변수 → 상태 ID → 렌더링 내용 → 전환 트리거" 순서로 기술한다.
> 상태 ID 형식: `S-[페이지/컴포넌트]-[번호]`

---

## 목차

1. [글로벌 인증 레이어](#1-글로벌-인증-레이어)
2. [P-04 온보딩 설문](#2-p-04-온보딩-설문)
3. [P-05 홈 피드](#3-p-05-홈-피드) ← 가장 복잡 (15개 상태)
4. [P-06 로스터리 목록](#4-p-06-로스터리-목록)
5. [P-07 로스터리 상세](#5-p-07-로스터리-상세)
6. [P-08 즐겨찾기 목록](#6-p-08-즐겨찾기-목록)
7. [M-01 평가 작성/수정 모달](#7-m-01-평가-작성수정-모달)
8. [M-02 평가 삭제 확인 다이얼로그](#8-m-02-평가-삭제-확인-다이얼로그)
9. [M-03 즐겨찾기 해제 확인 다이얼로그](#9-m-03-즐겨찾기-해제-확인-다이얼로그)
10. [전체 상태 수 요약](#10-전체-상태-수-요약)

---

## 1. 글로벌 인증 레이어

미들웨어 수준에서 처리되는 조건. 모든 보호된 페이지 진입 전 평가된다.

### 결정 변수

| 변수 | 값 | 출처 |
|------|-----|------|
| `session` | valid \| expired \| none | NextAuth.js 세션 쿠키 |
| `onboardingVersion` | `null` \| `3` | `User.preferences.onboardingVersion` |

### 인증 상태 조합

| 상태 ID | 조건 | 설명 |
|---------|------|------|
| `AUTH-ANON` | session = none \| expired | 비로그인 |
| `AUTH-INCOMPLETE` | session = valid AND onboardingVersion = null | 로그인 + 온보딩 미완료 |
| `AUTH-COMPLETE` | session = valid AND onboardingVersion = 3 | 로그인 + 온보딩 완료 |

### P-03 로그인 오류 상태

소셜 로그인 OAuth 콜백 처리 중 발생하는 오류. 로그인 페이지(`/`)에 표시.

| 상태 ID | 발생 조건 | 표시 메시지 |
|---------|---------|-----------|
| `S-P03-DUPLICATE-EMAIL` | 동일 이메일로 다른 소셜 제공자 계정 존재 | "이미 [제공자]로 가입된 이메일입니다. [제공자]로 로그인해주세요." |
| `S-P03-OAUTH-CANCEL` | 사용자가 OAuth 화면에서 취소 | "로그인이 취소되었습니다. 다시 시도해주세요." |
| `S-P03-NETWORK-ERROR` | OAuth 콜백 중 네트워크/서버 오류 | "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." |

> NextAuth.js `error` 쿼리 파라미터(`?error=OAuthAccountNotLinked` 등)로 구분하여 렌더링.

### 미들웨어 리디렉션 규칙

| 접근 URL | 현재 인증 상태 | 처리 |
|----------|------------|------|
| `/` | AUTH-COMPLETE | `/home` 리디렉션 |
| `/` | AUTH-INCOMPLETE | `/onboarding` 리디렉션 |
| `/home` | AUTH-ANON | `/` 리디렉션 |
| `/home` | AUTH-INCOMPLETE | `/onboarding` 리디렉션 |
| `/onboarding` | AUTH-ANON | `/` 리디렉션 |
| `/onboarding` | AUTH-COMPLETE | `/home` 리디렉션 |
| `/favorites` | AUTH-ANON | `/` 리디렉션 |
| `/favorites` | AUTH-INCOMPLETE | `/onboarding` 리디렉션 |
| `/roastery`, `/roastery/[id]` | 모든 상태 | 통과 (공개 페이지) |

---

## 2. P-04 온보딩 설문

단일 페이지 내 클라이언트 사이드 스텝 전환. **서버 저장은 최종 제출 시점 1회만** 발생.

### 결정 변수

| 변수 | 값 |
|------|-----|
| `currentStep` | `Q1` \| `Q2` \| `Q3` \| `Q4` \| `Q5` |
| `q4Selection` | `null` \| `FIRST_TIME` \| `QUARTERLY_OR_LESS` \| `MONTHLY` \| `BIMONTHLY` \| `WEEKLY_OR_MORE` |
| `q5SelectionCount` | `0` ~ (제한 없음) |
| `submitStatus` | `idle` \| `loading` \| `error` |

### Q1 — 브루잉 방법 (복수 선택, 최소 1개)

| 상태 ID | 조건 | 다음 버튼 | 비고 |
|---------|------|---------|------|
| `S-OB-Q1-EMPTY` | selections.length = 0 | 비활성 | 초기 진입 |
| `S-OB-Q1-READY` | selections.length >= 1 | 활성 | |

### Q2 — 구매 성향 (단일 선택)

| 상태 ID | 조건 | 다음 버튼 |
|---------|------|---------|
| `S-OB-Q2-EMPTY` | selection = null | 비활성 |
| `S-OB-Q2-READY` | selection != null | 활성 |

### Q3 — 선호 가격대 (복수 선택, 최소 1개)

| 상태 ID | 조건 | 다음 버튼 |
|---------|------|---------|
| `S-OB-Q3-EMPTY` | selections.length = 0 | 비활성 |
| `S-OB-Q3-READY` | selections.length >= 1 | 활성 |

> **"크게 신경 안 써요" 상호 배타 규칙**: 선택지는 LOW / MID / HIGH / "크게 신경 안 써요" 4가지.
> - "크게 신경 안 써요" 선택 시 나머지(LOW, MID, HIGH) 자동 해제.
> - LOW/MID/HIGH 중 하나라도 선택 시 "크게 신경 안 써요" 자동 해제.

### Q4 — 구매 빈도 (단일 선택, 분기 발생)

| 상태 ID | 조건 | 버튼 | Progress Bar | 다음 화면 |
|---------|------|------|-------------|---------|
| `S-OB-Q4-EMPTY` | selection = null | 다음(비활성) | 4/5 | — |
| `S-OB-Q4-NORMAL` | selection != null AND != FIRST_TIME | 다음(활성) | 4/5 | Q5 |
| `S-OB-Q4-FIRSTTIME` | selection = FIRST_TIME | **완료 및 제출**(활성) | **4/4** (즉시 변경) | 제출 → P-05 |

### Q5 — 좋아하는 로스터리 선택 (복수, 최소 3개 이상)
> `q4Selection != FIRST_TIME` 일 때만 진입 가능

| 상태 ID | 조건 | 제출 버튼 | 비고 |
|---------|------|---------|------|
| `S-OB-Q5-EMPTY` | count = 0 | 비활성 | |
| `S-OB-Q5-INSUFFICIENT` | 0 < count < 3 | 비활성 | |
| `S-OB-Q5-READY` | count >= 3 | **활성** | 상한 없음 |

> 제출 버튼은 count >= 3일 때만 활성화된다. count < 3이면 버튼이 비활성 상태를 유지하므로 별도 오류 메시지 상태는 존재하지 않는다.

### 제출 처리 (Q4-FIRSTTIME 또는 Q5 제출)

| 상태 ID | 조건 | UI |
|---------|------|-----|
| `S-OB-SUBMIT-LOADING` | API 호출 중 | 제출 버튼 로딩, 입력 차단 |
| `S-OB-SUBMIT-ERROR` | API 실패 | "저장 중 오류가 발생했습니다. 다시 시도해주세요." 표시, 버튼 재활성화 |
| `S-OB-SUBMIT-SUCCESS` | API 성공 | → P-05 홈 피드 이동 |

> **주의**: `S-OB-SUBMIT-ERROR` 상태에서 재시도 시 Rating 중복 생성 방지 로직 필요 (트랜잭션 보장).

---

## 3. P-05 홈 피드

**가장 복잡한 페이지.** 전제 조건: `AUTH-COMPLETE` (미들웨어가 보장).

### 결정 변수

| 변수 | 타입 | 설명 |
|------|------|------|
| `ratingCount` | number | 해당 사용자의 총 Rating 수 |
| `recommendationExists` | boolean | Recommendation 테이블에 데이터 존재 여부 |
| `newItems` | number | CF "새로운 로스터리" 후보 수 (미평가) |
| `repeatItems` | number | CF "또 사고 싶은" 후보 수 (평가 이력 있음) |
| `decafOn` | boolean | 디카페인 토글 상태 (초기값: false, 새로고침 시 초기화) |
| `newDecafItems` | number | decafOn 시 새로운 로스터리 중 hasDecaf=true 수 |
| `repeatDecafItems` | number | decafOn 시 또 사고 싶은 중 hasDecaf=true 수 |

### CF 활성 조건

```
cfActive = (ratingCount >= 3) AND (recommendationExists = true)
```

### 로딩 상태

| 상태 ID | 조건 | 렌더링 |
|---------|------|-------|
| `S-HOME-LOADING` | 데이터 조회 중 | 스켈레톤 UI (섹션 영역 플레이스홀더) |

### 상태 결정 트리

```
[P-05 진입]
│
├── cfActive = false
│   ├── ratingCount < 3
│   │   └── S-HOME-01  실시간 인기 로스터리 (폴백: 평가 부족)
│   └── ratingCount >= 3 AND recommendationExists = false
│       └── S-HOME-02  실시간 인기 로스터리 (폴백: 배치 실패)
│
└── cfActive = true (ratingCount >= 3 AND recommendationExists)
    │
    ├── newItems = 0 AND repeatItems = 0
    │   └── S-HOME-03  실시간 인기 로스터리 (폴백: CF 빈 배열)
    │
    ├── newItems > 0 AND repeatItems = 0  (decaf 토글 표시)
    │   ├── decafOn = false
    │   │   └── S-HOME-04  "새로운 로스터리" 섹션만
    │   └── decafOn = true
    │       ├── newDecafItems > 0
    │       │   └── S-HOME-05  "새로운 로스터리" (디카페인 필터)
    │       └── newDecafItems = 0
    │           └── S-HOME-06  디카페인 안내 문구
    │
    ├── newItems = 0 AND repeatItems > 0  (decaf 토글 표시)
    │   ├── decafOn = false
    │   │   └── S-HOME-07  "또 사고 싶은 로스터리" 섹션만
    │   └── decafOn = true
    │       ├── repeatDecafItems > 0
    │       │   └── S-HOME-08  "또 사고 싶은 로스터리" (디카페인 필터)
    │       └── repeatDecafItems = 0
    │           └── S-HOME-09  디카페인 안내 문구
    │
    └── newItems > 0 AND repeatItems > 0  (decaf 토글 표시)
        ├── decafOn = false
        │   └── S-HOME-10  두 섹션 모두 표시
        └── decafOn = true
            ├── newDecafItems > 0 AND repeatDecafItems > 0
            │   └── S-HOME-11  두 섹션 (디카페인 필터)
            ├── newDecafItems > 0 AND repeatDecafItems = 0
            │   └── S-HOME-12  "새로운 로스터리"만 (디카페인 필터)
            ├── newDecafItems = 0 AND repeatDecafItems > 0
            │   └── S-HOME-13  "또 사고 싶은"만 (디카페인 필터)
            └── newDecafItems = 0 AND repeatDecafItems = 0
                └── S-HOME-14  디카페인 안내 문구
```

### 상태별 렌더링 명세

| 상태 ID | 섹션 표시 | 디카페인 토글 | 안내 문구 | 비고 |
|---------|---------|------------|---------|------|
| `S-HOME-01` | 실시간 인기 로스터리 | **미표시** | — | ratingCount < 3 |
| `S-HOME-02` | 실시간 인기 로스터리 | **미표시** | — | 배치 실패 |
| `S-HOME-03` | 실시간 인기 로스터리 | **미표시** | — | CF 결과 없음 |
| `S-HOME-04` | 새로운 로스터리 | 표시(OFF) | — | repeatItems = 0 |
| `S-HOME-05` | 새로운 로스터리(디카페인) | 표시(ON) | — | |
| `S-HOME-06` | 없음 | 표시(ON) | "현재 디카페인 원두를 보유한 추천 로스터리가 없습니다." | |
| `S-HOME-07` | 또 사고 싶은 로스터리 | 표시(OFF) | — | newItems = 0 |
| `S-HOME-08` | 또 사고 싶은(디카페인) | 표시(ON) | — | |
| `S-HOME-09` | 없음 | 표시(ON) | 동일 안내 문구 | |
| `S-HOME-10` | 새로운 + 또 사고 싶은 | 표시(OFF) | — | 두 섹션 정상 |
| `S-HOME-11` | 새로운(디카) + 또 사고(디카) | 표시(ON) | — | |
| `S-HOME-12` | 새로운(디카)만 | 표시(ON) | — | repeatDecaf = 0 |
| `S-HOME-13` | 또 사고(디카)만 | 표시(ON) | — | newDecaf = 0 |
| `S-HOME-14` | 없음 | 표시(ON) | 동일 안내 문구 | |

> **"실시간 인기 로스터리"**: 전체 평균 평점 상위 5개, 동점 시 총 평가 수 많은 순. Recommendation 테이블 미사용, 요청 시 실시간 계산.

### 상태 전환 트리거

| 트리거 | 상태 변화 |
|--------|---------|
| 평가 제출/수정/삭제 → ratingCount 변경 | CF 활성 조건 재평가 → 다음 홈 피드 로드 시 반영 |
| 디카페인 토글 ON/OFF | 현재 페이지에서 즉시 섹션 재렌더링 |
| 새로고침 | decafOn → false 초기화, 데이터 재조회 |

---

## 4. P-06 로스터리 목록

### 결정 변수

| 변수 | 값 |
|------|-----|
| `authState` | `AUTH-ANON` \| `AUTH-INCOMPLETE` \| `AUTH-COMPLETE` |
| `filterResult` | number (목록 결과 수) |
| `isLoading` | boolean |

### 상태 목록

| 상태 ID | 조건 | 렌더링 |
|---------|------|-------|
| `S-LIST-LOADING` | isLoading = true | 스켈레톤 UI 또는 로딩 스피너 |
| `S-LIST-RESULT` | filterResult > 0 | 로스터리 카드 목록 (N개) |
| `S-LIST-EMPTY` | filterResult = 0 | "해당 조건의 로스터리가 없습니다. 필터를 변경해보세요." + 필터 초기화 버튼 |

> 네비게이션 바 표시 차이:
> - `AUTH-ANON` + `AUTH-INCOMPLETE`: 로고 + 목록 + [로그인하기]
> - `AUTH-COMPLETE`: 로고 + 홈 + 목록 + 즐겨찾기 + [로그아웃]

### 필터 상태 (URL 동기화)

| 변수 | 기본값 | 가능한 값 |
|------|-------|---------|
| `region` | `[]` | 지역 배열 (복수 선택, OR) |
| `price` | `[]` | `LOW`, `MID`, `HIGH` 배열 (복수, OR) |
| `decaf` | `false` | `true` \| `false` |
| `q` | `""` | 검색 키워드 |
| `sort` | `"name"` | `"name"` \| `"popular"` |

---

## 5. P-07 로스터리 상세

### 결정 변수

| 변수 | 값 |
|------|-----|
| `roasteryExists` | boolean |
| `authState` | `AUTH-ANON` \| `AUTH-INCOMPLETE` \| `AUTH-COMPLETE` |
| `ratingState` | `unrated` \| `rated` (score: 1~5) |
| `favoriteState` | `unfavorited` \| `favorited` |

> `ratingState`와 `favoriteState`는 `AUTH-COMPLETE` 상태에서만 유효.

### 상태 목록

| 상태 ID | 인증 | rating | favorite | 평가 버튼 | 즐겨찾기 버튼 |
|---------|------|--------|----------|---------|------------|
| `S-DETAIL-LOADING` | 무관 | — | — | — | 스켈레톤 UI 또는 로딩 스피너 |
| `S-DETAIL-404` | 무관 | — | — | — | 404 페이지 표시 |
| `S-DETAIL-ANON` | AUTH-ANON | — | — | "평가하기" → P-01 리디렉션 | "즐겨찾기에 추가" → P-01 리디렉션 |
| `S-DETAIL-INCOMPLETE` | AUTH-INCOMPLETE | — | — | "평가하기" → P-04 이동 | "즐겨찾기에 추가" → P-04 이동 |
| `S-DETAIL-UNRATED-UNFAV` | AUTH-COMPLETE | unrated | unfavorited | "평가하기" → M-01(new) | "즐겨찾기에 추가" → 즉시 추가 |
| `S-DETAIL-UNRATED-FAV` | AUTH-COMPLETE | unrated | favorited | "평가하기" → M-01(new) | "즐겨찾기 해제" → 즉시 해제 |
| `S-DETAIL-RATED-UNFAV` | AUTH-COMPLETE | rated(N) | unfavorited | "내 평가 수정(★N)" → M-01(edit) | "즐겨찾기에 추가" → 즉시 추가 |
| `S-DETAIL-RATED-FAV` | AUTH-COMPLETE | rated(N) | favorited | "내 평가 수정(★N)" → M-01(edit) | "즐겨찾기 해제" → 즉시 해제 |

### 평균 평점 표시 분기

| 조건 | 표시 |
|------|------|
| 총 평가 수 > 0 | "★ N.N (N개 평가)" |
| 총 평가 수 = 0 | "아직 평가 없음" |

### 즐겨찾기 버튼 규칙

- **낙관적 업데이트**: 클릭 즉시 버튼 상태를 전환. API 실패 시 원래 상태로 복원 + 오류 토스트.
- **연속 클릭 방지**: API 호출 pending 중 버튼 비활성화. 응답 수신 후 재활성화.

### 즐겨찾기 버튼 낙관적 업데이트

| 이벤트 | 처리 |
|--------|------|
| 즐겨찾기 추가 성공 | `S-DETAIL-*-UNFAV` → `S-DETAIL-*-FAV` 유지 |
| 즐겨찾기 추가 실패 | `S-DETAIL-*-FAV` → `S-DETAIL-*-UNFAV` 복원 + 오류 토스트 |
| 즐겨찾기 해제 성공 | `S-DETAIL-*-FAV` → `S-DETAIL-*-UNFAV` 유지 |
| 즐겨찾기 해제 실패 | `S-DETAIL-*-UNFAV` → `S-DETAIL-*-FAV` 복원 + 오류 토스트 |

---

## 6. P-08 즐겨찾기 목록

전제 조건: `AUTH-COMPLETE` (미들웨어가 보장).

### 결정 변수

| 변수 | 값 |
|------|-----|
| `favoriteCount` | number |
| `sortBy` | `"name"` \| `"myRating"` |
| `m03Open` | boolean (M-03 다이얼로그 열림 여부) |

### 상태 목록

| 상태 ID | 조건 | 렌더링 |
|---------|------|-------|
| `S-FAV-LOADING` | 데이터 조회 중 | 스켈레톤 UI 또는 로딩 스피너 |
| `S-FAV-EMPTY` | favoriteCount = 0 | 빈 상태 안내 문구 + "로스터리 목록 보러가기" 버튼 |
| `S-FAV-LIST-NAME` | favoriteCount > 0 AND sortBy = "name" | 이름(가나다) 순 카드 목록 |
| `S-FAV-LIST-RATING` | favoriteCount > 0 AND sortBy = "myRating" | 내 별점 높은 순. 평가 없는 항목 하단 |
| `S-FAV-DIALOG-OPEN` | m03Open = true | 현재 목록(`S-FAV-LIST-NAME` 또는 `S-FAV-LIST-RATING`) 위에 M-03 오버레이. sortBy는 독립 유지(다이얼로그 열고 닫아도 변경되지 않음). M-03 닫힌 후 직전 `sortBy` 상태로 복귀. |

### 즐겨찾기 해제 처리 (M-03 경유)

M-03 "해제 확인" 클릭 시:
1. API 호출
2. 성공: 해당 카드 즉시 제거. `favoriteCount -= 1`. favoriteCount = 0이면 `S-FAV-EMPTY`로 전환.
3. 실패: 카드 유지. 오류 메시지 표시.

---

## 7. M-01 평가 작성/수정 모달

P-07에서 열림. 전제 조건: `AUTH-COMPLETE`.

### 결정 변수

| 변수 | 값 |
|------|-----|
| `mode` | `"new"` \| `"edit"` |
| `starSelected` | `null` \| `1` \| `2` \| `3` \| `4` \| `5` |
| `textLength` | number (0~∞) |
| `submitStatus` | `"idle"` \| `"loading"` \| `"error"` |

### 상태 목록

#### new 모드 (미평가 로스터리)

| 상태 ID | 조건 | 저장 버튼 | 삭제 버튼 |
|---------|------|---------|---------|
| `S-M01-NEW-IDLE` | starSelected = null | 비활성 | **미표시** |
| `S-M01-NEW-READY` | starSelected != null AND textLength <= 100 | **활성** | 미표시 |
| `S-M01-NEW-TEXT-ERROR` | starSelected != null AND textLength > 100 | 비활성 | 미표시 |
| `S-M01-NEW-LOADING` | submitStatus = "loading" | 로딩, 입력 차단 | 미표시 |
| `S-M01-NEW-ERROR` | submitStatus = "error" | 재활성 | 미표시 |

#### edit 모드 (기존 평가 있음)

| 상태 ID | 조건 | 저장 버튼 | 삭제 버튼 |
|---------|------|---------|---------|
| `S-M01-EDIT-IDLE` | starSelected = 기존점수 AND textLength <= 100 | **활성** | **표시** |
| `S-M01-EDIT-TEXT-ERROR` | textLength > 100 | 비활성 | 표시 |
| `S-M01-EDIT-LOADING` | submitStatus = "loading" | 로딩, 입력 차단 | 차단 |
| `S-M01-EDIT-ERROR` | submitStatus = "error" | 재활성 | 표시 |

> **edit 모드 진입 조건**: 기존 평가(온보딩 Q5 5점 포함) 존재 시 `starSelected` 초기값 = 기존 `Rating.score`.
> **edit 모드 별점 deselect 불가**: 이미 저장된 평가가 있으므로 별점을 0점(null)으로 되돌리는 것은 허용하지 않는다. 별점은 반드시 1~5 중 하나를 유지해야 하며, 평가를 삭제하려면 삭제 버튼을 통해 M-02를 경유해야 한다.

### 저장 성공 시

1. 모달 닫기 → P-07 복귀.
2. 토스트 "평가가 저장되었습니다." 표시.
3. 평균 평점 즉시 갱신.
4. CF 즉시 재계산 (서버사이드).
5. P-07 버튼 상태 전환:
   - new 모드 저장 → `S-DETAIL-UNRATED-*` → `S-DETAIL-RATED-*`
   - edit 모드 저장 → 기존 rated 상태 유지, 점수 갱신

---

## 8. M-02 평가 삭제 확인 다이얼로그

M-01 위에 중첩 오버레이. M-01은 닫히지 않음.

### 상태 목록

| 상태 ID | 조건 | UI |
|---------|------|-----|
| `S-M02-IDLE` | 열린 직후 | 확인 메시지 + "취소" / "삭제" 버튼 |
| `S-M02-LOADING` | 삭제 API 호출 중 | 버튼 로딩, 입력 차단 |
| `S-M02-ERROR` | API 실패 | 오류 메시지, 버튼 재활성 |

### 삭제 성공 시 처리 순서

1. `Rating` 레코드 DB 즉시 제거.
2. 해당 로스터리 평균 평점·평가 수 즉시 재계산.
3. 해당 사용자 CF 즉시 재계산.
4. M-02, M-01 모두 닫기 → P-07 복귀.
5. P-07 버튼 상태: `S-DETAIL-RATED-*` → `S-DETAIL-UNRATED-*`
6. 홈 피드 상태는 다음 P-05 로드 시 반영:
   - 삭제한 로스터리: "또 사고 싶은" 제외 → "새로운 로스터리" 후보 전환.
   - `ratingCount < 3` 하락 시: CF 섹션 → 실시간 인기 로스터리 폴백.

### "취소" 클릭 시

M-02 닫기 → M-01 직전 상태로 복귀 (`S-M01-EDIT-IDLE` 또는 `S-M01-EDIT-TEXT-ERROR`).

---

## 9. M-03 즐겨찾기 해제 확인 다이얼로그

P-08 위에 오버레이. P-07 상세 페이지에서는 이 다이얼로그 없이 즉시 처리.

### 상태 목록

| 상태 ID | 조건 | UI |
|---------|------|-----|
| `S-M03-IDLE` | 열린 직후 | "즐겨찾기에서 제거하시겠습니까?" + 로스터리 이름 + "취소" / "해제" 버튼 |
| `S-M03-LOADING` | API 호출 중 | 버튼 로딩, 입력 차단 |
| `S-M03-ERROR` | API 실패 | 오류 메시지, 버튼 재활성 |

### 해제 확인 성공 시

1. `Favorite` 레코드 즉시 제거.
2. P-08 목록에서 해당 카드 즉시 제거.
3. M-03 닫기.
4. `favoriteCount = 0`이면 `S-FAV-EMPTY`로 전환.

---

## 10. 전체 상태 수 요약

| 페이지 / 컴포넌트 | 상태 수 |
|----------------|--------|
| 글로벌 인증 레이어 (인증 3 + P-03 오류 3) | 6 |
| P-04 온보딩 (Q1~Q4 + Q5 + 제출) | 15 |
| **P-05 홈 피드** | **15** |
| P-06 로스터리 목록 | 3 |
| P-07 로스터리 상세 | 8 |
| P-08 즐겨찾기 목록 | 5 |
| M-01 평가 모달 (new + edit) | 9 |
| M-02 평가 삭제 확인 | 3 |
| M-03 즐겨찾기 해제 확인 | 3 |
| **합계** | **67** |

---

## 부록: 상태 간 주요 연쇄 반응

평가 관련 액션은 여러 상태에 동시 영향을 미친다.

### 평가 제출 (new)

```
M-01 저장 성공
→ P-07: S-DETAIL-UNRATED-* → S-DETAIL-RATED-*
→ P-07: 평균 평점 갱신
→ 서버: CF 즉시 재계산
→ P-05 (다음 로드 시): ratingCount 증가 → 상태 재평가
    → ratingCount가 3이 되면: S-HOME-01/02 → S-HOME-04/07/10 (CF 활성화)
```

### 평가 삭제

```
M-02 삭제 확인 성공
→ P-07: S-DETAIL-RATED-* → S-DETAIL-UNRATED-*
→ P-07: 평균 평점 갱신
→ 서버: CF 즉시 재계산
→ P-05 (다음 로드 시):
    → ratingCount 그대로 >= 3: 섹션 구성 변경 (삭제 로스터리 분류 변경)
    → ratingCount가 3 미만으로 하락: S-HOME-04~14 → S-HOME-01 (CF 비활성화)
```

### 평가 수정

```
M-01 저장 성공 (edit mode)
→ P-07: 평균 평점 갱신
→ 서버: CF 즉시 재계산
→ P-05 (다음 로드 시): 섹션 구성 갱신 (예측 점수 변화)
```

### 즐겨찾기 해제 (P-07)

```
P-07 즐겨찾기 해제 버튼 클릭 (M-03 없이 즉시 처리)
→ P-07: S-DETAIL-*-FAV → S-DETAIL-*-UNFAV (낙관적 업데이트)
→ P-08 (다음 로드 시): 해당 카드 목록에서 제거 반영
```

> P-07에서 해제해도 P-08 목록은 즉시 갱신되지 않는다. P-08에 재진입하거나 새로고침할 때 반영된다.

---

*이 문서는 PRD v1.30 및 화면 흐름 v1.0을 기반으로 작성되었습니다. PRD 변경 시 영향받는 상태를 함께 업데이트해야 합니다.*

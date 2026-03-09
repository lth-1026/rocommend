# Rocommend 세팅 체크리스트

**기준**: setup-plan.md v1.2
**작성일**: 2026-03-09

진행 중인 단계는 `→`, 완료는 `[x]`, 미시작은 `[ ]`로 표시.

## 커밋 전략

각 Phase 검증 완료 후 커밋. 메시지 컨벤션:

| Phase | 커밋 메시지 |
|-------|------------|
| 1 | `chore: initialize Next.js 16 with app router` |
| 2 | `chore: add design tokens and shadcn/ui` |
| 3 | `chore: add PostgreSQL schema and seed data` |
| 4 | `chore: add NextAuth.js v5 with Google/Kakao/Naver` |
| 5 | `chore: add ESLint and Prettier config` |
| 6 | `chore: add Vitest and Playwright test setup` |
| 7 | `chore: connect Vercel and configure deployment` |

---

## Phase 1 — 프로젝트 초기화

### [ ] Step 1 · Next.js 16 초기화

```bash
pnpm dlx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm
```

**검증**
- [ ] `pnpm dev` 실행 시 `http://localhost:3000` 정상 응답
- [ ] `src/app/` 폴더 존재 (App Router)
- [ ] `package.json`의 `packageManager`가 `pnpm@*`

---

### [ ] Step 2 · 폴더 구조 정리

setup-plan.md의 폴더 구조 기준으로 디렉토리 생성 및 불필요 파일 제거.

- `tailwind.config.ts`가 생성된 경우 삭제 (v4는 불필요)
- `src/actions/`, `src/lib/`, `src/tests/`, `src/types/`, `tests/` 생성
- `middleware.ts` 파일 생성 (내용은 Step 6 인증 설정 후 채움)

**검증**
- [ ] `src/actions/`, `src/lib/`, `src/tests/`, `src/types/` 폴더 존재
- [ ] `tests/`, `tests/helpers/` 폴더 존재
- [ ] `tailwind.config.ts` 없음 (있으면 삭제)

### 커밋
```
chore: initialize Next.js 16 with app router
```

---

## Phase 2 — 디자인 토큰

### [ ] Step 3 · globals.css 디자인 토큰

`src/app/globals.css`를 setup-plan.md Step 3 기준으로 교체.

- `@custom-variant dark` 선언
- `:root` / `[data-theme="dark"]` 색상 변수
- `@theme inline` Tailwind 유틸리티 등록

```bash
pnpm add pretendard
```

`src/app/layout.tsx`에 Pretendard `localFont` 로드.

**검증**
- [ ] `bg-bg` 클래스가 `background-color: var(--color-bg)` 로 렌더링
- [ ] `<html data-theme="dark">` 추가 시 배경색이 `#1A1917`로 변경
- [ ] Pretendard 폰트가 DevTools Network 탭에서 로드됨
- [ ] `dark:text-text-primary` 클래스가 다크 모드에서 동작

---

### [ ] Step 4 · shadcn/ui 초기화 및 컴포넌트 설치

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input badge dialog alert dropdown-menu toast
```

**검증**
- [ ] `src/components/ui/button.tsx` 존재
- [ ] `<Button>` 컴포넌트를 임의 페이지에서 import 시 렌더링 정상
- [ ] shadcn 토큰이 `globals.css`의 `--color-*` 변수와 충돌 없음

### 커밋
```
chore: add design tokens and shadcn/ui
```

---

## Phase 3 — 데이터베이스

### [ ] Step 5 · 로컬 PostgreSQL 설치 및 DB 생성

```bash
brew install postgresql@16
brew services start postgresql@16
createdb rocommend
createdb rocommend_test
```

**검증**
- [ ] `psql -d rocommend -c "\l"` 실행 시 두 DB 모두 목록에 표시

---

### [ ] Step 6 · Prisma 설치 및 schema.prisma 작성

```bash
pnpm add prisma @prisma/client
pnpm dlx prisma init
```

`prisma/schema.prisma`를 setup-plan.md Step 5-4 기준으로 작성 (인덱스 포함).

**검증**
- [ ] `pnpm dlx prisma validate` 에러 없음
- [ ] 모든 모델(User, Roastery, Rating, Bookmark, Account, Session, VerificationToken, Onboarding) 존재
- [ ] Rating, Bookmark에 `@@index([userId])`, `@@index([roasteryId])` 존재

---

### [ ] Step 7 · 환경변수 파일 생성

`.env.local`, `.env.test` 생성 (gitignore 대상).
`.env.example` 작성 후 커밋.

`.env.local`:
```
DATABASE_URL=postgresql://localhost:5432/rocommend
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:3000
```

`.env.test`:
```
DATABASE_URL=postgresql://localhost:5432/rocommend_test
```

**검증**
- [ ] `.gitignore`에 `.env.local`, `.env.test` 포함 확인
- [ ] `.env.example`이 커밋에 포함되고, 실제 값은 비어 있음

---

### [ ] Step 8 · Prisma 마이그레이션

```bash
pnpm dlx prisma migrate dev --name init
```

**검증**
- [ ] `prisma/migrations/` 폴더 생성됨
- [ ] `psql -d rocommend -c "\dt"` 실행 시 8개 테이블 표시

---

### [ ] Step 9 · Seed 데이터

```bash
pnpm add -D tsx
pnpm dlx prisma db seed
```

`package.json`에 `"prisma": { "seed": "tsx prisma/seed.ts" }` 추가.

**검증**
- [ ] `psql -d rocommend -c "SELECT name FROM \"Roastery\";"` 실행 시 5개 로스터리 출력

### 커밋
```
chore: add PostgreSQL schema and seed data
```
> `.env.local`, `.env.test`는 .gitignore 대상 — 커밋에서 제외됨. `.env.example`은 포함.

---

## Phase 4 — 인증

### [ ] Step 10 · NextAuth.js v5 설치 및 기본 설정

```bash
pnpm add next-auth @auth/prisma-adapter
```

`src/lib/prisma.ts`, `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts` 작성.
`src/middleware.ts` 인증 라우트 보호 로직 추가.

**검증 (Google 먼저)**
- [ ] `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` `.env.local`에 설정
- [ ] `http://localhost:3000/api/auth/providers` 응답에 `google` 포함
- [ ] Google 로그인 플로우 완료 후 `Session` 테이블에 레코드 생성됨
- [ ] `/` 미로그인 접근 시 `/login`으로 리다이렉트

---

### [ ] Step 11 · 환경변수 검증 (env.ts)

`src/lib/env.ts` 작성 후 `src/lib/prisma.ts` 상단에서 import.

**검증**
- [ ] `.env.local`에서 `AUTH_SECRET` 삭제 후 `pnpm dev` 시 시작 즉시 에러 출력
- [ ] 복구 후 정상 실행

### 커밋
```
chore: add NextAuth.js v5 with Google/Kakao/Naver
```

---

## Phase 5 — 코드 품질

### [ ] Step 12 · ESLint + Prettier 설정

```bash
pnpm add -D eslint eslint-config-next prettier eslint-config-prettier
```

`.eslintrc.json`, `.prettierrc` 작성.

**검증**
- [ ] `pnpm dlx eslint src/` 실행 시 기존 코드 에러 없음
- [ ] `pnpm dlx prettier --check src/` 실행 시 포맷 불일치 없음 (또는 수정 완료)

### 커밋
```
chore: add ESLint and Prettier config
```

---

## Phase 6 — 테스트

### [ ] Step 13 · Vitest + Testing Library 설치 및 설정

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/dom
```

`vitest.config.ts` 작성 (projects 배열 — node/jsdom 환경 분리).
`src/tests/setup.ts` 작성.

**검증**
- [ ] `pnpm test` 실행 시 "No test files found" (에러 아님, 정상)
- [ ] 간단한 유틸 함수 테스트 파일 작성 후 `pnpm test` 통과

---

### [ ] Step 14 · Playwright E2E 설치

```bash
pnpm add -D @playwright/test
pnpm dlx playwright install
```

`src/app/api/test/session/route.ts` 작성 (`TEST_SESSION_TOKEN` 보호).
`.env.test`에 `TEST_SESSION_TOKEN` 추가.

**검증**
- [ ] `TEST_SESSION_TOKEN` 없이 `/api/test/session` POST 시 403 응답
- [ ] 올바른 토큰으로 POST 시 세션 쿠키 설정됨
- [ ] `pnpm dlx playwright test --list` 실행 시 에러 없음

### 커밋
```
chore: add Vitest and Playwright test setup
```

---

## Phase 7 — 배포

### [ ] Step 15 · Vercel 연결

```bash
pnpm add -g vercel
vercel link
```

Vercel 대시보드에서 환경변수 등록:
- `DATABASE_URL` — Prisma Accelerate connection string
- `AUTH_SECRET`, `AUTH_URL`
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- `AUTH_KAKAO_ID`, `AUTH_KAKAO_SECRET`
- `AUTH_NAVER_ID`, `AUTH_NAVER_SECRET`
- `TEST_SESSION_TOKEN` — **절대 Production 환경에 추가 금지**

**검증**
- [ ] `vercel` 명령어로 Preview 배포 성공
- [ ] Preview URL에서 Google 로그인 완료
- [ ] Production DB(Oracle Cloud) 연결 전 로컬 DB로 먼저 검증

### 커밋
```
chore: connect Vercel and configure deployment
```

---

## 완료 기준

| 항목 | 기준 |
|------|------|
| 로컬 개발 서버 | `pnpm dev` — 로그인/온보딩/홈 정상 동작 |
| 유닛 테스트 | `pnpm test` — 전체 통과 |
| E2E 테스트 | `pnpm test:e2e` — 추천 검증 포함 전체 통과 |
| Vercel 배포 | Preview URL에서 로그인 → 온보딩 → 홈 피드 정상 동작 |
| 코드 품질 | ESLint 에러 0, Prettier 포맷 일치 |

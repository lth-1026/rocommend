# Rocommend 프로젝트 세팅 플랜

**버전**: 1.3
**작성일**: 2026-03-10
**패키지 매니저**: pnpm
**상태**: Phase 1–6 완료 / Phase 7 (Vercel 배포) 대기 중

---

## 기술 스택 확정

| 영역 | 선택 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router) | Pages Router 사용 안 함 |
| 언어 | TypeScript | strict mode |
| 스타일 | Tailwind CSS v4 + shadcn/ui | config 파일 불필요. CSS `@theme`으로 토큰 관리 |
| 데이터 처리 | Server Actions | 뮤테이션/폼 전담. API Route는 인증 핸들러만 유지 |
| DB | PostgreSQL (Oracle Cloud 자체 호스팅) | Always Free VM. MVP 전용 (1 OCPU, 1GB RAM) |
| ORM | Prisma **7** + @prisma/adapter-pg | v7부터 adapter 필수. Accelerate는 프로덕션 배포 시 설정 |
| 인증 | NextAuth.js v5 (next-auth@beta) | Google / Kakao / Naver (모두 공식 built-in provider) |
| 패키지 매니저 | pnpm | 모노레포 전환 시 가장 수월 |
| 호스팅 | Vercel | |

---

## Step 1 — Next.js 초기화

> ⚠️ **기존 파일이 있는 디렉토리**에서는 직접 실행 불가. 임시 폴더에 생성 후 파일을 이동한다.

```bash
# 임시 폴더에 생성
pnpm dlx create-next-app@latest /tmp/rocommend-init \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm \
  --yes

# .git, node_modules 제외하고 프로젝트 루트로 복사
rsync -av --exclude='.git' --exclude='node_modules' /tmp/rocommend-init/ .

pnpm install
```

> Tailwind v4부터 `tailwind.config.ts`는 필수가 아니다. 생성된 경우 삭제하고 `globals.css`에서 모든 토큰을 관리한다.

---

## Step 2 — 폴더 구조

```
rocommend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── onboarding/
│   │   │       └── page.tsx
│   │   ├── (main)/
│   │   │   ├── page.tsx              # 홈 피드
│   │   │   ├── roasteries/
│   │   │   │   ├── page.tsx          # 목록
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # 상세
│   │   │   └── bookmarks/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   └── test/
│   │   │       └── session/
│   │   │           └── route.ts      # E2E 테스트 전용 (test env만 활성)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       # shadcn/ui 자동 생성
│   │   └── shared/                   # 프로젝트 공통 컴포넌트
│   ├── actions/                      # Server Actions (도메인별 분리)
│   │   ├── roastery.ts
│   │   ├── rating.ts
│   │   ├── bookmark.ts
│   │   └── onboarding.ts
│   ├── lib/
│   │   ├── auth.ts                   # NextAuth 설정
│   │   ├── env.ts                    # 환경변수 검증
│   │   ├── prisma.ts                 # Prisma 클라이언트 싱글톤
│   │   └── utils.ts
│   ├── tests/
│   │   └── setup.ts                  # Vitest 전역 설정
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts                 # 인증 라우트 보호
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/                            # Playwright E2E
│   ├── helpers/
│   │   └── db.ts                     # 테스트 DB seed/cleanup
│   ├── recommendation.spec.ts
│   └── onboarding.spec.ts
├── public/
│   └── logo.svg
├── brand/                            # 브랜드 에셋 (빌드 제외)
├── docs/                             # 프로덕트 문서 (빌드 제외)
├── .env.local                        # gitignore
├── .env.test                         # gitignore
├── .env.example                      # 커밋
├── .prettierrc
├── .eslintrc.json
└── vitest.config.ts
```

---

## Step 3 — 디자인 토큰 (globals.css)

Tailwind v4부터 `tailwind.config.ts`가 불필요해졌다. 모든 토큰은 `globals.css`에서 관리한다.

**구조**:
- `:root` / `[data-theme="dark"]`: 실제 색상값 (런타임에 변경됨)
- `@theme inline`: Tailwind 유틸리티 클래스로 등록. `var()`를 값으로 사용해 동적 전환 지원

```css
@import "tailwindcss";

/* ── data-theme 기반 dark 모드 — Tailwind dark: 유틸리티 활성화 ── */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

/* ── 라이트 모드 (기본값) ── */
:root {
  --color-bg:             #FDFCFA;
  --color-surface:        #FFFFFF;
  --color-border:         #EAE6DF;
  --color-text-primary:   #111111;
  --color-text-secondary: #6B6560;
  --color-text-disabled:  #B0AAA3;
  --color-action:         #1A1917;
  --color-action-text:    #F7F4F0;
  --color-accent:         #C4A882;
  --color-success:        #2E7D32;
  --color-warning:        #7A4F00;
  --color-danger:         #C62828;
  --color-info:           #1565C0;
}

/* ── 다크 모드 ── */
[data-theme="dark"] {
  --color-bg:             #1A1917;
  --color-surface:        #252220;
  --color-border:         #333028;
  --color-text-primary:   #F0EDE9;
  --color-text-secondary: #9E9890;
  --color-text-disabled:  #5A5550;
  --color-action:         #F0EDE9;
  --color-action-text:    #1A1917;
}

/* ── Tailwind v4: CSS 변수를 유틸리티 클래스로 등록 ── */
@theme inline {
  /* 컬러 */
  --color-bg:             var(--color-bg);
  --color-surface:        var(--color-surface);
  --color-border:         var(--color-border);
  --color-text-primary:   var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-text-disabled:  var(--color-text-disabled);
  --color-action:         var(--color-action);
  --color-action-text:    var(--color-action-text);
  --color-accent:         var(--color-accent);
  --color-success:        var(--color-success);
  --color-warning:        var(--color-warning);
  --color-danger:         var(--color-danger);
  --color-info:           var(--color-info);

  /* 타이포그래피 */
  /* Pretendard는 next/font/local로 로드 → layout.tsx에서 --font-pretendard 변수 주입 */
  --font-sans: var(--font-pretendard), -apple-system, BlinkMacSystemFont, sans-serif;

  /* font-size / line-height / font-weight 세트 (brand-guidelines.md 기준) */
  --text-4xl: 49px;
  --text-4xl--line-height: 1.15;
  --text-4xl--font-weight: 700;

  --text-3xl: 39px;
  --text-3xl--line-height: 1.2;
  --text-3xl--font-weight: 700;

  --text-2xl: 31px;
  --text-2xl--line-height: 1.25;
  --text-2xl--font-weight: 600;

  --text-xl: 25px;
  --text-xl--line-height: 1.3;
  --text-xl--font-weight: 600;

  --text-lg: 20px;
  --text-lg--line-height: 1.4;
  --text-lg--font-weight: 500;

  --text-base: 16px;
  --text-base--line-height: 1.55;
  --text-base--font-weight: 400;

  --text-sm: 13px;
  --text-sm--line-height: 1.5;
  --text-sm--font-weight: 400;

  --text-xs: 10px;
  --text-xs--line-height: 1.4;
  --text-xs--font-weight: 400;

  /* 스페이싱 (4px 그리드) */
  --spacing-1:  4px;
  --spacing-2:  8px;
  --spacing-3:  12px;
  --spacing-4:  16px;
  --spacing-5:  20px;
  --spacing-6:  24px;
  --spacing-8:  32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;

  /* border-radius */
  --radius-card:   12px;
  --radius-btn:    8px;
  --radius-btn-sm: 6px;
  --radius-modal:  16px;
  --radius-pill:   999px;
}

/* ── 기본 스타일 ── */
* {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

> **@theme inline 동작 원리**
> `@theme inline { --color-bg: var(--color-bg); }`은 순환 참조가 아니다.
> Tailwind가 `bg-bg` 유틸리티를 생성할 때 값을 `var(--color-bg)`로 설정하도록 지시하는 것이다.
> 실제 색상값은 `:root` / `[data-theme="dark"]`의 CSS 변수가 런타임에 결정한다.

### Pretendard 폰트 — next/font/local 로드

```bash
pnpm add pretendard
```

`src/app/layout.tsx`:
```tsx
import localFont from 'next/font/local'

const pretendard = localFont({
  // 설치 후 node_modules 내 실제 경로 확인 필요
  src: '../../node_modules/pretendard/dist/web/static/pretendard-dynamic-subset.woff2',
  variable: '--font-pretendard',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>{children}</body>
    </html>
  )
}
```

> **주의**: `src` 경로는 pnpm 설치 후 실제 경로를 확인하고 수정한다.
> `node_modules/pretendard/dist/web/` 아래 파일 목록을 확인할 것.

---

## Step 4 — shadcn/ui

```bash
pnpm dlx shadcn@latest init
```

shadcn/ui는 Tailwind v4 호환 버전을 자동 감지해 설정한다.
MVP에 필요한 컴포넌트만 설치:

```bash
pnpm dlx shadcn@latest add button card input badge dialog alert dropdown-menu toast
```

> Storybook은 컴포넌트 수 30개 이상, 다수 팀원 협업 시점에 도입한다. 지금은 브라우저 직접 확인이 빠르다.

---

## Step 5 — PostgreSQL + Prisma

### 환경별 DB 전략

| 환경 | DB | 방법 |
|------|-----|------|
| 개발 (local) | 로컬 PostgreSQL | brew 직접 설치 |
| 테스트 | 로컬 PostgreSQL (별도 DB) | `rocommend_test` |
| 프로덕션 (Vercel) | Oracle Cloud PostgreSQL | SSL + Prisma Accelerate |

### 5-1. 개발/테스트 환경 — 로컬 PostgreSQL 설치

```bash
brew install postgresql@16
brew services start postgresql@16

# PATH 추가 (brew가 자동으로 추가하지 않을 경우)
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

createdb rocommend
createdb rocommend_test
```

`.env.local`:
```
# [username]은 macOS 계정명 (whoami 로 확인)
DATABASE_URL=postgresql://[username]@localhost:5432/rocommend
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=http://localhost:3000
```

`.env.test`:
```
DATABASE_URL=postgresql://[username]@localhost:5432/rocommend_test
TEST_SESSION_TOKEN=<openssl rand -base64 32>
```

개발 중에는 로컬 DB만 사용한다. Oracle Cloud는 건드리지 않는다.

### 5-2. 프로덕션 환경 — Oracle Cloud 세팅 (배포 시점에 진행)

Oracle Cloud Free Tier Always Free VM (1 OCPU, 1GB RAM). **MVP 전용 스펙**.

1. VM에 PostgreSQL 설치
2. PostgreSQL에 DB 및 유저 생성 (최소 권한):

```sql
CREATE DATABASE rocommend;
CREATE USER rocommend_user WITH ENCRYPTED PASSWORD 'your_password';
-- 최소 권한만 부여
GRANT CONNECT ON DATABASE rocommend TO rocommend_user;
\c rocommend
GRANT USAGE ON SCHEMA public TO rocommend_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO rocommend_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO rocommend_user;
```

3. Vercel 환경 변수에 등록 (SSL 필수):
```
DATABASE_URL=postgresql://rocommend_user:your_password@oracle-host:5432/rocommend?sslmode=require
```

> **Prisma Accelerate 필수**: Vercel 서버리스는 요청마다 새 DB 연결을 생성한다.
> database 세션 전략은 모든 요청에서 Sessions 테이블을 조회하므로 연결 수 제한에 즉시 걸린다.
> Prisma Accelerate가 연결 풀링을 처리하므로 프로덕션 배포 전 반드시 설정한다.

### 5-3. Prisma 7 설치

> **Prisma 7 변경사항**: `schema.prisma`에서 `url` 제거. 연결 설정은 `prisma.config.ts`로 이동. PrismaClient는 반드시 드라이버 adapter와 함께 초기화해야 한다.

```bash
pnpm add prisma @prisma/client @prisma/adapter-pg pg
pnpm add -D @types/pg dotenv

# Prisma 엔진 빌드 (pnpm v10 보안 정책으로 기본 차단됨)
pnpm rebuild prisma @prisma/engines
```

`pnpm-workspace.yaml`에 빌드 허용 목록 추가:
```yaml
onlyBuiltDependencies:
  - '@prisma/engines'
  - prisma
```

`prisma.config.ts` (루트에 생성):
```ts
import dotenv from 'dotenv'
import { defineConfig, env } from 'prisma/config'

dotenv.config({ path: '.env.local' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

> `dotenv.config({ path: '.env.local' })`: Prisma CLI는 Next.js의 `.env.local`을 자동으로 읽지 않으므로 명시적으로 로드한다.

### 5-4. schema.prisma (PRD 기반)

```prisma
datasource db {
  provider = "postgresql"
  // url은 prisma.config.ts에서 관리 — 여기서는 선언하지 않음
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id         String      @id @default(cuid())
  email      String?     @unique
  name       String?
  image      String?
  createdAt  DateTime    @default(now())
  accounts   Account[]
  sessions   Session[]
  onboarding Onboarding?
  ratings    Rating[]
  bookmarks  Bookmark[]
}

model Onboarding {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  q1          String[] // 구매 채널 (복수)
  q2          String   // 가격대
  q3          String[] // 선호 노트 (복수)
  q4          String   // 경험 수준
  q5          String[] // 좋아하는 로스터리 ID (최소 3개, 상한 없음)
  completedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

model Roastery {
  id          String     @id @default(cuid())
  name        String
  description String?
  regions     String[]   // 복수 지역 저장
  priceRange  PriceRange
  decaf       Boolean    @default(false)
  imageUrl    String?
  website     String?
  createdAt   DateTime   @default(now())
  ratings     Rating[]
  bookmarks   Bookmark[]
}

model Rating {
  id         String   @id @default(cuid())
  userId     String
  roasteryId String
  score      Int      @db.SmallInt  // 1–5. 애플리케이션 레이어에서도 검증 필요
  comment    String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  roastery   Roastery @relation(fields: [roasteryId], references: [id], onDelete: Cascade)

  @@unique([userId, roasteryId])
  @@index([userId])        // "내 평가 목록" 조회
  @@index([roasteryId])    // "이 로스터리의 평가" 조회 + CF 계산
}

model Bookmark {
  id         String   @id @default(cuid())
  userId     String
  roasteryId String
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  roastery   Roastery @relation(fields: [roasteryId], references: [id], onDelete: Cascade)

  @@unique([userId, roasteryId])
  @@index([userId])
  @@index([roasteryId])
}

// ── NextAuth 필수 모델 ──────────────────────────────

model Account {
  id                       String  @id @default(cuid())
  userId                   String
  type                     String
  provider                 String  // "google" | "kakao" | "naver"
  providerAccountId        String
  refresh_token            String?
  access_token             String?
  expires_at               Int?
  refresh_token_expires_at Int?    // Kakao/Naver refresh token 만료 추적용
  user                     User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

// NextAuth database 세션 전략 필수 모델.
// 세션 강제 만료(로그아웃, 계정 정지)가 필요해 database 전략 유지.
// Vercel 서버리스에서 연결 수 초과 방지를 위해 Prisma Accelerate 필수.
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime // 90일 후 만료
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

enum PriceRange {
  LOW   // 200g 기준 20,000원 미만
  MID   // 20,000–35,000원
  HIGH  // 35,000원 초과
}
```

### 5-5. 마이그레이션

```bash
# Prisma client 생성 (최초 1회 또는 schema 변경 시)
pnpm dlx prisma generate

pnpm dlx prisma migrate dev --name init
# 롤백 필요 시: pnpm dlx prisma migrate resolve --rolled-back init
```

### 5-6. Seed 데이터

```bash
pnpm add -D tsx
```

`prisma/seed.ts`:
```ts
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.roastery.createMany({
    data: [
      { name: '블루보틀 서울', regions: ['서울'], priceRange: 'HIGH', decaf: false },
      { name: '프릳츠', regions: ['서울'], priceRange: 'MID', decaf: true },
      { name: '테라로사', regions: ['서울', '강릉'], priceRange: 'MID', decaf: false },
      { name: '커피리브레', regions: ['서울'], priceRange: 'MID', decaf: false },
      { name: '앤트러사이트', regions: ['서울', '제주'], priceRange: 'MID', decaf: false },
    ],
    skipDuplicates: true,
  })
}

main()
  .catch(console.error)
  .finally(async () => { await pool.end() })
```

> seed 커맨드는 `package.json`이 아닌 `prisma.config.ts`의 `migrations.seed`에 설정한다 (Prisma 7 변경사항).

```bash
pnpm dlx prisma db seed
```

---

## Step 6 — NextAuth.js v5

```bash
# v5는 npm에서 @beta 태그로 배포됨
pnpm add next-auth@beta @auth/prisma-adapter
```

> Kakao, Naver 모두 Auth.js 공식 built-in provider로 존재한다. 커스텀 구현 불필요.

### src/lib/auth.config.ts — Edge Runtime 호환 설정

미들웨어는 Next.js Edge Runtime에서 실행된다. `pg` 라이브러리가 Node.js `crypto` 모듈을 사용하므로 Edge에서 import 불가. 미들웨어 전용으로 Prisma adapter 없는 경량 설정을 분리한다.

```ts
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Kakao from 'next-auth/providers/kakao'
import Naver from 'next-auth/providers/naver'

// Edge Runtime 호환 설정 (Prisma adapter 없음)
export const authConfig: NextAuthConfig = {
  providers: [Google, Kakao, Naver],
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname.startsWith('/login')
      const isApiAuth = nextUrl.pathname.startsWith('/api/auth')
      if (isApiAuth) return true
      if (isAuthPage) return true
      return isLoggedIn
    },
  },
}
```

### src/lib/auth.ts — 전체 설정 (Node.js 전용)

```ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/lib/auth.config'

// Node.js 전용 (Server Components, API Routes, Server Actions)
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
    maxAge: 60 * 60 * 24 * 90, // 90일
  },
})
```

### src/app/api/auth/[...nextauth]/route.ts

```ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

### src/lib/prisma.ts — Prisma 7 adapter 싱글톤

```ts
import '@/lib/env'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### src/middleware.ts — Edge Runtime 호환

```ts
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

// Edge Runtime 호환 — authConfig만 사용 (Prisma adapter 없음)
export default NextAuth(authConfig).auth

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg).*)'],
}
```

---

## Step 7 — 환경 변수

### .env.example (커밋)

```
# ── Database ────────────────────────────────────────
# 개발: postgresql://localhost:5432/rocommend
# 프로덕션: Prisma Accelerate connection string 사용
DATABASE_URL=

# ── Auth.js v5 ───────────────────────────────────────
# 생성: openssl rand -base64 32
# (NEXTAUTH_SECRET의 v5 이름. AUTH_SECRET으로 자동 인식)
AUTH_SECRET=
# 개발: http://localhost:3000 / 프로덕션: https://yourdomain.com
# (NEXTAUTH_URL의 v5 이름)
AUTH_URL=

# ── OAuth Providers (AUTH_[PROVIDER]_ID/SECRET 네이밍 규칙) ──
# Auth.js v5는 이 규칙을 따르면 provider에 clientId/clientSecret 명시 불필요
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_KAKAO_ID=
AUTH_KAKAO_SECRET=
AUTH_NAVER_ID=
AUTH_NAVER_SECRET=

# ── Test (E2E 세션 우회용, 절대 프로덕션에 설정 금지) ──
TEST_SESSION_TOKEN=
```

`AUTH_SECRET` 생성:
```bash
openssl rand -base64 32
```

### src/lib/env.ts — 환경변수 검증

앱 시작 시 필수 환경변수가 없으면 즉시 에러를 던진다.

```ts
const required = ['DATABASE_URL', 'AUTH_SECRET', 'AUTH_URL'] as const

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  AUTH_SECRET: process.env.AUTH_SECRET!,
  AUTH_URL: process.env.AUTH_URL!,
}
```

`src/lib/prisma.ts` 상단에서 import해 앱 시작 시 검증:
```ts
import '@/lib/env'
```

---

## Step 8 — ESLint + Prettier

> Next.js 16은 flat config(`eslint.config.mjs`)를 사용한다. `.eslintrc.json` 방식이 아님.

```bash
pnpm add -D prettier eslint-config-prettier
```

`eslint.config.mjs`에 prettier 추가:
```js
import prettier from "eslint-config-prettier"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,           // ← 추가
  globalIgnores([...]),
])
```

`.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

`package.json` scripts:
```json
{
  "lint": "eslint src/",
  "format": "prettier --write \"src/**/*.{ts,tsx}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx}\""
}
```

---

## Step 9 — Vercel 연결

> ⚠️ **사전 준비 항목** — 아래가 모두 준비된 후 진행한다.

### 사전 준비

#### 1. OAuth 앱 등록

| Provider | 등록 위치 | 콜백 URL |
|----------|----------|---------|
| Google | [Google Cloud Console](https://console.cloud.google.com) → API 및 서비스 → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID | `https://[your-domain]/api/auth/callback/google` |
| Kakao | [Kakao Developers](https://developers.kakao.com) → 내 애플리케이션 → 앱 설정 → 플랫폼 | `https://[your-domain]/api/auth/callback/kakao` |
| Naver | [Naver Developers](https://developers.naver.com) → Application → 애플리케이션 등록 | `https://[your-domain]/api/auth/callback/naver` |

> 개발 환경 콜백 URL (`http://localhost:3000/...`)도 각 콘솔에 추가해야 로컬 테스트가 가능하다.

#### 2. Oracle Cloud 프로덕션 DB 세팅

Oracle Cloud Free Tier Always Free VM (1 OCPU, 1GB RAM). **배포 시점에 진행**.

```sql
CREATE DATABASE rocommend;
CREATE USER rocommend_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT CONNECT ON DATABASE rocommend TO rocommend_user;
\c rocommend
GRANT USAGE ON SCHEMA public TO rocommend_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO rocommend_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO rocommend_user;
```

#### 3. Prisma Accelerate 설정

Vercel 서버리스는 요청마다 새 DB 연결을 생성한다. Prisma Accelerate가 연결 풀링을 처리한다.

1. [Prisma Data Platform](https://console.prisma.io) → New project → Accelerate 활성화
2. Oracle Cloud DB URL 입력 → connection string 발급
3. 발급된 `prisma://` URL을 Vercel 환경변수 `DATABASE_URL`에 등록

### Vercel 프로젝트 연결

```bash
pnpm add -g vercel
vercel link
```

**Vercel 환경 변수 등록:**

| 변수 | 값 | 주의 |
|------|-----|------|
| `DATABASE_URL` | Prisma Accelerate connection string | Oracle Cloud 직접 연결 X |
| `AUTH_SECRET` | `openssl rand -base64 32` 생성값 | |
| `AUTH_URL` | `https://[your-domain]` | |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | |
| `AUTH_KAKAO_ID` | Kakao REST API 키 | |
| `AUTH_KAKAO_SECRET` | Kakao Client Secret | |
| `AUTH_NAVER_ID` | Naver Client ID | |
| `AUTH_NAVER_SECRET` | Naver Client Secret | |
| `TEST_SESSION_TOKEN` | — | **절대 Production에 설정 금지** |

---

## Step 10 — 테스트 설정

### 도구

| 도구 | 용도 |
|------|------|
| **Vitest** | 유닛 / 통합 테스트 |
| **Playwright** | E2E 테스트 |
| **@testing-library/react** | 컴포넌트 테스트 |

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/dom
pnpm add -D @playwright/test
# Playwright 브라우저 설치 (네트워크 상태에 따라 재시도 필요)
pnpm exec playwright install chromium
```

### vitest.config.ts — 환경 분리

서버 코드(Server Actions, lib)는 `node` 환경, 컴포넌트는 `jsdom` 환경으로 분리한다.
Vitest 공식 방법은 `projects` 배열로 각 환경을 독립 프로젝트로 선언하는 것이다.

> ⚠️ **Vitest v4 변경사항**: `loadEnv`가 `vitest/config`에서 제거됨. `.env.test`는 Vitest가 자동 로드하므로 별도 설정 불필요.

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Vitest는 기본적으로 .env.test를 자동 로드
    setupFiles: ['./src/tests/setup.ts'],
    passWithNoTests: true,
    projects: [
      {
        // 서버 로직 — node 환경
        test: {
          name: 'server',
          include: [
            'src/actions/**/*.test.ts',
            'src/lib/**/*.test.ts',
          ],
          environment: 'node',
        },
      },
      {
        // 컴포넌트 — jsdom 환경
        test: {
          name: 'components',
          include: ['src/components/**/*.test.tsx'],
          environment: 'jsdom',
        },
      },
    ],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
}))
```

### src/tests/setup.ts

```ts
import { beforeEach, afterEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'

// next/cache 모킹 (Server Action 테스트 시)
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

// 각 테스트 후 트랜잭션 롤백으로 DB 격리
beforeEach(async () => {
  await prisma.$executeRaw`BEGIN`
})

afterEach(async () => {
  await prisma.$executeRaw`ROLLBACK`
})
```

### 테스트 계층과 대상

```
유닛 테스트 (Vitest, node env)
├── src/lib/recommendation.ts   # CF 알고리즘 — 핵심 로직
└── src/lib/utils.ts            # 순수 함수

통합 테스트 (Vitest + 테스트 DB, node env)
├── src/actions/rating.ts
├── src/actions/bookmark.ts
└── src/actions/onboarding.ts

컴포넌트 테스트 (Vitest, jsdom env)
└── src/components/shared/      # 공통 컴포넌트

E2E 테스트 (Playwright)
├── 소셜 로그인 플로우
├── 온보딩 5문항 완료
├── 로스터리 목록 → 상세 → 평가
├── 즐겨찾기 추가/제거
└── 내 평가 기반 추천 검증 ← 핵심
```

### 테스트 예시 — CF 알고리즘 (유닛)

```ts
// src/lib/recommendation.test.ts
import { describe, expect, it } from 'vitest'
import { computeSimilarity, getRecommendations } from './recommendation'

describe('computeSimilarity', () => {
  it('동일한 평가 패턴이면 유사도 1', () => {
    expect(computeSimilarity([5, 3, 4], [5, 3, 4])).toBe(1)
  })
  it('정반대 평가면 유사도 -1', () => {
    expect(computeSimilarity([5, 1], [1, 5])).toBeCloseTo(-1)
  })
  it('평가 없으면 유사도 0', () => {
    expect(computeSimilarity([], [])).toBe(0)
  })
})

describe('getRecommendations', () => {
  it('평가 3개 미만이면 인기 로스터리 폴백 반환', () => {
    const result = getRecommendations({ ratingCount: 2, popular: mockPopular })
    expect(result).toEqual(mockPopular)
  })
})
```

### 테스트 예시 — Server Action (통합)

```ts
// src/actions/rating.test.ts
import { describe, expect, it, vi } from 'vitest'
import { createRating } from './rating'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }),
}))

describe('createRating', () => {
  it('평가를 저장한다', async () => {
    await createRating('roastery-1', 4, '좋은 원두')

    const rating = await prisma.rating.findUnique({
      where: { userId_roasteryId: { userId: 'user-1', roasteryId: 'roastery-1' } },
    })
    expect(rating?.score).toBe(4)
    expect(rating?.comment).toBe('좋은 원두')
  })

  it('score가 1~5 범위를 벗어나면 에러', async () => {
    await expect(createRating('roastery-1', 6)).rejects.toThrow('Invalid score')
  })

  it('로그인하지 않으면 Unauthorized 에러', async () => {
    const { auth } = await import('@/lib/auth')
    vi.mocked(auth).mockResolvedValueOnce(null)
    await expect(createRating('roastery-1', 4)).rejects.toThrow('Unauthorized')
  })
})
```

### 테스트 예시 — E2E (Playwright)

#### E2E 인증 전략

OAuth는 외부 서비스라 E2E에서 직접 통과할 수 없다.
`TEST_SESSION_TOKEN` 환경변수로 보호된 테스트 전용 세션 API를 사용한다.

```ts
// src/app/api/test/session/route.ts
export async function POST(req: Request) {
  // TEST_SESSION_TOKEN 검증 (없으면 403)
  const testToken = process.env.TEST_SESSION_TOKEN
  if (!testToken || req.headers.get('x-test-token') !== testToken) {
    return new Response('Forbidden', { status: 403 })
  }

  const { userId } = await req.json()
  // 테스트 세션 쿠키 세팅 로직
  // ...
}
```

> **보안**: `TEST_SESSION_TOKEN`은 `.env.test`에만 설정하고 Vercel 프로덕션 환경 변수에는 절대 추가하지 않는다.

---

#### 추천 검증 테스트 — 핵심

```ts
// tests/recommendation.spec.ts
import { test, expect } from '@playwright/test'
import { seedTestData, clearTestData } from './helpers/db'

const TEST_TOKEN = process.env.TEST_SESSION_TOKEN!

test.beforeAll(async () => {
  await seedTestData({
    roasteries: [
      { id: 'r1', name: '블루보틀 서울' },
      { id: 'r2', name: '프릳츠' },
      { id: 'r3', name: '테라로사' },
      { id: 'r4', name: '커피리브레' },   // 추천 대상
      { id: 'r5', name: '앤트러사이트' },  // 추천 대상
    ],
    ratings: [
      // 테스트 유저
      { userId: 'test-user', roasteryId: 'r1', score: 5 },
      { userId: 'test-user', roasteryId: 'r2', score: 4 },
      { userId: 'test-user', roasteryId: 'r3', score: 5 },
      // 유사 유저 — 동일하게 높게 평가 + r4, r5 추가
      { userId: 'similar-user', roasteryId: 'r1', score: 5 },
      { userId: 'similar-user', roasteryId: 'r2', score: 4 },
      { userId: 'similar-user', roasteryId: 'r3', score: 4 },
      { userId: 'similar-user', roasteryId: 'r4', score: 5 },
      { userId: 'similar-user', roasteryId: 'r5', score: 5 },
      // 취향이 다른 유저 — 낮게 평가
      { userId: 'different-user', roasteryId: 'r1', score: 1 },
      { userId: 'different-user', roasteryId: 'r2', score: 2 },
      { userId: 'different-user', roasteryId: 'r3', score: 1 },
    ],
  })
})

test.afterAll(async () => {
  await clearTestData()
})

test('내 평가와 유사한 유저가 높게 평가한 로스터리가 추천된다', async ({ page }) => {
  await page.request.post('/api/test/session', {
    headers: { 'x-test-token': TEST_TOKEN },
    data: { userId: 'test-user' },
  })
  await page.goto('/')

  const recommendations = page.locator('[data-testid="recommendation-card"]')
  await expect(recommendations).toHaveCount(5)

  const names = await recommendations.allTextContents()
  expect(names.some(n => n.includes('커피리브레'))).toBe(true)
  expect(names.some(n => n.includes('앤트러사이트'))).toBe(true)
})

test('평가 3개 미만이면 인기 로스터리가 추천된다 (폴백)', async ({ page }) => {
  await page.request.post('/api/test/session', {
    headers: { 'x-test-token': TEST_TOKEN },
    data: { userId: 'new-user' },
  })
  await page.goto('/')

  await expect(page.locator('[data-testid="popular-fallback"]')).toBeVisible()
  await expect(page.locator('[data-testid="cf-recommendations"]')).not.toBeVisible()
})

test('내가 이미 평가한 로스터리는 추천에서 제외된다', async ({ page }) => {
  await page.request.post('/api/test/session', {
    headers: { 'x-test-token': TEST_TOKEN },
    data: { userId: 'test-user' },
  })
  await page.goto('/')

  const recommendations = page.locator('[data-testid="recommendation-card"]')
  const names = await recommendations.allTextContents()

  expect(names.every(n => !n.includes('블루보틀 서울'))).toBe(true)
  expect(names.every(n => !n.includes('프릳츠'))).toBe(true)
  expect(names.every(n => !n.includes('테라로사'))).toBe(true)
})
```

#### 온보딩 E2E

```ts
// tests/onboarding.spec.ts
test('온보딩 5문항 완료 후 홈 피드로 이동', async ({ page }) => {
  await page.request.post('/api/test/session', {
    headers: { 'x-test-token': TEST_TOKEN },
    data: { userId: 'fresh-user' },
  })
  await page.goto('/onboarding')

  await page.click('[data-testid="q1-online"]')
  await page.click('[data-testid="next"]')
  await page.click('[data-testid="q2-mid"]')
  await page.click('[data-testid="next"]')
  await page.click('[data-testid="q3-fruity"]')
  await page.click('[data-testid="next"]')
  await page.click('[data-testid="q4-beginner"]')
  await page.click('[data-testid="next"]')
  await page.click('[data-testid="q5-r1"]')
  await page.click('[data-testid="q5-r2"]')
  await page.click('[data-testid="q5-r3"]')
  await page.click('[data-testid="submit"]')

  await expect(page).toHaveURL('/')
})
```

> **구현 시 필수**: 모든 주요 컴포넌트에 `data-testid` 속성 부여.
> 추천 카드(`recommendation-card`), 폴백 섹션(`popular-fallback`), CF 섹션(`cf-recommendations`).

### package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "pretest:e2e": "pnpm build && pnpm dlx prisma db seed"
  }
}
```

---

## Server Actions 패턴

### 구조 원칙

- `'use server'` 파일은 `src/actions/`에 도메인별 분리
- 비즈니스 로직은 `src/lib/`에 두고 Action에서 호출
- score 등 입력값은 Action에서 반드시 검증 (DB 레이어 외 애플리케이션 레이어 이중 보호)
- 뮤테이션 후 반드시 `revalidatePath` / `revalidateTag`로 캐시 갱신

```ts
// src/actions/rating.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createRating(roasteryId: string, score: number, comment?: string) {
  // 입력값 검증
  if (score < 1 || score > 5) throw new Error('Invalid score')

  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await prisma.rating.upsert({
    where: { userId_roasteryId: { userId: session.user.id, roasteryId } },
    update: { score, comment },
    create: { userId: session.user.id, roasteryId, score, comment },
  })

  revalidatePath(`/roasteries/${roasteryId}`)
}
```

```ts
// src/actions/bookmark.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleBookmark(roasteryId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const existing = await prisma.bookmark.findUnique({
    where: { userId_roasteryId: { userId: session.user.id, roasteryId } },
  })

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } })
  } else {
    await prisma.bookmark.create({ data: { userId: session.user.id, roasteryId } })
  }

  revalidatePath(`/roasteries/${roasteryId}`)
  revalidatePath('/bookmarks')
}
```

### API Route는 인증 핸들러만 유지

```
app/api/auth/[...nextauth]/route.ts  ← NextAuth 전용
app/api/test/session/route.ts        ← E2E 테스트 전용 (TEST_SESSION_TOKEN 보호)
```

데이터 CRUD는 전부 Server Actions로 처리.

---

## 실행 순서 요약

```
── Phase 1: 프로젝트 초기화 ──────────────────────────
[1]  Next.js 16 초기화 (임시 폴더 → rsync)
[2]  폴더 구조 정리 + middleware.ts 플레이스홀더 생성
     커밋: chore: initialize Next.js 16 with app router

── Phase 2: 디자인 토큰 ──────────────────────────────
[3]  globals.css — @custom-variant dark + :root + @theme inline
     pretendard @import 방식 (next/font/local 불필요)
[4]  shadcn/ui init (-d 플래그) + MVP 컴포넌트 설치
     shadcn이 globals.css 수정 후 검토 필요:
       - --font-sans: var(--font-sans) → 'Pretendard', ... 으로 수정
       - .dark {} → [data-theme="dark"] {} 로 변경
     커밋: chore: add design tokens and shadcn/ui

── Phase 3: 데이터베이스 ─────────────────────────────
[5]  로컬 PostgreSQL 설치 (brew) + DB 2개 생성
[6]  Prisma 7 설치: prisma @prisma/client @prisma/adapter-pg pg
     pnpm-workspace.yaml에 onlyBuiltDependencies 추가
     pnpm rebuild prisma @prisma/engines
     prisma.config.ts 생성 (dotenv .env.local 로드)
     schema.prisma 작성 (datasource에 url 없음)
[7]  .env.local / .env.test 세팅 (username@localhost 형식)
     .env.example 작성 + .gitignore에 !.env.example 추가
[8]  prisma generate + prisma migrate dev --name init
[9]  prisma db seed (seed 커맨드는 prisma.config.ts에 설정)
     커밋: chore: add PostgreSQL schema and seed data

── Phase 4: 인증 ─────────────────────────────────────
[10] next-auth@beta @auth/prisma-adapter 설치
     auth.config.ts (Edge 호환, adapter 없음)
     auth.ts (PrismaAdapter 포함)
     middleware.ts: NextAuth(authConfig).auth export default
     /api/auth/[...nextauth]/route.ts
[11] src/lib/env.ts + prisma.ts에 import 추가
     커밋: chore: add NextAuth.js v5 with Google/Kakao/Naver

── Phase 5: 코드 품질 ────────────────────────────────
[12] prettier eslint-config-prettier 설치
     eslint.config.mjs에 prettier 추가
     .prettierrc 생성
     커밋: chore: add ESLint and Prettier config

── Phase 6: 테스트 ───────────────────────────────────
[13] vitest @vitejs/plugin-react @testing-library/* 설치
     vitest.config.ts (projects 배열, passWithNoTests: true)
     Vitest v4: loadEnv 제거, .env.test 자동 로드
[14] @playwright/test 설치
     playwright install chromium (네트워크 불안정 시 재시도)
     playwright.config.ts + /api/test/session 엔드포인트
     커밋: chore: add Vitest and Playwright test setup

── Phase 7: 배포 (사전 준비 필요) ──────────────────
[15] OAuth 앱 등록 (Google / Kakao / Naver)
     Oracle Cloud DB + Prisma Accelerate 설정
     Vercel 연결 + 환경 변수 등록
     커밋: chore: connect Vercel and configure deployment
```

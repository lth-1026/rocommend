# CLAUDE.md

## 커맨드
```bash
pnpm dev                   # 개발 서버
pnpm build && pnpm start   # 프로덕션 빌드
pnpm lint                  # ESLint
pnpm format                # Prettier
pnpm test                  # Vitest (unit)
pnpm test:e2e              # Playwright (E2E)
pnpm prisma migrate dev    # DB 스키마 변경 시
pnpm prisma db seed        # 시드 재실행
```

## 폴더 규칙
- 뮤테이션/폼 로직 → `src/actions/` (Server Actions)
- API Route는 `src/app/api/auth/`만 유지, 새로 추가 금지
- 공유 타입 → `src/types/`
- shadcn 컴포넌트 → `src/components/ui/` (직접 수정 가능)

## 반응형
- 최대 너비: 1440px (`--container-max`)
- 브레이크포인트: `md` = 768px (태블릿), `lg` = 1024px (데스크탑)
- 모바일/데스크탑 동등 중요 — 모든 컴포넌트 반응형 필수
- 페이지 최상위 래퍼: `<div className="page-wrapper">` (padding + max-width 자동 적용)

## 하지 말 것
- `.env.local` 커밋 금지
- 다크모드에 `.dark` 클래스 사용 금지 → `[data-theme="dark"]` 사용
- `tailwind.config.ts` 생성 금지 → 토큰은 `globals.css @theme`에서 관리
- Server Component에 불필요한 `'use client'` 추가 금지
- `src/middleware.ts` 생성 금지 → Next.js 16은 `src/proxy.ts`

## 브랜치 전략 (Git Flow)
- `main` — 프로덕션. 직접 커밋 금지
- `develop` — 통합 브랜치. 직접 커밋 금지
- `feat/{kebab-case}` — 기능 개발 → develop으로 PR (Squash merge)
- `fix/{kebab-case}` — 버그 수정 → develop으로 PR (Squash merge)
- `release/{version}` — 배포 준비 → main은 PR (Merge commit), develop은 로컬 merge 후 push (version 충돌 수동 해결)
- `hotfix/{kebab-case}` — 프로덕션 긴급 수정 → main + develop으로 PR (Merge commit)

## 커밋
- prefix: `feat` / `fix` / `chore` / `docs` / `style` / `refactor` / `test` / `perf` / `ci` / `build` / `revert`
- 본문: 한국어, `-` 목록
- Co-Authored-By 포함

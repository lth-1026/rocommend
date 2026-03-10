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

## 하지 말 것
- `.env.local` 커밋 금지
- 다크모드에 `.dark` 클래스 사용 금지 → `[data-theme="dark"]` 사용
- `tailwind.config.ts` 생성 금지 → 토큰은 `globals.css @theme`에서 관리
- Server Component에 불필요한 `'use client'` 추가 금지
- `src/middleware.ts` 생성 금지 → Next.js 16은 `src/proxy.ts`

## 커밋
- prefix: `feat` / `fix` / `chore` / `docs`
- 본문: 한국어, `-` 목록
- Co-Authored-By 포함

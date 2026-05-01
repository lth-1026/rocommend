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

## 브랜치 전략 (Git Flow + release-please)
> **⚠️ 모든 작업은 반드시 브랜치를 먼저 만든 뒤 시작한다.**
> `main`과 `develop`에 직접 커밋하면 절대 안 된다.
> 작업 시작 전 `git checkout -b feat/...` 또는 `git checkout -b fix/...` 실행 필수.

- `main` — 프로덕션. **직접 커밋 절대 금지**
- `develop` — 통합 브랜치. **직접 커밋 절대 금지**
- `feat/{kebab-case}` — 기능 개발 → develop으로 PR (Squash merge)
- `fix/{kebab-case}` — 버그 수정 → develop으로 PR (Squash merge)
- `hotfix/{kebab-case}` — 프로덕션 긴급 수정 → main + develop으로 PR (Merge commit)

### 릴리즈 흐름 (release-please 자동화)
`release/*` 브랜치는 release-please의 **Release PR**로 대체된다.

1. `feat/*` / `fix/*` → `develop` (Squash merge) — 평소 개발 흐름
2. develop에 커밋이 쌓이면 release-please가 자동으로 **Release PR** 생성
   - 버전 bump (`package.json`), `CHANGELOG.md` 자동 갱신
   - PR 타이틀 예시: `chore(main): release 0.7.0`
3. Release PR 검토 후 `main`에 머지 (Merge commit) → GitHub Release 자동 생성 + Vercel 자동 배포
4. `main` → `develop` 백머지 (버전 bump 동기화): `git switch develop && git merge main && git push`

## 커밋
- prefix: `feat` / `fix` / `chore` / `docs` / `style` / `refactor` / `test` / `perf` / `ci` / `build` / `revert`
- 본문: 한국어, `-` 목록
- Co-Authored-By 포함

## 릴리즈 절차 ("배포하자" 트리거)
사용자가 "배포하자"를 요청하면 아래 순서를 실행한다.

> **전제 조건**: 릴리즈할 모든 feat/fix 브랜치가 develop에 merge된 상태여야 한다.

1. **미merge 브랜치 확인** — develop에 반영 안 된 작업이 있으면 먼저 PR 생성 후 merge 요청.
2. **develop → main PR 생성 및 머지** — develop의 커밋을 main에 반영한다.
   ```bash
   gh pr create --base main --head develop --title "chore: merge develop into main for release" --body ""
   gh pr merge {PR번호} --merge --delete-branch=false
   ```
   > release-please는 `push to main`을 감지해야 Release PR을 생성한다. 이 단계가 없으면 `workflow_dispatch`를 눌러도 `commits: 0`으로 PR이 생성되지 않는다.
3. **Release PR 확인** — release-please가 자동으로 Release PR을 생성할 때까지 대기.
   ```bash
   gh pr list --base main
   ```
   자동 생성이 안 되면: `gh workflow run release-please.yml`
4. **Release PR 머지** — PR 내용(버전 bump, CHANGELOG) 확인 후 **Merge commit** 으로 main에 머지 → GitHub Release 자동 생성 + Vercel 자동 배포
5. **develop 백머지** — `git switch develop && git fetch origin main && git merge origin/main && git push`

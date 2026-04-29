# 배포 시스템

## 구성 요소

| 구성 | 도구 | 역할 |
|------|------|------|
| 호스팅 | Vercel | `main` 브랜치 push 시 자동 배포 |
| DB | Supabase PostgreSQL | 프로덕션 데이터베이스 |
| 버전 관리 | release-please (GitHub Actions) | CHANGELOG·버전 bump 자동화 |

---

## 브랜치 전략

```
feat/* ──┐
fix/*  ──┤ Squash merge → develop ──────────────────── PR → main
```

- `feat/*` / `fix/*` → `develop` (Squash merge)
- `develop` → `main` (Merge commit) — 이 머지가 배포 트리거

---

## 배포 흐름

### 1. 기능 개발
```
git switch -c feat/some-feature
# 개발 후
gh pr create --base develop
gh pr merge --squash
```

### 2. 배포 (develop → main)
```bash
# develop이 main보다 앞서 있는 상태에서
gh pr create --base main --title "feat: 기능 목록"
gh pr merge --merge   # Merge commit
```
→ Vercel이 `main` push를 감지해 자동 빌드·배포

### 3. 버전 태그 (release-please 자동)
`main`에 커밋이 쌓이면 GitHub Actions가 자동으로 Release PR 생성:
- `package.json` 버전 bump
- `CHANGELOG.md` 업데이트

Release PR을 머지하면:
- GitHub Release + 버전 태그 자동 생성
- Vercel이 한 번 더 배포 (package.json·CHANGELOG만 변경, 앱 동작 무변화)

---

## 버전 체계

[Conventional Commits](https://www.conventionalcommits.org/) 기반으로 버전 자동 결정:

| 커밋 prefix | 버전 변화 |
|-------------|-----------|
| `feat:` | minor bump (0.x.0) |
| `fix:` | patch bump (0.0.x) |
| `feat!:` / `BREAKING CHANGE` | major bump (x.0.0) |
| `chore:`, `docs:`, `refactor:` | CHANGELOG에 미포함 |

현재 버전: `0.7.0` (`.release-please-manifest.json` 참고)

---

## 설정 파일

| 파일 | 역할 |
|------|------|
| `.github/workflows/release-please.yml` | 워크플로우 (main push 트리거) |
| `release-please-config.json` | release-please 동작 설정 |
| `.release-please-manifest.json` | 현재 버전 추적 |

---

## 주의사항

- `main`에 직접 커밋 절대 금지 — 항상 PR 경유
- Release PR(버전 bump)은 자동 생성됨 — 수동으로 만들지 않는다
- Vercel 배포는 `main` merge마다 발생 (Release PR 포함, 총 2회/배포 주기)
- `.env.local` 커밋 금지 — 환경 변수는 Vercel Dashboard에서 관리

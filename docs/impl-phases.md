# 구현 페이즈 및 병렬 전략

**기반**: `docs/impl-checklist.md`
각 피처의 테스트 게이트를 통과한 후에만 PR을 생성하고 develop에 머지한다.

---

## Phase 순서 (의존성 기준)

| Phase | 브랜치 | 방식 | 선행 조건 |
|-------|--------|------|----------|
| 1 | `chore/pre-impl` | 절차 | — |
| 2 | `feat/auth-login` | 절차 | Phase 1 머지 완료 |
| 3 | `feat/onboarding` | 절차 | Phase 2 머지 완료 |
| 4a | `feat/roastery-list-detail` + `feat/roastery-filter` | 병렬 worktree | Phase 3 머지 완료 |
| 4b | `feat/user-profile` | 병렬 worktree | Phase 3 머지 완료 |
| 5a | `feat/rating-system` | 병렬 worktree | Phase 4a 머지 완료 |
| 5b | `feat/bookmark` | 병렬 worktree | Phase 4a 머지 완료 |
| 6 | `feat/home-feed-cf` | 절차 | Phase 5a 머지 완료 |

> 이벤트 로깅(`logEvent`, `logClientEvent`)은 각 피처 브랜치에 인라인 포함. 별도 브랜치 없음.

---

## 병렬 worktree 실행 규칙

1. **시작 전**: `git switch develop && git pull` — develop 최신 상태 확인
2. **worktree 생성**: `git worktree add ../{dir} -b {브랜치명}`
3. **각 worktree에서 독립 구현** — 파일 충돌 범위 확인 후 시작
4. **테스트 게이트 통과 후 PR 생성** (`--base develop`)
5. **머지 순서**: 충돌 가능성 있는 경우(예: `RoasteryCard.tsx`) 하나씩 머지 후 다음 PR에서 rebase
6. **worktree 정리**: `git worktree remove ../{dir}`

### 예시 (Phase 4 병렬 시작)

```bash
git switch develop && git pull
git worktree add ../roco-roastery -b feat/roastery-list-detail
git worktree add ../roco-profile  -b feat/user-profile
# → 두 worktree에서 동시에 sub-agent 실행
```

---

## 피처 완료 체크리스트 (PR 생성 전 필수)

- [ ] 테스트 게이트 통과 (`impl-checklist.md` ✅ 항목 확인)
- [ ] `pnpm lint` 통과
- [ ] `pnpm build` 오류 없음
- [ ] `.env.local` 미포함 확인

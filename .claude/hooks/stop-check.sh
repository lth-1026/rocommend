#!/bin/bash
# Claude Code Stop 훅: lint, format:check, test 자동 검사
# 실패 시 decision: block 출력 → Claude가 종료하지 못하고 오류를 수정해야 함

cd /Users/taeholee/Documents/programming/rocommend

FAILURES=()

# 1. ESLint
if ! pnpm lint --quiet 2>/tmp/claude-lint.log; then
  FAILURES+=("lint")
fi

# 2. Prettier
if ! pnpm format:check 2>/tmp/claude-format.log; then
  FAILURES+=("format:check")
fi

# 3. Vitest
if ! pnpm test --run 2>/tmp/claude-test.log | tail -3; then
  FAILURES+=("test")
fi

if [ ${#FAILURES[@]} -gt 0 ]; then
  FAILED=$(IFS=", "; echo "${FAILURES[*]}")
  python3 -c "
import json
print(json.dumps({
  'decision': 'block',
  'reason': '검사 실패 [${FAILED}] — 오류를 수정한 뒤 다시 시도하세요. 로그: /tmp/claude-lint.log, /tmp/claude-format.log, /tmp/claude-test.log'
}))
"
fi

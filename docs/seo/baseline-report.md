# SEO Baseline Report

측정일: 2026-04-15  
도구: Lighthouse CLI 13.1.0 (headless Chrome)

## 점수 요약

| 페이지 | Performance | Accessibility | Best Practices | SEO |
|--------|-------------|---------------|----------------|-----|
| `/home` (→ `/roasteries` 리다이렉트 후) | 78 | 96 | 100 | 92 |
| `/roasteries` | 69 | 97 | 100 | 92 |
| `/roasteries/[id]` | 77 | 96 | 100 | 92 |

---

## SEO 92점 원인 (실패 항목)

### 1. `robots-txt` 감사 실패 ← **크리티컬**

`/robots.txt`가 plain text 대신 **로그인 페이지 HTML**을 반환함.

**원인**: `src/proxy.ts` 미들웨어의 PUBLIC_PATHS에 `/robots.txt`가 없어서,  
미인증 요청이 `/login`으로 리다이렉트됨.

```
robots.ts에 선언된 sitemap URL: https://rocommend.com/sitemap.xml
실제 robots.txt 응답: 로그인 페이지 HTML → Googlebot이 파싱 불가
```

---

## 추가 발견 이슈

### 2. `sitemap.xml` 없음 ← **크리티컬**

`robots.ts`에 `sitemap: 'https://rocommend.com/sitemap.xml'`이 선언되어 있으나  
`src/app/sitemap.ts` 파일이 존재하지 않음 → 404 반환.

### 3. 페이지별 고유 metadata 없음

모든 페이지가 동일한 기본 title/description 사용:
- title: `"roco"` (고유 title 없음)
- description: `"취향에 맞는 스페셜티 커피 로스터리 추천"` (모든 페이지 동일)

### 4. `metadataBase` 미설정

OG 이미지 등 절대 URL이 필요한 경우 깨질 수 있음.

### 5. 로그인 페이지 `noindex, nofollow`

로그인 페이지 자체에는 적절한 설정.  
단, 공개 페이지가 실수로 리다이렉트될 경우 위험.

---

## 작업 우선순위

| 순위 | 작업 | 예상 점수 효과 |
|------|------|--------------|
| 1 | `proxy.ts` matcher에 `robots.txt`, `sitemap.xml` 제외 추가 | SEO 92 → 100 |
| 2 | `sitemap.ts` 생성 | 크롤링 완결성 |
| 3 | `layout.tsx` metadataBase + title template | OG 안정성 |
| 4 | `/roasteries/[id]` generateMetadata | 인덱싱 품질 |
| 5 | `/roasteries` static metadata | 인덱싱 품질 |

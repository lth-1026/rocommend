-- ICU 기반 한국어 collation 생성 (OS locale 설치 불필요, PostgreSQL 12+ 지원)
CREATE COLLATION IF NOT EXISTS ko_icu (provider = icu, locale = 'ko');

-- Roastery.name 컬럼에 한국어 collation 적용
-- 이후 ORDER BY name ASC 가 가나다 순으로 자동 정렬됨
ALTER TABLE "Roastery" ALTER COLUMN name TYPE TEXT COLLATE ko_icu;

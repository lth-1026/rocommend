-- regions 배열 hasSome 쿼리 최적화를 위한 GIN 인덱스
CREATE INDEX IF NOT EXISTS "Roastery_regions_gin_idx" ON "Roastery" USING GIN ("regions");

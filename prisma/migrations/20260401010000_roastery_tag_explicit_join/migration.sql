-- RoasteryTag 명시적 조인 테이블 생성
CREATE TABLE "RoasteryTag" (
    "roasteryId" TEXT NOT NULL,
    "tagId"      TEXT NOT NULL,
    "isPrimary"  BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "RoasteryTag_pkey" PRIMARY KEY ("roasteryId", "tagId")
);

CREATE INDEX "RoasteryTag_tagId_idx" ON "RoasteryTag"("tagId");

ALTER TABLE "RoasteryTag" ADD CONSTRAINT "RoasteryTag_roasteryId_fkey"
    FOREIGN KEY ("roasteryId") REFERENCES "Roastery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoasteryTag" ADD CONSTRAINT "RoasteryTag_tagId_fkey"
    FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기존 데이터 마이그레이션
-- REGION 태그 중 각 로스터리에서 이름 가나다순 첫 번째 = isPrimary true
-- CHARACTERISTIC 태그는 isPrimary = false
INSERT INTO "RoasteryTag" ("roasteryId", "tagId", "isPrimary")
SELECT
    j."A",
    j."B",
    CASE
        WHEN t.category = 'REGION' AND j."B" = (
            SELECT j2."B"
            FROM "_RoasteryToTag" j2
            JOIN "Tag" t2 ON j2."B" = t2.id
            WHERE j2."A" = j."A" AND t2.category = 'REGION'
            ORDER BY t2.name ASC
            LIMIT 1
        ) THEN true
        ELSE false
    END
FROM "_RoasteryToTag" j
JOIN "Tag" t ON j."B" = t.id;

-- 기존 암묵적 조인 테이블 제거
DROP TABLE "_RoasteryToTag";

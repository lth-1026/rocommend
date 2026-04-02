-- TagCategory enum 생성
CREATE TYPE "TagCategory" AS ENUM ('REGION', 'CHARACTERISTIC');

-- Tag 테이블 생성
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TagCategory" NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- Tag 고유 제약 (이름 + 카테고리 조합)
CREATE UNIQUE INDEX "Tag_name_category_key" ON "Tag"("name", "category");

-- Tag 카테고리 인덱스
CREATE INDEX "Tag_category_idx" ON "Tag"("category");

-- Roastery ↔ Tag 암묵적 다대다 조인 테이블
CREATE TABLE "_RoasteryToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_RoasteryToTag_AB_unique" ON "_RoasteryToTag"("A" ASC, "B" ASC);
CREATE INDEX "_RoasteryToTag_B_index" ON "_RoasteryToTag"("B" ASC);

ALTER TABLE "_RoasteryToTag" ADD CONSTRAINT "_RoasteryToTag_A_fkey"
    FOREIGN KEY ("A") REFERENCES "Roastery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_RoasteryToTag" ADD CONSTRAINT "_RoasteryToTag_B_fkey"
    FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- regions GIN 인덱스 제거
DROP INDEX IF EXISTS "Roastery_regions_gin_idx";

-- regions 컬럼 제거
ALTER TABLE "Roastery" DROP COLUMN "regions";

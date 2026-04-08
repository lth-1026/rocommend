-- AlterTable
ALTER TABLE "Roastery" ADD COLUMN     "address" TEXT;

-- CreateTable
CREATE TABLE "ChannelDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "logoUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChannelDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoasteryChannel" (
    "id" TEXT NOT NULL,
    "roasteryId" TEXT NOT NULL,
    "channelKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoasteryChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeanChannelPrice" (
    "beanId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "BeanChannelPrice_pkey" PRIMARY KEY ("beanId","channelId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChannelDefinition_key_key" ON "ChannelDefinition"("key");

-- CreateIndex
CREATE INDEX "RoasteryChannel_roasteryId_idx" ON "RoasteryChannel"("roasteryId");

-- CreateIndex
CREATE UNIQUE INDEX "RoasteryChannel_roasteryId_channelKey_key" ON "RoasteryChannel"("roasteryId", "channelKey");

-- AddForeignKey
ALTER TABLE "RoasteryChannel" ADD CONSTRAINT "RoasteryChannel_roasteryId_fkey" FOREIGN KEY ("roasteryId") REFERENCES "Roastery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoasteryChannel" ADD CONSTRAINT "RoasteryChannel_channelKey_fkey" FOREIGN KEY ("channelKey") REFERENCES "ChannelDefinition"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeanChannelPrice" ADD CONSTRAINT "BeanChannelPrice_beanId_fkey" FOREIGN KEY ("beanId") REFERENCES "Bean"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeanChannelPrice" ADD CONSTRAINT "BeanChannelPrice_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "RoasteryChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed ChannelDefinition 초기값
INSERT INTO "ChannelDefinition" (id, key, label, "order")
VALUES
  (gen_random_uuid()::text, 'naver',       '네이버 스마트스토어', 1),
  (gen_random_uuid()::text, 'website',     '자사몰',             2),
  (gen_random_uuid()::text, 'cm29',        '29cm',               3),
  (gen_random_uuid()::text, 'unspecialty', '언스페셜티',          4),
  (gen_random_uuid()::text, 'homebaristar','홈바리스타',          5)
ON CONFLICT (key) DO NOTHING;

-- 기존 Roastery.website → RoasteryChannel(channelKey='website') 마이그레이션
INSERT INTO "RoasteryChannel" (id, "roasteryId", "channelKey", url, "createdAt")
SELECT
  gen_random_uuid()::text,
  r.id,
  'website',
  r.website,
  NOW()
FROM "Roastery" r
WHERE r.website IS NOT NULL AND r.website != ''
ON CONFLICT ("roasteryId", "channelKey") DO NOTHING;

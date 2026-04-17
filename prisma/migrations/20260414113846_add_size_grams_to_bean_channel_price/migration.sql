-- AlterTable (idempotent)
ALTER TABLE "BeanChannelPrice" ADD COLUMN IF NOT EXISTS "sizeGrams" INTEGER;
ALTER TABLE "BeanChannelPrice" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;

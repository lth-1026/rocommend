-- CreateTable (idempotent)
CREATE TABLE IF NOT EXISTS "BeanChannelPriceSnapshot" (
    "id" TEXT NOT NULL,
    "beanId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "snappedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeanChannelPriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "BeanChannelPriceSnapshot_beanId_channelId_idx" ON "BeanChannelPriceSnapshot"("beanId", "channelId");

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "BeanChannelPriceSnapshot_snappedAt_idx" ON "BeanChannelPriceSnapshot"("snappedAt");

-- AddForeignKey (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'BeanChannelPriceSnapshot_beanId_channelId_fkey'
  ) THEN
    ALTER TABLE "BeanChannelPriceSnapshot"
      ADD CONSTRAINT "BeanChannelPriceSnapshot_beanId_channelId_fkey"
      FOREIGN KEY ("beanId", "channelId")
      REFERENCES "BeanChannelPrice"("beanId", "channelId")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

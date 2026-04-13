-- AlterTable
ALTER TABLE "BeanChannelPrice" ADD COLUMN     "sourceUrl" TEXT;

-- CreateTable
CREATE TABLE "BeanChannelPriceSnapshot" (
    "id" TEXT NOT NULL,
    "beanId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "snappedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeanChannelPriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BeanChannelPriceSnapshot_beanId_channelId_idx" ON "BeanChannelPriceSnapshot"("beanId", "channelId");

-- CreateIndex
CREATE INDEX "BeanChannelPriceSnapshot_snappedAt_idx" ON "BeanChannelPriceSnapshot"("snappedAt");

-- AddForeignKey
ALTER TABLE "BeanChannelPriceSnapshot" ADD CONSTRAINT "BeanChannelPriceSnapshot_beanId_channelId_fkey" FOREIGN KEY ("beanId", "channelId") REFERENCES "BeanChannelPrice"("beanId", "channelId") ON DELETE CASCADE ON UPDATE CASCADE;

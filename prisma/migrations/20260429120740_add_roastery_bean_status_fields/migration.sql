-- AlterTable
ALTER TABLE "Bean" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Roastery" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Bean_deletedAt_idx" ON "Bean"("deletedAt");

-- CreateIndex
CREATE INDEX "Roastery_deletedAt_idx" ON "Roastery"("deletedAt");

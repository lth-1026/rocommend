-- AlterTable
ALTER TABLE "Onboarding" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "Roastery" ADD COLUMN     "isOnboardingCandidate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferences" JSONB;

-- CreateTable
CREATE TABLE "Bean" (
    "id" TEXT NOT NULL,
    "roasteryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origins" TEXT[],
    "roastingLevel" TEXT NOT NULL,
    "decaf" BOOLEAN NOT NULL DEFAULT false,
    "cupNotes" TEXT[],
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bean_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roasteryId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "event" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bean_roasteryId_idx" ON "Bean"("roasteryId");

-- CreateIndex
CREATE INDEX "Recommendation_userId_idx" ON "Recommendation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_userId_roasteryId_key" ON "Recommendation"("userId", "roasteryId");

-- CreateIndex
CREATE INDEX "EventLog_event_idx" ON "EventLog"("event");

-- CreateIndex
CREATE INDEX "EventLog_userId_idx" ON "EventLog"("userId");

-- CreateIndex
CREATE INDEX "EventLog_createdAt_idx" ON "EventLog"("createdAt");

-- CreateIndex
CREATE INDEX "Roastery_priceRange_idx" ON "Roastery"("priceRange");

-- CreateIndex
CREATE INDEX "Roastery_decaf_idx" ON "Roastery"("decaf");

-- CreateIndex
CREATE INDEX "Roastery_name_idx" ON "Roastery"("name");

-- AddForeignKey
ALTER TABLE "Bean" ADD CONSTRAINT "Bean_roasteryId_fkey" FOREIGN KEY ("roasteryId") REFERENCES "Roastery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- GIN indexes for array column filtering (hasSome) — not supported by Prisma, added manually
CREATE INDEX "Roastery_regions_gin_idx" ON "Roastery" USING GIN ("regions");
CREATE INDEX "Bean_origins_gin_idx" ON "Bean" USING GIN ("origins");

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_roasteryId_fkey" FOREIGN KEY ("roasteryId") REFERENCES "Roastery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

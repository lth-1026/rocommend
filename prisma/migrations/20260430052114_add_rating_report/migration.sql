-- CreateEnum
CREATE TYPE "RatingReportReason" AS ENUM ('SPAM', 'INAPPROPRIATE', 'OTHER');

-- CreateTable
CREATE TABLE "RatingReport" (
    "id" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" "RatingReportReason" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RatingReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RatingReport_ratingId_idx" ON "RatingReport"("ratingId");

-- CreateIndex
CREATE INDEX "RatingReport_userId_idx" ON "RatingReport"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RatingReport_ratingId_userId_key" ON "RatingReport"("ratingId", "userId");

-- AddForeignKey
ALTER TABLE "RatingReport" ADD CONSTRAINT "RatingReport_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "Rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingReport" ADD CONSTRAINT "RatingReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

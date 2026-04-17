-- CreateEnum
CREATE TYPE "RoasteryRequestStatus" AS ENUM ('PENDING', 'READ');

-- CreateTable
CREATE TABLE "RoasteryRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RoasteryRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoasteryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoasteryRequest_userId_idx" ON "RoasteryRequest"("userId");

-- CreateIndex
CREATE INDEX "RoasteryRequest_status_idx" ON "RoasteryRequest"("status");

-- CreateIndex
CREATE INDEX "RoasteryRequest_createdAt_idx" ON "RoasteryRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "RoasteryRequest" ADD CONSTRAINT "RoasteryRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

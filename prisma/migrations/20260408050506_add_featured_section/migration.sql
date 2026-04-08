-- CreateTable
CREATE TABLE "FeaturedSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturedSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedSectionRoastery" (
    "sectionId" TEXT NOT NULL,
    "roasteryId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FeaturedSectionRoastery_pkey" PRIMARY KEY ("sectionId","roasteryId")
);

-- CreateIndex
CREATE INDEX "FeaturedSectionRoastery_roasteryId_idx" ON "FeaturedSectionRoastery"("roasteryId");

-- AddForeignKey
ALTER TABLE "FeaturedSectionRoastery" ADD CONSTRAINT "FeaturedSectionRoastery_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FeaturedSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedSectionRoastery" ADD CONSTRAINT "FeaturedSectionRoastery_roasteryId_fkey" FOREIGN KEY ("roasteryId") REFERENCES "Roastery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

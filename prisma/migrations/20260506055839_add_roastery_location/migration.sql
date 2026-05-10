-- CreateTable
CREATE TABLE "RoasteryLocation" (
    "id" TEXT NOT NULL,
    "roasteryId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RoasteryLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoasteryLocation_roasteryId_idx" ON "RoasteryLocation"("roasteryId");

-- AddForeignKey
ALTER TABLE "RoasteryLocation" ADD CONSTRAINT "RoasteryLocation_roasteryId_fkey" FOREIGN KEY ("roasteryId") REFERENCES "Roastery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

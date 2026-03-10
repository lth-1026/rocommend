-- DropIndex
DROP INDEX "Bean_origins_gin_idx";

-- DropIndex
DROP INDEX "Roastery_regions_gin_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3);

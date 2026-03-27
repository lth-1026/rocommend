-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- DropIndex
DROP INDEX "Roastery_regions_gin_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

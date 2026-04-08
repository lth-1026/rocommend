-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('CF_NEW', 'CF_REPEAT', 'POPULAR', 'CUSTOM');

-- AlterTable
ALTER TABLE "FeaturedSection" ADD COLUMN     "type" "SectionType" NOT NULL DEFAULT 'CUSTOM';

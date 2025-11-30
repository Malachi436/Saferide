-- CreateEnum
CREATE TYPE "PickupType" AS ENUM ('HOME', 'ROADSIDE', 'SCHOOL');

-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "pickupDescription" TEXT,
ADD COLUMN     "pickupLatitude" DOUBLE PRECISION,
ADD COLUMN     "pickupLongitude" DOUBLE PRECISION,
ADD COLUMN     "pickupType" "PickupType" NOT NULL DEFAULT 'SCHOOL';

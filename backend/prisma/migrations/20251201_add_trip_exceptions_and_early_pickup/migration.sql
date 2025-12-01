-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- AlterTable: Add columns to School
ALTER TABLE "School" ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION,
ADD COLUMN "address" TEXT;

-- AlterTable: Add columns to Child
ALTER TABLE "Child" ADD COLUMN "homeLatitude" DOUBLE PRECISION,
ADD COLUMN "homeLongitude" DOUBLE PRECISION,
ADD COLUMN "homeAddress" TEXT,
ADD COLUMN "colorCode" TEXT NOT NULL DEFAULT '#3B82F6';

-- CreateTable
CREATE TABLE "TripException" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "tripId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarlyPickupRequest" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "requestedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EarlyPickupRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TripException_childId_tripId_key" ON "TripException"("childId", "tripId");

-- CreateIndex
CREATE INDEX "TripException_childId_idx" ON "TripException"("childId");

-- CreateIndex
CREATE INDEX "TripException_tripId_idx" ON "TripException"("tripId");

-- CreateIndex
CREATE INDEX "TripException_date_idx" ON "TripException"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EarlyPickupRequest_childId_tripId_key" ON "EarlyPickupRequest"("childId", "tripId");

-- CreateIndex
CREATE INDEX "EarlyPickupRequest_childId_idx" ON "EarlyPickupRequest"("childId");

-- CreateIndex
CREATE INDEX "EarlyPickupRequest_tripId_idx" ON "EarlyPickupRequest"("tripId");

-- CreateIndex
CREATE INDEX "EarlyPickupRequest_status_idx" ON "EarlyPickupRequest"("status");

-- CreateIndex
CREATE INDEX "EarlyPickupRequest_requestedTime_idx" ON "EarlyPickupRequest"("requestedTime");

-- AddForeignKey
ALTER TABLE "TripException" ADD CONSTRAINT "TripException_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripException" ADD CONSTRAINT "TripException_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarlyPickupRequest" ADD CONSTRAINT "EarlyPickupRequest_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarlyPickupRequest" ADD CONSTRAINT "EarlyPickupRequest_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarlyPickupRequest" ADD CONSTRAINT "EarlyPickupRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarlyPickupRequest" ADD CONSTRAINT "EarlyPickupRequest_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

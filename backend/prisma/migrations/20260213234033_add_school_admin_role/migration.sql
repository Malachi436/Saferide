/*
  Warnings:

  - You are about to drop the column `driverId` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the `ChildPaymentSubscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentPlan` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[uniqueCode]` on the table `Child` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schoolCode]` on the table `School` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "LocationChangeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'PICKUP';
ALTER TYPE "NotificationType" ADD VALUE 'DROPOFF';
ALTER TYPE "NotificationType" ADD VALUE 'DELAY';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT';
ALTER TYPE "NotificationType" ADD VALUE 'SKIP_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'PARENT_PICKUP';
ALTER TYPE "NotificationType" ADD VALUE 'UNSKIP_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'LOCATION_CHANGE_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'GRADE_UPDATE';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SCHOOL_ADMIN';

-- DropForeignKey
ALTER TABLE "Bus" DROP CONSTRAINT "Bus_driverId_fkey";

-- DropForeignKey
ALTER TABLE "Child" DROP CONSTRAINT "Child_driverId_fkey";

-- DropForeignKey
ALTER TABLE "Child" DROP CONSTRAINT "Child_parentId_fkey";

-- DropForeignKey
ALTER TABLE "ChildPaymentSubscription" DROP CONSTRAINT "ChildPaymentSubscription_childId_fkey";

-- DropForeignKey
ALTER TABLE "ChildPaymentSubscription" DROP CONSTRAINT "ChildPaymentSubscription_parentId_fkey";

-- DropForeignKey
ALTER TABLE "ChildPaymentSubscription" DROP CONSTRAINT "ChildPaymentSubscription_planId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentPlan" DROP CONSTRAINT "PaymentPlan_companyId_fkey";

-- DropIndex
DROP INDEX "Child_driverId_idx";

-- AlterTable
ALTER TABLE "Bus" ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "schoolId" TEXT,
ALTER COLUMN "driverId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Child" DROP COLUMN "driverId",
ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "daysUntilPayment" INTEGER,
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "isClaimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "medicalConditions" TEXT,
ADD COLUMN     "parentPhone" TEXT,
ADD COLUMN     "routeId" TEXT,
ADD COLUMN     "specialInstructions" TEXT,
ADD COLUMN     "uniqueCode" TEXT,
ALTER COLUMN "parentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "baseFare" INTEGER NOT NULL DEFAULT 50000,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'UGX';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "acknowledgedAt" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "relatedEntityId" TEXT,
ADD COLUMN     "relatedEntityType" TEXT,
ADD COLUMN     "requiresAck" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "busId" TEXT,
ADD COLUMN     "shift" TEXT;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "baseFare" INTEGER NOT NULL DEFAULT 50000,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'UGX',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "schoolCode" TEXT;

-- DropTable
DROP TABLE "ChildPaymentSubscription";

-- DropTable
DROP TABLE "PaymentPlan";

-- CreateTable
CREATE TABLE "LocationChangeRequest" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "oldLatitude" DOUBLE PRECISION,
    "oldLongitude" DOUBLE PRECISION,
    "oldAddress" TEXT,
    "newLatitude" DOUBLE PRECISION NOT NULL,
    "newLongitude" DOUBLE PRECISION NOT NULL,
    "newAddress" TEXT,
    "status" "LocationChangeStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FareHistory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "schoolId" TEXT,
    "oldFare" INTEGER NOT NULL,
    "newFare" INTEGER NOT NULL,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FareHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocationChangeRequest_childId_idx" ON "LocationChangeRequest"("childId");

-- CreateIndex
CREATE INDEX "LocationChangeRequest_status_idx" ON "LocationChangeRequest"("status");

-- CreateIndex
CREATE INDEX "LocationChangeRequest_createdAt_idx" ON "LocationChangeRequest"("createdAt");

-- CreateIndex
CREATE INDEX "FareHistory_companyId_idx" ON "FareHistory"("companyId");

-- CreateIndex
CREATE INDEX "FareHistory_createdAt_idx" ON "FareHistory"("createdAt");

-- CreateIndex
CREATE INDEX "Bus_companyId_idx" ON "Bus"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Child_uniqueCode_key" ON "Child"("uniqueCode");

-- CreateIndex
CREATE INDEX "Child_uniqueCode_idx" ON "Child"("uniqueCode");

-- CreateIndex
CREATE INDEX "Child_routeId_idx" ON "Child"("routeId");

-- CreateIndex
CREATE INDEX "Child_parentPhone_idx" ON "Child"("parentPhone");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_requiresAck_idx" ON "Notification"("requiresAck");

-- CreateIndex
CREATE INDEX "Route_busId_idx" ON "Route"("busId");

-- CreateIndex
CREATE UNIQUE INDEX "School_schoolCode_key" ON "School"("schoolCode");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationChangeRequest" ADD CONSTRAINT "LocationChangeRequest_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FareHistory" ADD CONSTRAINT "FareHistory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FareHistory" ADD CONSTRAINT "FareHistory_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

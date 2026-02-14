/*
  Warnings:

  - The values [COMPANY_ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `companyId` on the `Bus` table. All the data in the column will be lost.
  - You are about to drop the column `baseFare` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `FareHistory` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `User` table. All the data in the column will be lost.
  - Made the column `schoolId` on table `FareHistory` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'DRIVER', 'PARENT');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Bus" DROP CONSTRAINT "Bus_companyId_fkey";

-- DropForeignKey
ALTER TABLE "FareHistory" DROP CONSTRAINT "FareHistory_companyId_fkey";

-- DropForeignKey
ALTER TABLE "FareHistory" DROP CONSTRAINT "FareHistory_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "School" DROP CONSTRAINT "School_companyId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_companyId_fkey";

-- DropIndex
DROP INDEX "Bus_companyId_idx";

-- DropIndex
DROP INDEX "FareHistory_companyId_idx";

-- DropIndex
DROP INDEX "School_companyId_idx";

-- DropIndex
DROP INDEX "User_companyId_idx";

-- AlterTable
ALTER TABLE "Bus" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "baseFare",
DROP COLUMN "currency";

-- AlterTable
ALTER TABLE "FareHistory" DROP COLUMN "companyId",
ALTER COLUMN "schoolId" SET NOT NULL;

-- AlterTable
ALTER TABLE "School" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "companyId";

-- CreateIndex
CREATE INDEX "Bus_schoolId_idx" ON "Bus"("schoolId");

-- CreateIndex
CREATE INDEX "FareHistory_schoolId_idx" ON "FareHistory"("schoolId");

-- AddForeignKey
ALTER TABLE "FareHistory" ADD CONSTRAINT "FareHistory_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

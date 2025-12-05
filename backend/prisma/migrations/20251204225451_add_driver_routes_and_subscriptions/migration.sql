-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "driverId" TEXT;

-- CreateTable
CREATE TABLE "ChildPaymentSubscription" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildPaymentSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChildPaymentSubscription_childId_idx" ON "ChildPaymentSubscription"("childId");

-- CreateIndex
CREATE INDEX "ChildPaymentSubscription_planId_idx" ON "ChildPaymentSubscription"("planId");

-- CreateIndex
CREATE INDEX "ChildPaymentSubscription_parentId_idx" ON "ChildPaymentSubscription"("parentId");

-- CreateIndex
CREATE INDEX "Child_driverId_idx" ON "Child"("driverId");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildPaymentSubscription" ADD CONSTRAINT "ChildPaymentSubscription_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildPaymentSubscription" ADD CONSTRAINT "ChildPaymentSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PaymentPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildPaymentSubscription" ADD CONSTRAINT "ChildPaymentSubscription_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

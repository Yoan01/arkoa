/*
  Warnings:

  - You are about to drop the column `userId` on the `leave` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `leave_balance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[membershipId,leaveTypeId]` on the table `leave_balance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `membershipId` to the `leave` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membershipId` to the `leave_balance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "leave" DROP CONSTRAINT "leave_userId_fkey";

-- DropForeignKey
ALTER TABLE "leave_balance" DROP CONSTRAINT "leave_balance_userId_fkey";

-- DropIndex
DROP INDEX "leave_balance_userId_leaveTypeId_key";

-- AlterTable
ALTER TABLE "leave" DROP COLUMN "userId",
ADD COLUMN     "membershipId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "leave_balance" DROP COLUMN "userId",
ADD COLUMN     "membershipId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "leave_membershipId_idx" ON "leave"("membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balance_membershipId_leaveTypeId_key" ON "leave_balance"("membershipId", "leaveTypeId");

-- AddForeignKey
ALTER TABLE "leave_balance" ADD CONSTRAINT "leave_balance_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave" ADD CONSTRAINT "leave_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

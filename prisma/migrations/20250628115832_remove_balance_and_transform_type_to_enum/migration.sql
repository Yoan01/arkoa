/*
  Warnings:

  - You are about to drop the column `leaveTypeId` on the `leave` table. All the data in the column will be lost.
  - You are about to drop the `leave_balance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leave_type` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `leaveType` to the `leave` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('PAID', 'UNPAID', 'RTT', 'SICK', 'MATERNITY', 'PATERNITY', 'PARENTAL', 'BEREAVEMENT', 'MARRIAGE', 'MOVING', 'CHILD_SICK', 'TRAINING', 'UNJUSTIFIED', 'ADJUSTMENT');

-- DropForeignKey
ALTER TABLE "leave" DROP CONSTRAINT "leave_leaveTypeId_fkey";

-- DropForeignKey
ALTER TABLE "leave_balance" DROP CONSTRAINT "leave_balance_leaveTypeId_fkey";

-- DropForeignKey
ALTER TABLE "leave_balance" DROP CONSTRAINT "leave_balance_membershipId_fkey";

-- AlterTable
ALTER TABLE "leave" DROP COLUMN "leaveTypeId",
ADD COLUMN     "leaveType" "LeaveType" NOT NULL;

-- DropTable
DROP TABLE "leave_balance";

-- DropTable
DROP TABLE "leave_type";

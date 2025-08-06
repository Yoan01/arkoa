/*
  Warnings:

  - You are about to drop the column `isHalfDay` on the `leave` table. All the data in the column will be lost.
  - Added the required column `type` to the `leave_balance_history` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LeaveBalanceHistoryType" AS ENUM ('AUTOMATIC_CREDIT', 'MANUAL_CREDIT', 'LEAVE_REFUND', 'LEAVE_DEDUCTION', 'CARRY_FORWARD', 'EXPIRATION');

-- AlterTable
ALTER TABLE "leave" DROP COLUMN "isHalfDay";

-- AlterTable
ALTER TABLE "leave_balance_history" ADD COLUMN     "type" "LeaveBalanceHistoryType" NOT NULL;

/*
  Warnings:

  - The values [AUTOMATIC_CREDIT,MANUAL_CREDIT] on the enum `LeaveBalanceHistoryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LeaveBalanceHistoryType_new" AS ENUM ('AUTO_CREDIT', 'MANUEL_CREDIT', 'LEAVE_REFUND', 'LEAVE_DEDUCTION', 'CARRY_FORWARD', 'EXPIRATION');
ALTER TABLE "leave_balance_history" ALTER COLUMN "type" TYPE "LeaveBalanceHistoryType_new" USING ("type"::text::"LeaveBalanceHistoryType_new");
ALTER TYPE "LeaveBalanceHistoryType" RENAME TO "LeaveBalanceHistoryType_old";
ALTER TYPE "LeaveBalanceHistoryType_new" RENAME TO "LeaveBalanceHistoryType";
DROP TYPE "LeaveBalanceHistoryType_old";
COMMIT;

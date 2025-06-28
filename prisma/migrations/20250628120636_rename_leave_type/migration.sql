/*
  Warnings:

  - You are about to drop the column `leaveType` on the `leave` table. All the data in the column will be lost.
  - Added the required column `type` to the `leave` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "leave" DROP COLUMN "leaveType",
ADD COLUMN     "type" "LeaveType" NOT NULL;

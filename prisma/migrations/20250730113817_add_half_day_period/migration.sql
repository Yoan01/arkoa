-- CreateEnum
CREATE TYPE "HalfDayPeriod" AS ENUM ('MORNING', 'AFTERNOON');

-- AlterTable
ALTER TABLE "leave" ADD COLUMN     "halfDayPeriod" "HalfDayPeriod";

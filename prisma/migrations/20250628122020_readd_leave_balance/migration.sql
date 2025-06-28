-- CreateTable
CREATE TABLE "leave_balance" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "type" "LeaveType" NOT NULL,
    "remainingDays" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_balance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leave_balance_membershipId_type_key" ON "leave_balance"("membershipId", "type");

-- AddForeignKey
ALTER TABLE "leave_balance" ADD CONSTRAINT "leave_balance_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

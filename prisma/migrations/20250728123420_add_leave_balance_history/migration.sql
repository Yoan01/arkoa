-- CreateTable
CREATE TABLE "leave_balance_history" (
    "id" TEXT NOT NULL,
    "leaveBalanceId" TEXT NOT NULL,
    "change" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leave_balance_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leave_balance_history_leaveBalanceId_idx" ON "leave_balance_history"("leaveBalanceId");

-- AddForeignKey
ALTER TABLE "leave_balance_history" ADD CONSTRAINT "leave_balance_history_leaveBalanceId_fkey" FOREIGN KEY ("leaveBalanceId") REFERENCES "leave_balance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balance_history" ADD CONSTRAINT "leave_balance_history_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

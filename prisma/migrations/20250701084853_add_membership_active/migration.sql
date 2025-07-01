-- AlterTable
ALTER TABLE "user" ADD COLUMN     "activeMembershipId" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_activeMembershipId_fkey" FOREIGN KEY ("activeMembershipId") REFERENCES "membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

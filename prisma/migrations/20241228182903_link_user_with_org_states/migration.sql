-- AlterTable
ALTER TABLE "OrganizationStates" ADD COLUMN     "user_id" TEXT;

-- AddForeignKey
ALTER TABLE "OrganizationStates" ADD CONSTRAINT "OrganizationStates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

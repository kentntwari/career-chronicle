/*
  Warnings:

  - A unique constraint covering the columns `[organization_id]` on the table `OrganizationStates` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_organizationStatesId_fkey";

-- AlterTable
ALTER TABLE "OrganizationStates" ADD COLUMN     "organization_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationStates_organization_id_key" ON "OrganizationStates"("organization_id");

-- AddForeignKey
ALTER TABLE "OrganizationStates" ADD CONSTRAINT "OrganizationStates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

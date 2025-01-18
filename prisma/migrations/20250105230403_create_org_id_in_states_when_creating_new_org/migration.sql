/*
  Warnings:

  - You are about to drop the column `organizationStatesId` on the `organization` table. All the data in the column will be lost.
  - Made the column `organization_id` on table `OrganizationStates` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "organization_organizationStatesId_key";

-- AlterTable
ALTER TABLE "OrganizationStates" ALTER COLUMN "organization_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "organizationStatesId";

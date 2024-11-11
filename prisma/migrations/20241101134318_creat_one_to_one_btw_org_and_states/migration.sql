/*
  Warnings:

  - A unique constraint covering the columns `[organizationStatesId]` on the table `organization` will be added. If there are existing duplicate values, this will fail.
  - Made the column `organizationStatesId` on table `organization` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "organization" ALTER COLUMN "organizationStatesId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "organization_organizationStatesId_key" ON "organization"("organizationStatesId");

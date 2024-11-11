-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "organizationStatesId" TEXT;

-- CreateTable
CREATE TABLE "OrganizationStates" (
    "id" TEXT NOT NULL,
    "first_position_created" BOOLEAN NOT NULL DEFAULT false,
    "first_achievement_created" BOOLEAN NOT NULL DEFAULT false,
    "first_failure_created" BOOLEAN NOT NULL DEFAULT false,
    "first_challenge_created" BOOLEAN NOT NULL DEFAULT false,
    "first_project_created" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrganizationStates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_organizationStatesId_fkey" FOREIGN KEY ("organizationStatesId") REFERENCES "OrganizationStates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `plan` on the `user` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE', 'PRO');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "plan",
ADD COLUMN     "plan_id" TEXT;

-- DropEnum
DROP TYPE "Plan";

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "tier" "Tier" NOT NULL DEFAULT 'FREE',
    "max_organizations" INTEGER NOT NULL DEFAULT 5,
    "max_positions" INTEGER NOT NULL DEFAULT 10,
    "max_achievements" INTEGER NOT NULL DEFAULT 20,
    "max_challenges" INTEGER NOT NULL DEFAULT 20,
    "max_projects" INTEGER NOT NULL DEFAULT 20,
    "max_failures" INTEGER NOT NULL DEFAULT 20,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_idx" ON "Plan"("id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

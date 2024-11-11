/*
  Warnings:

  - A unique constraint covering the columns `[tier]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "plan_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Plan_tier_key" ON "Plan"("tier");

-- CreateIndex
CREATE INDEX "plan_idx" ON "Plan"("tier");

-- DropIndex
DROP INDEX "plan_idx";

-- CreateIndex
CREATE INDEX "plan_idx" ON "Plan"("id", "tier");

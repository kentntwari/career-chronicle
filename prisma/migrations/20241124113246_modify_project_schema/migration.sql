/*
  Warnings:

  - You are about to drop the column `finished_at` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `started_at` on the `project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project" DROP COLUMN "finished_at",
DROP COLUMN "started_at",
ADD COLUMN     "month_finished_at" "Month",
ADD COLUMN     "month_started_at" "Month",
ADD COLUMN     "year_finished_at" INTEGER,
ADD COLUMN     "year_started_at" INTEGER;

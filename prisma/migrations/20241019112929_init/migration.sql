-- CreateEnum
CREATE TYPE "Month" AS ENUM ('JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "slug" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" VARCHAR(500),
    "organization_id" TEXT,
    "month_started_at" "Month" NOT NULL DEFAULT 'JANUARY',
    "year_started_at" INTEGER NOT NULL DEFAULT 1950,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" VARCHAR(1000),
    "position_id" TEXT,
    "month_occured_at" "Month",
    "year_occured_at" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failure" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" VARCHAR(1000),
    "position_id" TEXT,
    "month_occured_at" "Month",
    "year_occured_at" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "failure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" VARCHAR(1000),
    "is_achievement" BOOLEAN NOT NULL DEFAULT false,
    "is_failure" BOOLEAN NOT NULL DEFAULT false,
    "is_project" BOOLEAN NOT NULL DEFAULT false,
    "position_id" TEXT,
    "month_occured_at" "Month",
    "year_occured_at" INTEGER,
    "month_solved_at" "Month",
    "year_solved_at" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" VARCHAR(1000),
    "is_achievement" BOOLEAN NOT NULL DEFAULT false,
    "is_failure" BOOLEAN NOT NULL DEFAULT false,
    "position_id" TEXT,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_idx" ON "user"("id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE INDEX "organization_idx" ON "organization"("id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "position_slug_key" ON "position"("slug");

-- CreateIndex
CREATE INDEX "position_idx" ON "position"("id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_slug_key" ON "achievement"("slug");

-- CreateIndex
CREATE INDEX "achievement_idx" ON "achievement"("id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "failure_slug_key" ON "failure"("slug");

-- CreateIndex
CREATE INDEX "failure_idx" ON "failure"("id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "challenges_slug_key" ON "challenges"("slug");

-- CreateIndex
CREATE INDEX "challenge_idx" ON "challenges"("id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "project_slug_key" ON "project"("slug");

-- CreateIndex
CREATE INDEX "project_idx" ON "project"("id", "slug");

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position" ADD CONSTRAINT "position_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement" ADD CONSTRAINT "achievement_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "failure" ADD CONSTRAINT "failure_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

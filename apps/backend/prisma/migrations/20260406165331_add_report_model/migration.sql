-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "TriageStatus" AS ENUM ('PENDING', 'TRIAGED', 'FAILED');

-- CreateEnum
CREATE TYPE "AiUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "photoUrl" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'NEW',
    "triageStatus" "TriageStatus" NOT NULL DEFAULT 'PENDING',
    "aiCategory" TEXT,
    "aiUrgency" "AiUrgency",
    "aiConfidence" DOUBLE PRECISION,
    "aiReasoning" TEXT,
    "triagedAt" TIMESTAMP(3),
    "assignedUnit" TEXT,
    "assignedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

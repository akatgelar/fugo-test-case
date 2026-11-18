-- CreateEnum
CREATE TYPE "BudgetRange" AS ENUM ('under_10', 'from_10_25', 'from_25_50', 'from_50_100', 'above_100');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('branding', 'website', 'mobile_app', 'ai_automation', 'social_media', 'other');

-- CreateEnum
CREATE TYPE "AiPriority" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "AiStatus" AS ENUM ('pending', 'processing', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "PipelineStatus" AS ENUM ('new', 'contacted', 'proposal', 'won', 'lost');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('succeeded', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCredential" (
    "id" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brief" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "needDescription" TEXT NOT NULL,
    "budgetRange" "BudgetRange" NOT NULL,
    "targetTimeline" DATE NOT NULL,
    "pipelineStatus" "PipelineStatus" NOT NULL DEFAULT 'new',
    "aiStatus" "AiStatus" NOT NULL DEFAULT 'pending',
    "aiAttemptCount" INTEGER NOT NULL DEFAULT 0,
    "aiLastError" TEXT,
    "aiSummary" TEXT,
    "aiServiceCategory" "ServiceCategory",
    "aiPriority" "AiPriority",
    "aiPriorityReason" TEXT,
    "aiMissingInfo" JSONB,
    "aiModel" TEXT,
    "aiCredentialId" TEXT,
    "aiRawOutput" JSONB,
    "aiProcessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiRun" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "credentialId" TEXT,
    "attempt" INTEGER NOT NULL,
    "status" "RunStatus" NOT NULL,
    "model" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "error" TEXT,
    "rawOutput" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineEvent" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "fromStatus" "PipelineStatus",
    "toStatus" "PipelineStatus" NOT NULL,
    "changedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PipelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BriefNote" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BriefNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiCredential_baseUrl_model_key" ON "AiCredential"("baseUrl", "model");

-- CreateIndex
CREATE UNIQUE INDEX "Brief_ref_key" ON "Brief"("ref");

-- CreateIndex
CREATE INDEX "Brief_createdAt_idx" ON "Brief"("createdAt");

-- CreateIndex
CREATE INDEX "Brief_pipelineStatus_idx" ON "Brief"("pipelineStatus");

-- CreateIndex
CREATE INDEX "Brief_aiStatus_idx" ON "Brief"("aiStatus");

-- CreateIndex
CREATE INDEX "Brief_aiPriority_idx" ON "Brief"("aiPriority");

-- CreateIndex
CREATE INDEX "Brief_aiServiceCategory_idx" ON "Brief"("aiServiceCategory");

-- CreateIndex
CREATE INDEX "Brief_email_idx" ON "Brief"("email");

-- CreateIndex
CREATE INDEX "AiRun_briefId_createdAt_idx" ON "AiRun"("briefId", "createdAt");

-- CreateIndex
CREATE INDEX "PipelineEvent_briefId_createdAt_idx" ON "PipelineEvent"("briefId", "createdAt");

-- CreateIndex
CREATE INDEX "BriefNote_briefId_createdAt_idx" ON "BriefNote"("briefId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCredential" ADD CONSTRAINT "AiCredential_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRun" ADD CONSTRAINT "AiRun_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRun" ADD CONSTRAINT "AiRun_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "AiCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineEvent" ADD CONSTRAINT "PipelineEvent_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineEvent" ADD CONSTRAINT "PipelineEvent_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefNote" ADD CONSTRAINT "BriefNote_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefNote" ADD CONSTRAINT "BriefNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

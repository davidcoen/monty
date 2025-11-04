-- CreateEnum
CREATE TYPE "FlowKind" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "Indexing" AS ENUM ('NOMINAL', 'REAL');

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "years" INTEGER NOT NULL,
    "inflationAnnual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "seriesIndexing" "Indexing" NOT NULL DEFAULT 'NOMINAL',
    "netCashflowCents" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashFlow" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "kind" "FlowKind" NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT,
    "startYear" INTEGER NOT NULL,
    "indexing" "Indexing" NOT NULL DEFAULT 'NOMINAL',
    "amountCents" INTEGER[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CashFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationRun" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SimulationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CashFlow_scenarioId_kind_idx" ON "CashFlow"("scenarioId", "kind");

-- CreateIndex
CREATE INDEX "CashFlow_scenarioId_startYear_idx" ON "CashFlow"("scenarioId", "startYear");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "CashFlow" ADD CONSTRAINT "CashFlow_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationRun" ADD CONSTRAINT "SimulationRun_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

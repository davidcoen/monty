import { FlowKind, Indexing as PrismaIndexing } from '@prisma/client'

import {
  CashFlowLite,
  Indexing as KernelIndexing,
  resolveNetCents,
  resolveSideTotals,
} from '@monty/lib/plan'

const PREVIEW_INDEXING: KernelIndexing = 'REAL'

export type ScenarioPreviewInput = {
  startYear: number
  years: number
  inflationAnnual: number
  cashFlows: {
    kind: FlowKind
    amountCents: number[]
    startYear: number
    indexing: PrismaIndexing
  }[]
}

export type ScenarioPreview = {
  incomes: number[]
  expenses: number[]
  net: number[]
}

function toKernel(indexing: PrismaIndexing): KernelIndexing {
  return indexing
}

function toCashFlowLite(flow: {
  amountCents: number[]
  startYear: number
  indexing: PrismaIndexing
}): CashFlowLite {
  return {
    amountCents: flow.amountCents,
    startYear: flow.startYear,
    indexing: toKernel(flow.indexing),
  }
}

export function buildScenarioPreview(input: ScenarioPreviewInput): ScenarioPreview {
  const incomes = input.cashFlows
    .filter(flow => flow.kind === FlowKind.INCOME)
    .map(toCashFlowLite)
  const expenses = input.cashFlows
    .filter(flow => flow.kind === FlowKind.EXPENSE)
    .map(toCashFlowLite)

  const incomesTotal = resolveSideTotals(
    incomes,
    input.startYear,
    input.years,
    input.inflationAnnual,
    PREVIEW_INDEXING
  )
  const expensesTotal = resolveSideTotals(
    expenses,
    input.startYear,
    input.years,
    input.inflationAnnual,
    PREVIEW_INDEXING
  )
  const net = resolveNetCents(
    incomes,
    expenses,
    input.startYear,
    input.years,
    input.inflationAnnual,
    PREVIEW_INDEXING
  )

  return { incomes: incomesTotal, expenses: expensesTotal, net }
}

export { PREVIEW_INDEXING }

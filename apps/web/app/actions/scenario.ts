'use server'

import { revalidatePath } from 'next/cache'
import { FlowKind, Indexing as PrismaIndexing } from '@prisma/client'

import { prisma } from '@/packages/db/client'
import { parseDollarsToCents } from '@monty/lib/plan'

import { buildScenarioPreview } from '../scenario/preview'

type ActionState = {
  ok: boolean
  error?: string
}

const REVALIDATE_PATH = '/scenario'

async function recomputeScenarioNet(scenarioId: string) {
  const scenario = await prisma.scenario.findUnique({
    where: { id: scenarioId },
    include: { cashFlows: true },
  })
  if (!scenario) {
    throw new Error('Scenario not found')
  }

  const preview = buildScenarioPreview(scenario)

  await prisma.scenario.update({
    where: { id: scenarioId },
    data: { netCashflowCents: preview.net },
  })
  return preview
}

export async function ensureDefaultScenario() {
  const existing = await prisma.scenario.findFirst({
    orderBy: { createdAt: 'asc' },
  })
  if (existing) return existing

  const created = await prisma.scenario.create({
    data: {
      name: 'Default Scenario',
      startYear: new Date().getFullYear(),
      years: 40,
      inflationAnnual: 0.02,
    },
  })
  await recomputeScenarioNet(created.id)
  return created
}

export async function saveScenarioAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const scenarioId = formData.get('scenarioId')?.toString()
    const name = formData.get('name')?.toString().trim() ?? ''
    const startYear = Number(formData.get('startYear'))
    const years = Number(formData.get('years'))
    const inflationAnnual = Number(formData.get('inflationAnnual') ?? 0)
    const seriesIndexing =
      formData.get('seriesIndexing')?.toString() === PrismaIndexing.REAL
        ? PrismaIndexing.REAL
        : PrismaIndexing.NOMINAL

    if (!name) throw new Error('Scenario name is required')
    if (!Number.isInteger(startYear) || startYear < 0) {
      throw new Error('Start year must be a positive integer')
    }
    if (!Number.isInteger(years) || years <= 0) {
      throw new Error('Years must be a positive integer')
    }
    if (!Number.isFinite(inflationAnnual) || inflationAnnual < 0) {
      throw new Error('Inflation must be zero or a positive number')
    }

    const data = {
      name,
      startYear,
      years,
      inflationAnnual,
      seriesIndexing,
    }

    const scenario = scenarioId
      ? await prisma.scenario.update({ where: { id: scenarioId }, data })
      : await prisma.scenario.create({ data })

    await recomputeScenarioNet(scenario.id)
    revalidatePath(REVALIDATE_PATH)

    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save scenario'
    return { ok: false, error: message }
  }
}

export async function saveCashFlowAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const cashFlowId = formData.get('cashFlowId')?.toString() ?? undefined
    const scenarioId = formData.get('scenarioId')?.toString()
    const label = formData.get('label')?.toString().trim() ?? ''
    const category = formData.get('category')?.toString().trim() || undefined
    const kindInput = formData.get('kind')?.toString() ?? FlowKind.INCOME
    const indexingInput = formData.get('indexing')?.toString() ?? PrismaIndexing.NOMINAL
    const startYear = Number(formData.get('startYear'))
    const amountRaw = formData.get('amountSeries')?.toString() ?? ''

    if (!scenarioId) throw new Error('Scenario is required')
    if (!label) throw new Error('Label is required')
    if (!Number.isInteger(startYear)) throw new Error('Start year must be an integer')

    const scenario = await prisma.scenario.findUnique({ where: { id: scenarioId } })
    if (!scenario) throw new Error('Scenario not found')
    if (startYear < scenario.startYear) {
      throw new Error('Cashflow start year cannot be before the scenario start year')
    }

    const amountCents = parseDollarsToCents(amountRaw)
    if (amountCents.length === 0) {
      throw new Error('Enter at least one yearly amount')
    }

    const kind =
      kindInput === FlowKind.EXPENSE ? FlowKind.EXPENSE : FlowKind.INCOME
    const indexing =
      indexingInput === PrismaIndexing.REAL ? PrismaIndexing.REAL : PrismaIndexing.NOMINAL

    let order: number
    if (cashFlowId) {
      const existing = await prisma.cashFlow.findUnique({
        where: { id: cashFlowId },
        select: { order: true },
      })
      order = existing?.order ?? 0
    } else {
      const maxOrder = await prisma.cashFlow.aggregate({
        where: { scenarioId },
        _max: { order: true },
      })
      order = (maxOrder._max.order ?? -1) + 1
    }

    const data = {
      scenarioId,
      label,
      category,
      kind,
      startYear,
      indexing,
      amountCents,
      order,
    }

    if (cashFlowId) {
      await prisma.cashFlow.update({ where: { id: cashFlowId }, data })
    } else {
      await prisma.cashFlow.create({ data })
    }

    await recomputeScenarioNet(scenarioId)
    revalidatePath(REVALIDATE_PATH)

    return { ok: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to save the cashflow row'
    return { ok: false, error: message }
  }
}

export async function deleteCashFlowAction(
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const cashFlowId = formData.get('cashFlowId')?.toString()
    const scenarioId = formData.get('scenarioId')?.toString()
    if (!cashFlowId || !scenarioId) {
      throw new Error('Missing cashflow identifier')
    }

    await prisma.cashFlow.delete({ where: { id: cashFlowId } })
    await recomputeScenarioNet(scenarioId)
    revalidatePath(REVALIDATE_PATH)

    return { ok: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to delete the cashflow row'
    return { ok: false, error: message }
  }
}

export type { ActionState }

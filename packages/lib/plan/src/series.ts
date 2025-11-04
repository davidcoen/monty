/**
 * Utilities for working with yearly cashflow series stored in cents.
 */

export function parseDollarsToCents(text: string): number[] {
  return text
    .split(/[, \t\r\n]+/)
    .map(token => token.trim())
    .filter(Boolean)
    .map(token => token.replace(/^\$/, ''))
    .map(token => {
      const value = Number(token)
      if (!Number.isFinite(value)) {
        throw new Error(`Invalid cashflow value: ${token}`)
      }
      return Math.round(value * 100)
    })
}

export function placeSeriesByStartYear(
  series: number[],
  scenarioStartYear: number,
  horizonYears: number,
  startYear: number
): number[] {
  if (!Number.isInteger(startYear)) {
    throw new Error('startYear must be an integer')
  }
  if (startYear < scenarioStartYear) {
    throw new Error('startYear cannot be before the scenario start year')
  }

  const result = Array(horizonYears).fill(0)
  for (let index = 0; index < series.length; index += 1) {
    const year = startYear + index
    const offset = year - scenarioStartYear
    if (offset >= horizonYears) break
    result[offset] = series[index]
  }
  return result
}

export function centsNominalToReal(arrCents: number[], inflation: number): number[] {
  return arrCents.map((amount, yearIndex) => {
    const inflationFactor = Math.pow(1 + inflation, yearIndex)
    return inflationFactor === 0 ? amount : Math.round(amount / inflationFactor)
  })
}

export function centsRealToNominal(arrCents: number[], inflation: number): number[] {
  return arrCents.map((amount, yearIndex) =>
    Math.round(amount * Math.pow(1 + inflation, yearIndex))
  )
}

export type Indexing = 'NOMINAL' | 'REAL'

export type CashFlowLite = {
  amountCents: number[]
  startYear: number
  indexing: Indexing
}

function sumCashflowSide(
  flows: CashFlowLite[],
  scenarioStartYear: number,
  horizonYears: number,
  inflation: number,
  targetIndexing: Indexing
): number[] {
  const totals = Array(horizonYears).fill(0)
  for (const flow of flows) {
    const placed = placeSeriesByStartYear(
      flow.amountCents,
      scenarioStartYear,
      horizonYears,
      flow.startYear
    )
    const coerced =
      flow.indexing === targetIndexing
        ? placed
        : targetIndexing === 'REAL'
        ? centsNominalToReal(placed, inflation)
        : centsRealToNominal(placed, inflation)
    for (let i = 0; i < horizonYears; i += 1) {
      totals[i] += coerced[i]
    }
  }
  return totals
}

export function resolveNetCents(
  incomes: CashFlowLite[],
  expenses: CashFlowLite[],
  scenarioStartYear: number,
  horizonYears: number,
  inflation: number,
  kernelWants: Indexing
): number[] {
  const incomeTotals = sumCashflowSide(
    incomes,
    scenarioStartYear,
    horizonYears,
    inflation,
    kernelWants
  )
  const expenseTotals = sumCashflowSide(
    expenses,
    scenarioStartYear,
    horizonYears,
    inflation,
    kernelWants
  )

  return incomeTotals.map((value, index) => value - expenseTotals[index])
}

export function resolveSideTotals(
  flows: CashFlowLite[],
  scenarioStartYear: number,
  horizonYears: number,
  inflation: number,
  kernelWants: Indexing
): number[] {
  return sumCashflowSide(flows, scenarioStartYear, horizonYears, inflation, kernelWants)
}

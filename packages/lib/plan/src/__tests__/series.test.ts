import { describe, expect, it } from 'vitest'

import {
  CashFlowLite,
  Indexing,
  centsNominalToReal,
  centsRealToNominal,
  parseDollarsToCents,
  placeSeriesByStartYear,
  resolveNetCents,
  resolveSideTotals,
} from '../series'

describe('parseDollarsToCents', () => {
  it('parses whitespace and commas and rounds to the nearest cent', () => {
    const cents = parseDollarsToCents('1000  1000.345, $1000.995')
    expect(cents).toEqual([100000, 100035, 100100])
  })
})

describe('placeSeriesByStartYear', () => {
  const scenarioStartYear = 2025
  const horizonYears = 5

  it('places a series using calendar start year within the scenario horizon', () => {
    const result = placeSeriesByStartYear([1, 2, 3], scenarioStartYear, horizonYears, 2027)
    expect(result).toEqual([0, 0, 1, 2, 3])
  })

  it('clips values that would fall beyond the scenario horizon', () => {
    const result = placeSeriesByStartYear([1, 2, 3], scenarioStartYear, horizonYears, 2028)
    expect(result).toEqual([0, 0, 0, 1, 2])
  })

  it('throws when start year precedes the scenario start year', () => {
    expect(() =>
      placeSeriesByStartYear([1, 2], scenarioStartYear, horizonYears, 2024)
    ).toThrow(/start year/i)
  })
})

describe('indexing conversions', () => {
  it('converts nominal cents to real cents per year', () => {
    const nominal = [10000, 10200, 10404]
    const result = centsNominalToReal(nominal, 0.02)
    expect(result).toEqual([10000, 10000, 10000])
  })

  it('converts real cents to nominal cents per year', () => {
    const real = [10000, 10000, 10000]
    const result = centsRealToNominal(real, 0.02)
    expect(result).toEqual([10000, 10200, 10404])
  })
})

describe('resolveNetCents', () => {
  const scenarioStartYear = 2025
  const horizonYears = 4
  const inflation = 0.03
  const kernel: Indexing = 'REAL'

  const salaries: CashFlowLite = {
    amountCents: [100_000, 102_000, 104_040],
    startYear: 2025,
    indexing: 'NOMINAL',
  }
  const groceries: CashFlowLite = {
    amountCents: [30_000, 30_900, 31_827],
    startYear: 2025,
    indexing: 'NOMINAL',
  }
  const rent: CashFlowLite = {
    amountCents: [40_000, 40_000, 40_000],
    startYear: 2026,
    indexing: 'REAL',
  }

  it('coerces mixed indexing and aligns series before summing net', () => {
    const net = resolveNetCents(
      [salaries],
      [groceries, rent],
      scenarioStartYear,
      horizonYears,
      inflation,
      kernel
    )
    const incomeTotals = resolveSideTotals(
      [salaries],
      scenarioStartYear,
      horizonYears,
      inflation,
      kernel
    )
    const expenseTotals = resolveSideTotals(
      [groceries, rent],
      scenarioStartYear,
      horizonYears,
      inflation,
      kernel
    )

    expect(incomeTotals).toEqual([100000, 99029, 98068, 0])
    expect(expenseTotals).toEqual([30000, 70000, 70000, 40000])
    expect(net).toEqual([70000, 29029, 28068, -40000])
  })
})

import { FlowKind, Indexing as PrismaIndexing } from '@prisma/client'

import { prisma } from '@/packages/db/client'

import { ensureDefaultScenario } from '../actions/scenario'
import { ExistingCashFlowForm, NewCashFlowForm, ScenarioMetaForm } from './forms'
import { buildScenarioPreview, PREVIEW_INDEXING } from './preview'

type CashFlowDisplay = {
  id: string
  label: string
  category?: string | null
  kind: FlowKind
  indexing: PrismaIndexing
  startYear: number
  amountSeriesText: string
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

function formatSeriesForTextarea(cents: number[]): string {
  return cents
    .map(value => {
      const dollars = (value ?? 0) / 100
      const formatted = dollars.toFixed(2)
      return formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted
    })
    .join(', ')
}

function formatCents(cents: number): string {
  return currency.format(cents / 100)
}

async function loadScenario() {
  const scenario = await ensureDefaultScenario()
  const fullScenario = await prisma.scenario.findUnique({
    where: { id: scenario.id },
    include: { cashFlows: { orderBy: { order: 'asc' } } },
  })
  if (!fullScenario) {
    throw new Error('Scenario record not found after initialization')
  }
  return fullScenario
}

export default async function ScenarioPage() {
  const scenario = await loadScenario()
  const preview = buildScenarioPreview(scenario)

  const flows: CashFlowDisplay[] = scenario.cashFlows.map(flow => ({
    id: flow.id,
    label: flow.label,
    category: flow.category,
    kind: flow.kind,
    indexing: flow.indexing,
    startYear: flow.startYear,
    amountSeriesText: formatSeriesForTextarea(flow.amountCents),
  }))

  const previewYears = Array.from(
    { length: Math.min(10, scenario.years) },
    (_, index) => {
      const year = scenario.startYear + index
      return {
        year,
        income: preview.incomes[index] ?? 0,
        expense: preview.expenses[index] ?? 0,
        net: preview.net[index] ?? 0,
      }
    }
  )

  return (
    <main style={{ padding: 32, display: 'grid', gap: 24 }}>
      <header style={{ display: 'grid', gap: 8 }}>
        <h1 style={{ margin: 0 }}>Scenario cashflows</h1>
        <p style={{ margin: 0, color: '#444' }}>
          Yearly series are stored in cents. Net preview is rendered in {PREVIEW_INDEXING} dollars.
        </p>
      </header>

      <section style={{ display: 'grid', gap: 16 }}>
        <h2 style={{ marginBottom: 0 }}>Scenario settings</h2>
        <ScenarioMetaForm scenario={scenario} />
      </section>

      <section style={{ display: 'grid', gap: 16 }}>
        <h2 style={{ marginBottom: 0 }}>Cashflow rows</h2>
        <p style={{ margin: 0, color: '#555' }}>
          Paste yearly amounts in dollars (comma or whitespace separated). Start year must be {scenario.startYear} or later.
        </p>
        <NewCashFlowForm
          scenarioId={scenario.id}
          scenarioStartYear={scenario.startYear}
        />
        <div style={{ display: 'grid', gap: 12 }}>
          {flows.map(flow => (
            <ExistingCashFlowForm
              key={flow.id}
              scenarioId={scenario.id}
              scenarioStartYear={scenario.startYear}
              flow={flow}
            />
          ))}
          {flows.length === 0 && (
            <p style={{ color: '#777', marginTop: 8 }}>
              No cashflows yet. Add your first row above.
            </p>
          )}
        </div>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ marginBottom: 0 }}>Preview (first 10 years)</h2>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            maxWidth: 720,
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px 6px' }}>
                Year
              </th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #ccc', padding: '8px 6px' }}>
                Income (Real)
              </th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #ccc', padding: '8px 6px' }}>
                Expense (Real)
              </th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #ccc', padding: '8px 6px' }}>
                Net (Real)
              </th>
            </tr>
          </thead>
          <tbody>
            {previewYears.map(row => (
              <tr key={row.year}>
                <td style={{ padding: '6px 6px', borderBottom: '1px solid #eee' }}>
                  {row.year}
                </td>
                <td style={{ padding: '6px 6px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  {formatCents(row.income)}
                </td>
                <td style={{ padding: '6px 6px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  {formatCents(row.expense)}
                </td>
                <td style={{ padding: '6px 6px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  {formatCents(row.net)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}

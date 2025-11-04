'use client'

import { useFormState, useFormStatus } from 'react-dom'
import type { FlowKind, Indexing as PrismaIndexing } from '@prisma/client'

import {
  deleteCashFlowAction,
  saveCashFlowAction,
  saveScenarioAction,
  type ActionState,
} from '../actions/scenario'

const initialState: ActionState = { ok: true }

type ScenarioMeta = {
  id: string
  name: string
  startYear: number
  years: number
  inflationAnnual: number
  seriesIndexing: PrismaIndexing
}

type CashFlowRow = {
  id: string
  label: string
  category?: string | null
  kind: FlowKind
  indexing: PrismaIndexing
  startYear: number
  amountSeriesText: string
}

type SelectOption<TValue extends string> = {
  value: TValue
  label: string
}

const kindOptions: SelectOption<FlowKind>[] = [
  { value: 'INCOME', label: 'Income' },
  { value: 'EXPENSE', label: 'Expense' },
]

const indexingOptions: SelectOption<PrismaIndexing>[] = [
  { value: 'NOMINAL', label: 'Nominal' },
  { value: 'REAL', label: 'Real' },
]

function ActionError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p style={{ color: '#a60000', marginTop: 8, fontSize: 13 }}>
      {message}
    </p>
  )
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} style={{ padding: '6px 14px' }}>
      {pending ? 'Saving…' : children}
    </button>
  )
}

function DeleteButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      style={{ padding: '6px 12px', color: '#a60000', borderColor: '#a60000' }}
    >
      {pending ? 'Deleting…' : children}
    </button>
  )
}

export function ScenarioMetaForm({ scenario }: { scenario: ScenarioMeta }) {
  const [state, formAction] = useFormState(saveScenarioAction, initialState)

  return (
    <form
      action={formAction}
      style={{
        display: 'grid',
        gap: 12,
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 8,
        maxWidth: 400,
        background: '#fafafa',
      }}
    >
      <input type="hidden" name="scenarioId" value={scenario.id} />
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Name</span>
        <input type="text" name="name" defaultValue={scenario.name} required />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Start Year</span>
        <input
          type="number"
          name="startYear"
          min={0}
          step={1}
          defaultValue={scenario.startYear}
          required
        />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Years</span>
        <input
          type="number"
          name="years"
          min={1}
          step={1}
          defaultValue={scenario.years}
          required
        />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Inflation (decimal)</span>
        <input
          type="number"
          name="inflationAnnual"
          step="0.001"
          min={0}
          defaultValue={scenario.inflationAnnual}
        />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Series Indexing</span>
        <select
          name="seriesIndexing"
          defaultValue={scenario.seriesIndexing}
          style={{ padding: 6 }}
        >
          {indexingOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton>Save Scenario</SubmitButton>
      <ActionError message={state.ok ? undefined : state.error} />
    </form>
  )
}

export function ExistingCashFlowForm({
  scenarioId,
  scenarioStartYear,
  flow,
}: {
  scenarioId: string
  scenarioStartYear: number
  flow: CashFlowRow
}) {
  const [state, formAction] = useFormState(saveCashFlowAction, initialState)
  const [deleteState, deleteAction] = useFormState(deleteCashFlowAction, initialState)

  return (
    <div
      style={{
        display: 'grid',
        gap: 8,
        border: '1px solid #eee',
        borderRadius: 8,
        padding: 12,
      }}
    >
      <form
        action={formAction}
        style={{ display: 'grid', gap: 8 }}
      >
        <input type="hidden" name="scenarioId" value={scenarioId} />
        <input type="hidden" name="cashFlowId" value={flow.id} />
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Label</span>
          <input type="text" name="label" defaultValue={flow.label} required />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Category</span>
          <input type="text" name="category" defaultValue={flow.category ?? ''} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Kind</span>
          <select name="kind" defaultValue={flow.kind} style={{ padding: 6 }}>
            {kindOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Indexing</span>
          <select
            name="indexing"
            defaultValue={flow.indexing}
            style={{ padding: 6 }}
          >
            {indexingOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Start Year</span>
          <input
            type="number"
            name="startYear"
            min={scenarioStartYear}
            step={1}
            defaultValue={flow.startYear}
            required
          />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Yearly Amounts (dollars)</span>
          <textarea
            name="amountSeries"
            rows={3}
            defaultValue={flow.amountSeriesText}
            required
          />
        </label>
        <SubmitButton>Save Row</SubmitButton>
        <ActionError message={state.ok ? undefined : state.error} />
      </form>
      <form
        action={deleteAction}
        style={{ display: 'flex', justifyContent: 'flex-end' }}
      >
        <input type="hidden" name="cashFlowId" value={flow.id} />
        <input type="hidden" name="scenarioId" value={scenarioId} />
        <DeleteButton>Delete</DeleteButton>
      </form>
      <ActionError message={deleteState.ok ? undefined : deleteState.error} />
    </div>
  )
}

export function NewCashFlowForm({
  scenarioId,
  scenarioStartYear,
}: {
  scenarioId: string
  scenarioStartYear: number
}) {
  const [state, formAction] = useFormState(saveCashFlowAction, initialState)

  return (
    <form
      action={formAction}
      style={{
        display: 'grid',
        gap: 8,
        border: '1px dashed #ccc',
        borderRadius: 8,
        padding: 12,
      }}
    >
      <input type="hidden" name="scenarioId" value={scenarioId} />
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Label</span>
        <input type="text" name="label" placeholder="Salary" required />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Category</span>
        <input type="text" name="category" placeholder="Work" />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Kind</span>
        <select name="kind" defaultValue="INCOME" style={{ padding: 6 }}>
          {kindOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Indexing</span>
        <select name="indexing" defaultValue="NOMINAL" style={{ padding: 6 }}>
          {indexingOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Start Year</span>
        <input
          type="number"
          name="startYear"
          min={scenarioStartYear}
          step={1}
          defaultValue={scenarioStartYear}
          required
        />
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span>Yearly Amounts (dollars)</span>
        <textarea
          name="amountSeries"
          rows={3}
          placeholder="150000, 155000, 160000"
          required
        />
      </label>
      <SubmitButton>Add Cashflow</SubmitButton>
      <ActionError message={state.ok ? undefined : state.error} />
    </form>
  )
}

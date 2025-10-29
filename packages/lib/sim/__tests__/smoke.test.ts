import { describe, it, expect } from 'vitest'
import { runMonteCarloPlaceholder } from '../src'

describe('sim smoke', () => {
  it('runs placeholder', () => {
    const r = runMonteCarloPlaceholder()
    expect(r).toHaveProperty('runs')
  })
})

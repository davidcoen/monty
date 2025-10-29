import { test, expect } from '@playwright/test'

test('health endpoint returns ok', async ({ request }) => {
  const res = await request.get('http://localhost:3000/api/health')
  const json = await res.json()
  expect(json).toEqual({ ok: true })
})

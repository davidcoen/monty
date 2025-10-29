import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  LOG_LEVEL: z.string().optional()
})

export const env = envSchema.parse(process.env)

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVELS: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }

const current: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

export const logger = {
  debug: (...args: unknown[]) => {
    if (LEVELS[current] <= LEVELS.debug) console.debug('[debug]', ...args)
  },
  info: (...args: unknown[]) => {
    if (LEVELS[current] <= LEVELS.info) console.info('[info]', ...args)
  },
  warn: (...args: unknown[]) => {
    if (LEVELS[current] <= LEVELS.warn) console.warn('[warn]', ...args)
  },
  error: (...args: unknown[]) => {
    if (LEVELS[current] <= LEVELS.error) console.error('[error]', ...args)
  }
}

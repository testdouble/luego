import type { PositiveInt } from './types'
import { UnsafeError, UnsafeNumberError } from './errors'

export function validateHaveLimit(limit: PositiveInt | null): void {
  if (limit == null) {
    throw new UnsafeError()
  }
}

export function validateLimit(n: number): PositiveInt {
  if (!Number.isSafeInteger(n) || n <= 0) {
    throw new UnsafeNumberError(n)
  }

  return n as PositiveInt
}

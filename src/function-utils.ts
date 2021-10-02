import { PredicateFunction } from './types'

export const not =
  <T>(f: PredicateFunction<T>): PredicateFunction<T> =>
  (value: T) =>
    !f(value)

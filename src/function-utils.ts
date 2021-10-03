import { PredicateF } from './types'

export const not =
  <T>(f: PredicateF<T>): PredicateF<T> =>
  (value: T) =>
    !f(value)

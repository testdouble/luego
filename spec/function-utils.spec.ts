import { not } from '../src/function-utils'

describe('function-utils', () => {
  describe('not', () => {
    it('inverts a predicate function', () => {
      const is42 = (value: number): boolean => value === 42

      const result = not(is42)

      expect(result(42)).toBe(false)
      expect(result(41)).toBe(true)
    })
  })
})

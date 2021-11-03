import {
  keep,
  map,
  reject,
  take,
  takeUntil,
  takeWhile,
} from 'src/sync/operators'
import { pipe } from 'src/utils'
import { UnsafeNumberError } from 'src/shared/errors'
import { double, gt, lt, syncNumbersStream, toString } from 'spec/utils'

describe('sync operators', () => {
  describe('map', () => {
    it('transforms the values in a sync stream', () => {
      const stream = syncNumbersStream.take(5)

      const result = map(double, stream)

      expect(result.toArray()).toEqual([2, 4, 6, 8, 10])
    })
  })

  describe('keep', () => {
    it('keeps values that return true for the provided function for sync streams', () => {
      const stream = syncNumbersStream.take(5)

      const result = keep(gt(10), stream)

      expect(result.toArray()).toEqual([11, 12, 13, 14, 15])
    })
  })

  describe('reject', () => {
    it('rejects values that return true for the provided function for sync streams', () => {
      const stream = syncNumbersStream.take(5)

      const result = reject(lt(5), stream)

      expect(result.toArray()).toEqual([5, 6, 7, 8, 9])
    })
  })

  describe('take', () => {
    it('limits values for sync streams', () => {
      const result = take(5, syncNumbersStream)

      expect(result.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('throws an error if limit is not safe integer', () => {
      expect(() => {
        take(Math.PI, syncNumbersStream)
      }).toThrow(UnsafeNumberError)
    })

    it('throws an error if limit is 0', () => {
      expect(() => {
        take(0, syncNumbersStream)
      }).toThrow(UnsafeNumberError)
    })

    it('throws an error if limit is < 0', () => {
      expect(() => {
        take(-1, syncNumbersStream)
      }).toThrow(UnsafeNumberError)
    })
  })

  describe('takeWhile', () => {
    it('takes values whiel function returns true for sync streams', () => {
      const stream = take(10, syncNumbersStream)

      const result = takeWhile(lt(6), stream)

      expect(result.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('takeUntil', () => {
    it('takes values until function returns true for sync streams', () => {
      const stream = take(10, syncNumbersStream)

      const result = takeUntil(gt(5), stream)

      expect(result.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('stacking operations', () => {
    const operation = pipe(
      map(double),
      keep(gt(10)),
      reject(gt(20)),
      take(2),
      map(toString),
    )

    it('can stack operations for sync streams', () => {
      const result = operation(syncNumbersStream)

      expect(result.toArray()).toEqual(['12', '14'])
    })
  })
})

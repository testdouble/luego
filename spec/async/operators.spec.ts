import {
  keep,
  map,
  reject,
  take,
  takeUntil,
  takeWhile,
} from 'src/async/operators'
import { pipe } from 'src/utils'
import { UnsafeNumberError } from 'src/shared/errors'
import { asyncNumbersStream, double, gt, lt, toString } from 'spec/utils'

describe('async operators', () => {
  describe('map', () => {
    it('transforms the values in an async stream', async () => {
      const stream = asyncNumbersStream.take(5)

      const result = map(double, stream)

      expect(await result.toArray()).toEqual([2, 4, 6, 8, 10])
    })
  })

  describe('keep', () => {
    it('keeps values that return true for the provided function for async streams', async () => {
      const stream = asyncNumbersStream.take(5)

      const result = keep(gt(10), stream)

      expect(await result.toArray()).toEqual([11, 12, 13, 14, 15])
    })
  })

  describe('reject', () => {
    it('rejects values that return true for the provided function for async streams', async () => {
      const stream = asyncNumbersStream.take(5)

      const result = reject(lt(5), stream)

      expect(await result.toArray()).toEqual([5, 6, 7, 8, 9])
    })
  })

  describe('take', () => {
    it('limits values for async streams', async () => {
      const result = take(5, asyncNumbersStream)

      expect(await result.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('throws an error if limit is not safe integer', () => {
      expect(() => {
        take(Math.PI, asyncNumbersStream)
      }).toThrow(UnsafeNumberError)
    })

    it('throws an error if limit is 0', () => {
      expect(() => {
        take(0, asyncNumbersStream)
      }).toThrow(UnsafeNumberError)
    })

    it('throws an error if limit is < 0', () => {
      expect(() => {
        take(-1, asyncNumbersStream)
      }).toThrow(UnsafeNumberError)
    })
  })

  describe('takeWhile', () => {
    it('takes values while function returns true for async streams', async () => {
      const stream = take(10, asyncNumbersStream)

      const result = takeWhile(lt(6), stream)

      expect(await result.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('takeUntil', () => {
    it('takes values until function returns true for async streams', async () => {
      const stream = take(10, asyncNumbersStream)

      const result = takeUntil(gt(5), stream)

      expect(await result.toArray()).toEqual([1, 2, 3, 4, 5])
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

    it('can stack operations for async streams', async () => {
      const result = operation(asyncNumbersStream)

      expect(await result.toArray()).toEqual(['12', '14'])
    })
  })
})

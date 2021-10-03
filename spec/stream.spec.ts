import {
  UnsafeNumberError,
  fromArray,
  keep,
  map,
  pipe,
  reject,
  sequence,
  take,
  takeUntil,
  takeWhile,
  toArray,
  unsafeToArray,
} from '../src'

const increment = (x: number): number => x + 1
const double = (x: number): number => x * 2
const gt = (x: number) => (y: number) => y > x
const lt = (x: number) => (y: number) => y < x
const toString = (x: number) => x.toString()

const numbersStream = sequence(1, increment)

describe('Stream', () => {
  describe('.sequence', () => {
    it('creates an infinite sequence', () => {
      const result = toArray(take(5, numbersStream))

      expect(result).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('.fromArray', () => {
    it('creates a stream from an array, limiting to the length of the array', () => {
      const arrayLength = 10
      const array = Array.from(
        { length: arrayLength },
        (_, i) => arrayLength - 1 - i,
      )
      const stream = fromArray(array)

      const result = toArray(stream)

      expect(result).toEqual(array)
    })
  })

  describe('.map', () => {
    it('transforms the values in the stream', () => {
      const stream = map(double, numbersStream)

      const result = toArray(take(5, stream))

      expect(result).toEqual([2, 4, 6, 8, 10])
    })
  })

  describe('.keep', () => {
    it('keeps values that return true for the provided function', () => {
      const stream = keep(gt(10), numbersStream)

      const result = toArray(take(5, stream))

      expect(result).toEqual([11, 12, 13, 14, 15])
    })
  })

  describe('.reject', () => {
    it('rejects values that return true for the provided function', () => {
      const stream = reject(lt(5), numbersStream)

      const result = toArray(take(5, stream))

      expect(result).toEqual([5, 6, 7, 8, 9])
    })
  })

  describe('.takeWhile', () => {
    it('takes values while function returns true', () => {
      const stream = takeWhile(lt(10), numbersStream)

      const result = unsafeToArray(stream)

      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('.takeUntil', () => {
    it('takes values until function returns true', () => {
      const stream = takeUntil(gt(4), numbersStream)

      const result = unsafeToArray(stream)

      expect(result).toEqual([1, 2, 3, 4])
    })
  })

  describe('.take', () => {
    it('throws an error with unsafe numbers', () => {
      const unsafeNumbers = [Infinity, Math.PI, 3.0001]

      for (const number of unsafeNumbers) {
        expect(() => {
          take(number, numbersStream)
        }).toThrowError(UnsafeNumberError)
      }
    })

    it('accepts integers and floating point numbers with no significant decimal digits', () => {
      // prettier-ignore
      const safeNumbers = [2, 2.0, 2.00, 2.000]

      for (const number of safeNumbers) {
        expect(() => {
          take(number, numbersStream)
        }).not.toThrowError()
      }
    })
  })

  describe('stacking operations', () => {
    it('can stack operations', () => {
      const stream = pipe(
        map(double),
        keep(gt(10)),
        reject(gt(20)),
        take(2),
        map(toString),
      )(numbersStream)

      const result = toArray(stream)

      expect(result).toEqual(['12', '14'])
    })
  })
})

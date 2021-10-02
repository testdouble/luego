import * as Stream from '../src/stream'

const increment = (x: number): number => x + 1
const double = (x: number): number => x * 2
const gt = (x: number) => (y: number) => y > x
const lt = (x: number) => (y: number) => y < x
const toString = (x: number) => x.toString()

const numbersStream = Stream.sequence(1, increment)

describe('Stream', () => {
  describe('.sequence', () => {
    it('creates an infinite sequence', () => {
      const result = Stream.toArray(Stream.take(5, numbersStream))

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
      const stream = Stream.fromArray(array)

      const result = Stream.toArray(stream)

      expect(result).toEqual(array)
    })
  })

  describe('.map', () => {
    it('transforms the values in the stream', () => {
      const stream = Stream.map(double, numbersStream)

      const result = Stream.toArray(Stream.take(5, stream))

      expect(result).toEqual([2, 4, 6, 8, 10])
    })
  })

  describe('.keep', () => {
    it('keeps values that return true for the provided function', () => {
      const stream = Stream.keep(gt(10), numbersStream)

      const result = Stream.toArray(Stream.take(5, stream))

      expect(result).toEqual([11, 12, 13, 14, 15])
    })
  })

  describe('.reject', () => {
    it('rejects values that return true for the provided function', () => {
      const stream = Stream.reject(lt(5), numbersStream)

      const result = Stream.toArray(Stream.take(5, stream))

      expect(result).toEqual([5, 6, 7, 8, 9])
    })
  })

  describe('.takeWhile', () => {
    it('takes values while function returns true', () => {
      const stream = Stream.takeWhile(lt(10), numbersStream)

      const result = Stream.unsafeToArray(stream)

      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('.takeUntil', () => {
    it('takes values until function returns true', () => {
      const stream = Stream.takeUntil(gt(4), numbersStream)

      const result = Stream.unsafeToArray(stream)

      expect(result).toEqual([1, 2, 3, 4])
    })
  })

  describe('.take', () => {
    it('throws an error with unsafe numbers', () => {
      const unsafeNumbers = [Infinity, Math.PI, 3.0001]

      for (const number of unsafeNumbers) {
        expect(() => {
          Stream.take(number, numbersStream)
        }).toThrowError(Stream.UnsafeNumber)
      }
    })

    it('accepts integers and floating point numbers with no significant decimal digits', () => {
      // prettier-ignore
      const safeNumbers = [2, 2.0, 2.00, 2.000]

      for (const number of safeNumbers) {
        expect(() => {
          Stream.take(number, numbersStream)
        }).not.toThrowError()
      }
    })
  })

  describe('stacking operations', () => {
    it('can stack operations', () => {
      const stream = Stream.pipe(
        Stream.map(double),
        Stream.keep(gt(10)),
        Stream.reject(gt(20)),
        Stream.take(2),
        Stream.map(toString),
      )(numbersStream)

      const result = Stream.toArray(stream)

      expect(result).toEqual(['12', '14'])
    })
  })
})

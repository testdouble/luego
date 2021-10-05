import { EventEmitter } from  'events'
import { AsyncStream, sequence, take, toArray } from '../src/stream2'

const increment = (x: number): number => x + 1
const double = (x: number): number => x * 2
// const gt = (x: number) => (y: number) => y > x
// const lt = (x: number) => (y: number) => y < x
// const toString = (x: number) => x.toString()

const numbersStream = sequence(1, increment)

describe('Stream2', () => {
  describe('.sequence', () => {
    it('creates an infinite sequence', () => {
      const result = toArray(take(5, numbersStream))

      expect(result).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('something async', () => {
    it('does the thing', () => {
      const f = jest.fn()
      const emitter = new EventEmitter()
      const stream = AsyncStream.fromEvent(emitter, 'foo').map(double)

      stream.subscribe(f)

      emitter.emit('foo', 1)
      emitter.emit('foo', 2)
      emitter.emit('foo', 3)
      emitter.emit('foo', 4)
      emitter.emit('foo', 5)

      expect(f).toHaveBeenCalledTimes(5)
      expect(f).toHaveBeenNthCalledWith(1, 2)
      expect(f).toHaveBeenNthCalledWith(2, 4)
      expect(f).toHaveBeenNthCalledWith(3, 6)
      expect(f).toHaveBeenNthCalledWith(4, 8)
      expect(f).toHaveBeenNthCalledWith(5, 10)
    });
  });

  // describe('.fromArray', () => {
  //   it('creates a stream from an array, limiting to the length of the array', () => {
  //     const arrayLength = 10
  //     const array = Array.from(
  //       { length: arrayLength },
  //       (_, i) => arrayLength - 1 - i,
  //     )
  //     const stream = fromArray(array)

  //     const result = toArray(stream)

  //     expect(result).toEqual(array)
  //   })
  // })

  // describe('.from', () => {
  //   it('creates a stream from a generating function', () => {
  //     const values = ['foo', 'bar', 'baz', 'quux']
  //     const expected = [...values]
  //     const f = () => values.shift()

  //     const stream = from(f)

  //     const result = toArray(take(values.length, stream))

  //     expect(result).toEqual(expected)
  //   });
  // });

  // describe('.fromGenerator', () => {
  //   it('creates a stream from a generating function', () => {
  //     function* generator() {
  //       yield 'foo'
  //       yield 'bar'
  //       yield 'baz'
  //       yield 'quux'
  //     }

  //     const stream = fromGenerator(generator)

  //     const result = toArray(take(4, stream))

  //     expect(result).toEqual(['foo', 'bar', 'baz', 'quux'])
  //   });
  // });

  // describe('.map', () => {
  //   it('transforms the values in the stream', () => {
  //     const stream = map(double, numbersStream)

  //     const result = toArray(take(5, stream))

  //     expect(result).toEqual([2, 4, 6, 8, 10])
  //   })
  // })

  // describe('.keep', () => {
  //   it('keeps values that return true for the provided function', () => {
  //     const stream = keep(gt(10), numbersStream)

  //     const result = toArray(take(5, stream))

  //     expect(result).toEqual([11, 12, 13, 14, 15])
  //   })
  // })

  // describe('.reject', () => {
  //   it('rejects values that return true for the provided function', () => {
  //     const stream = reject(lt(5), numbersStream)

  //     const result = toArray(take(5, stream))

  //     expect(result).toEqual([5, 6, 7, 8, 9])
  //   })
  // })

  // describe('.takeWhile', () => {
  //   it('takes values while function returns true', () => {
  //     const stream = takeWhile(lt(10), numbersStream)

  //     const result = unsafeToArray(stream)

  //     expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  //   })
  // })

  // describe('.takeUntil', () => {
  //   it('takes values until function returns true', () => {
  //     const stream = takeUntil(gt(4), numbersStream)

  //     const result = unsafeToArray(stream)

  //     expect(result).toEqual([1, 2, 3, 4])
  //   })
  // })

  // describe('.take', () => {
  //   it('throws an error with unsafe numbers', () => {
  //     const unsafeNumbers = [Infinity, Math.PI, 3.0001]

  //     for (const number of unsafeNumbers) {
  //       expect(() => {
  //         take(number, numbersStream)
  //       }).toThrowError(UnsafeNumberError)
  //     }
  //   })

  //   it('accepts integers and floating point numbers with no significant decimal digits', () => {
  //     // prettier-ignore
  //     const safeNumbers = [2, 2.0, 2.00, 2.000]

  //     for (const number of safeNumbers) {
  //       expect(() => {
  //         take(number, numbersStream)
  //       }).not.toThrowError()
  //     }
  //   })
  // })

  // describe('.toArray', () => {
  //   it('throws an error with an unsafe stream', () => {
  //     expect(numbersStream.isSafe).toBe(false)
  //     expect(() => {
  //       toArray(numbersStream)
  //     }).toThrowError(UnsafeError)
  //   })
  // })

  // describe('.unsafeToArray', () => {
  //   it('does not throw an error with an unsafe stream', () => {
  //     const stream = pipe(map(toString), takeWhile(lt(6)))(numbersStream)

  //     expect(stream.isSafe).toBe(false)
  //     expect(() => {
  //       unsafeToArray(stream)
  //     }).not.toThrowError()
  //   })
  // })

  // describe('.each', () => {
  //   it('is called for every final value', () => {
  //     const f = jest.fn()
  //     const stream = pipe(map(toString), take(5))(numbersStream)

  //     each(f, stream)

  //     expect(f).toHaveBeenCalledTimes(5)
  //     expect(f).toHaveBeenNthCalledWith(1, '1')
  //     expect(f).toHaveBeenNthCalledWith(2, '2')
  //     expect(f).toHaveBeenNthCalledWith(3, '3')
  //     expect(f).toHaveBeenNthCalledWith(4, '4')
  //     expect(f).toHaveBeenNthCalledWith(5, '5')
  //   })

  //   it('throws an error with an unsafe stream', () => {
  //     const f = jest.fn()

  //     expect(numbersStream.isSafe).toBe(false)
  //     expect(() => {
  //       each(f, numbersStream)
  //     }).toThrowError(UnsafeError)
  //     expect(f).not.toHaveBeenCalled()
  //   })
  // })

  // describe('.unsafeEach', () => {
  //   it('is called for every final value', () => {
  //     const f = jest.fn()
  //     const stream = pipe(map(toString), take(5))(numbersStream)

  //     unsafeEach(f, stream)

  //     expect(f).toHaveBeenCalledTimes(5)
  //     expect(f).toHaveBeenNthCalledWith(1, '1')
  //     expect(f).toHaveBeenNthCalledWith(2, '2')
  //     expect(f).toHaveBeenNthCalledWith(3, '3')
  //     expect(f).toHaveBeenNthCalledWith(4, '4')
  //     expect(f).toHaveBeenNthCalledWith(5, '5')
  //   })

  //   it('does not throw an error with an unsafe stream', () => {
  //     const f = jest.fn()
  //     const stream = pipe(map(toString), takeWhile(lt(6)))(numbersStream)

  //     expect(stream.isSafe).toBe(false)
  //     expect(() => {
  //       unsafeEach(f, stream)
  //     }).not.toThrowError()
  //     expect(f).toHaveBeenCalledTimes(5)
  //     expect(f).toHaveBeenNthCalledWith(1, '1')
  //     expect(f).toHaveBeenNthCalledWith(2, '2')
  //     expect(f).toHaveBeenNthCalledWith(3, '3')
  //     expect(f).toHaveBeenNthCalledWith(4, '4')
  //     expect(f).toHaveBeenNthCalledWith(5, '5')
  //   })
  // })

  // describe('stacking operations', () => {
  //   it('can stack operations', () => {
  //     const stream = pipe(
  //       map(double),
  //       keep(gt(10)),
  //       reject(gt(20)),
  //       take(2),
  //       map(toString),
  //     )(numbersStream)

  //     const result = toArray(stream)

  //     expect(result).toEqual(['12', '14'])
  //   })
  // })
})

import { syncNumbersStream } from 'spec/utils'
import { toArray } from 'src/sync/consumers'
import { PossibleInfiniteLoopError, UnsafeError } from 'src/shared/errors'

describe('sync consumers', () => {
  describe('toArray', () => {
    it('returns an array of limited values', () => {
      const stream = syncNumbersStream.take(5)

      const result = toArray(stream)

      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('throws an error if results not limited with .take', () => {
      expect(() => {
        toArray(syncNumbersStream)
      }).toThrow(UnsafeError)
    })

    it('throws an error if possible infinite loop producing array', () => {
      const stream = syncNumbersStream.keep((n) => n < 0).take(5)

      expect(() => {
        toArray(stream)
      }).toThrow(PossibleInfiniteLoopError)
    })

    it('allows setting the max number of loops before throwing error', () => {
      const stream = syncNumbersStream.keep((n) => n < 2).take(5)
      const maxLoopsWithoutValue = 1

      expect(() => {
        toArray(stream, maxLoopsWithoutValue)
      }).toThrow(PossibleInfiniteLoopError)
    })
  })
})

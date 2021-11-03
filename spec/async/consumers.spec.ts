import { toArray } from 'src/async/consumers'
import { asyncNumbersStream } from 'spec/utils'
import { UnsafeError } from 'src/shared/errors'

describe('async consumers', () => {
  describe('toArray', () => {
    it('returns a promise that resolves to an array of limited values', async () => {
      const stream = asyncNumbersStream.take(5)

      const result = await toArray(stream)

      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('throws an error if results not limited with .take', async () => {
      const result = toArray(asyncNumbersStream)

      await expect(result).rejects.toThrow(UnsafeError)
    })
  })
})

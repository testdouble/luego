import { sequence } from 'src/sync/constructors'
import { increment } from 'spec/utils'

describe('sync constructors', () => {
  describe('sequence', () => {
    it('creates a sequenced stream', () => {
      const stream = sequence(1, increment)

      const result = stream.take(5)

      expect(result.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })
})

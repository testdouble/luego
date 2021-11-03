import { create } from 'src/async/constructors'
import { sequence } from 'src/sync/constructors'
import { increment } from 'spec/utils'

describe('async constructors', () => {
  describe('create', () => {
    it('creates an async stream with emitted values', async () => {
      const stream = create<number>((subscriber) => {
        sequence(1, increment).take(20).subscribe(subscriber.next)
      })

      const result = stream.take(5)

      expect(await result.toArray()).toEqual([1, 2, 3, 4, 5])
    })
  })
})

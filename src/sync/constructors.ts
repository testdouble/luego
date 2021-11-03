import curry from 'lodash/curry'
import SyncStream from '../sync/stream'
import SyncProducer, { SyncProducerResult } from '../sync/producer'
import { ResultValue } from '../shared/results'

export type GenerateNextF<T> = (value: T) => T

const sequenceProducer = <T>(
  value: T,
  generateNext: GenerateNextF<T>,
): SyncProducer<T> =>
  new SyncProducer(
    () =>
      new SyncProducerResult(
        new ResultValue(value),
        sequenceProducer(generateNext(value), generateNext),
      ),
  )

export const sequence: {
  <T>(value: T, generateNext: GenerateNextF<T>): SyncStream<T>
  <T>(value: T): (generateNext: GenerateNextF<T>) => SyncStream<T>
} = curry(
  <T>(value: T, generateNext: GenerateNextF<T>): SyncStream<T> =>
    new SyncStream(sequenceProducer(value, generateNext)),
)

// export const fromArray = <T>(array: T[]): Stream<T> => {
//   const { length } = array

//   const fromArrayHelper = (index: number): Stream<T> =>
//     createSafeStream<T>(() =>
//       index >= length
//         ? empty
//         : new ResultValue(array[index], fromArrayHelper(index + 1)),
//     )

//   return fromArrayHelper(0)
// }

// export const from = <T>(f: Thunk<T>): Stream<T> =>
//   new Stream(() => new ResultValue(f(), from(f)))

// export const fromGenerator = <T>(
//   f: Thunk<Generator<T, T | void>>,
// ): Stream<T> => {
//   const iterator = f()

//   const fromGeneratorHelper = (): Stream<T> =>
//     new Stream<T>(() => {
//       const { value } = iterator.next()

//       return typeof value === 'undefined'
//         ? empty
//         : new ResultValue(value, fromGeneratorHelper())
//     })

//   return fromGeneratorHelper()
// }

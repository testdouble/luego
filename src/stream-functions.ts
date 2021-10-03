import curry from 'lodash/curry'
import lodashPipe from 'lodash/fp/pipe'
import {
  DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
  ResultValue,
  Stream,
  createSafeStream,
  empty,
} from './stream'
import { EffectF, GenerateNextF, MapF, PredicateF } from './types'

// Constructors
// ============

export const sequence: {
  <T>(value: T, generateNext: GenerateNextF<T>): Stream<T>
  <T>(value: T): (generateNext: GenerateNextF<T>) => Stream<T>
} = curry(
  <T>(value: T, generateNext: GenerateNextF<T>): Stream<T> =>
    new Stream(
      () =>
        new ResultValue(
          value,
          new Stream(() => sequence(generateNext(value), generateNext).thunk()),
        ),
    ),
)

export const fromArray = <T>(array: T[]): Stream<T> => {
  const { length } = array

  const fromArrayHelper = (index: number): Stream<T> =>
    createSafeStream(() =>
      index >= length
        ? empty
        : new ResultValue(array[index], fromArrayHelper(index + 1)),
    )

  return fromArrayHelper(0)
}

// Operations
// ==========

export const map: {
  <T, U>(f: MapF<T, U>, stream: Stream<T>): Stream<U>
  <T, U>(f: MapF<T, U>): (stream: Stream<T>) => Stream<U>
} = curry(<T, U>(f: MapF<T, U>, stream: Stream<T>): Stream<U> => stream.map(f))

export const keep: {
  <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T>
  <T>(f: PredicateF<T>): (stream: Stream<T>) => Stream<T>
} = curry(<T>(f: PredicateF<T>, stream: Stream<T>): Stream<T> => stream.keep(f))

export const reject: {
  <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T>
  <T>(f: PredicateF<T>): (stream: Stream<T>) => Stream<T>
} = curry(
  <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T> => stream.reject(f),
)

export const take: {
  <T>(n: number, stream: Stream<T>): Stream<T>
  <T>(n: number): (stream: Stream<T>) => Stream<T>
} = curry(<T>(n: number, stream: Stream<T>): Stream<T> => stream.take(n))

export const takeWhile: {
  <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T>
  <T>(f: PredicateF<T>): (stream: Stream<T>) => Stream<T>
} = curry(
  <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T> => stream.takeWhile(f),
)

export const takeUntil: {
  <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T>
  <T>(f: PredicateF<T>): (stream: Stream<T>) => Stream<T>
} = curry(
  <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T> => stream.takeUntil(f),
)

// Utils
// =====

export const pipe = lodashPipe

// Consumers
// =========

export const each = <T>(
  f: EffectF<T>,
  stream: Stream<T>,
  maxLoopsWithoutValue: number = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
): void => stream.each(f, maxLoopsWithoutValue)

export const unsafeEach = <T>(
  f: EffectF<T>,
  stream: Stream<T>,
  maxLoopsWithoutValue: number = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
): void => stream.unsafeEach(f, maxLoopsWithoutValue)

export const toArray = <T>(
  stream: Stream<T>,
  maxLoopsWithoutValue: number = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
): T[] => stream.toArray(maxLoopsWithoutValue)

export const unsafeToArray = <T>(
  stream: Stream<T>,
  maxLoopsWithoutValue: number = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
): T[] => stream.unsafeToArray(maxLoopsWithoutValue)

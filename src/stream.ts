import curry from 'lodash/curry'
import lodashPipe from 'lodash/fp/pipe'
import { not } from './function-utils'
import {
  Empty,
  Filtered,
  GenerateNext,
  MapFunction,
  PredicateFunction,
  Result,
  ResultValue,
  Stream,
  Thunk,
} from './types'

// Result Constructors
// ===================

export const createResultValue: {
  <T>(value: T, next: Stream<T>): ResultValue<T>
  <T>(value: T): (next: Stream<T>) => ResultValue<T>
} = curry(
  <T>(value: T, next: Stream<T>): ResultValue<T> => ({
    type: 'value',
    value,
    next,
  }),
)

export const empty: Empty = Object.freeze({ type: 'empty' })

const createFiltered = <T>(next: Stream<T>): Filtered<T> => ({
  type: 'filtered',
  next,
})

// Stream Constructors
// ===================

const create: {
  <T>(isSafe: boolean, thunk: Thunk<Result<T>>): Stream<T>
  <T>(isSafe: boolean): (thunk: Thunk<Result<T>>) => Stream<T>
} = curry(
  <T>(isSafe: boolean, thunk: Thunk<Result<T>>): Stream<T> => ({
    thunk,
    isSafe,
  }),
)

const createUnsafe: { <T>(thunk: Thunk<Result<T>>): Stream<T> } = create(false)
const createSafe: { <T>(thunk: Thunk<Result<T>>): Stream<T> } = create(true)

export const sequence: {
  <T>(value: T, generateNext: GenerateNext<T>): Stream<T>
  <T>(value: T): (generateNext: GenerateNext<T>) => Stream<T>
} = curry(
  <T>(value: T, generateNext: GenerateNext<T>): Stream<T> =>
    createUnsafe(() =>
      createResultValue(
        value,
        createUnsafe(() => run(sequence(generateNext(value), generateNext))),
      ),
    ),
)

export const fromArray = <T>(array: T[]): Stream<T> => {
  const { length } = array

  const fromArrayHelper = (index: number): Stream<T> =>
    createSafe(() =>
      index >= length
        ? empty
        : createResultValue(array[index], fromArrayHelper(index + 1)),
    )

  return fromArrayHelper(0)
}

// Operations
// ==========

export const map: {
  <T, U>(f: MapFunction<T, U>, stream: Stream<T>): Stream<U>
  <T, U>(f: MapFunction<T, U>): (stream: Stream<T>) => Stream<U>
} = curry(
  <T, U>(f: MapFunction<T, U>, stream: Stream<T>): Stream<U> =>
    create(stream.isSafe, () => {
      const result = run(stream)

      switch (result.type) {
        case 'empty':
          return result

        case 'filtered':
          return createFiltered(map(f, result.next))

        case 'value':
          return createResultValue(f(result.value), map(f, result.next))
      }
    }),
)

export const keep: {
  <T>(f: PredicateFunction<T>, stream: Stream<T>): Stream<T>
  <T>(f: PredicateFunction<T>): (stream: Stream<T>) => Stream<T>
} = curry(
  <T>(f: PredicateFunction<T>, stream: Stream<T>): Stream<T> => ({
    ...stream,
    thunk: () => {
      const result = run(stream)

      switch (result.type) {
        case 'empty':
          return result

        case 'filtered':
          return createFiltered(keep(f, result.next))

        case 'value':
          return f(result.value)
            ? createResultValue(result.value, keep(f, result.next))
            : createFiltered(keep(f, result.next))
      }
    },
  }),
)

export const reject: {
  <T>(f: PredicateFunction<T>, stream: Stream<T>): Stream<T>
  <T>(f: PredicateFunction<T>): (stream: Stream<T>) => Stream<T>
} = curry(
  <T>(f: PredicateFunction<T>, stream: Stream<T>): Stream<T> =>
    keep(not(f), stream),
)

export const take: {
  <T>(n: number, stream: Stream<T>): Stream<T>
  <T>(n: number): (stream: Stream<T>) => Stream<T>
} = curry(<T>(n: number, stream: Stream<T>): Stream<T> => {
  if (!Number.isSafeInteger(n)) {
    throw new UnsafeNumber(n)
  }

  return createSafe(() => {
    if (n <= 0) {
      return empty
    }

    const result = run(stream)

    switch (result.type) {
      case 'empty':
        return result

      case 'filtered':
        return createFiltered(take(n, result.next))

      case 'value':
        return createResultValue(result.value, take(n - 1, result.next))
    }
  })
})

export const takeWhile: {
  <T>(f: PredicateFunction<T>, stream: Stream<T>): Stream<T>
  <T>(f: PredicateFunction<T>): (stream: Stream<T>) => Stream<T>
} = curry(
  <T>(f: PredicateFunction<T>, stream: Stream<T>): Stream<T> => ({
    ...stream,
    thunk: () => {
      const result = run(stream)

      switch (result.type) {
        case 'empty':
          return result

        case 'filtered':
          return createFiltered(takeWhile(f, result.next))

        case 'value':
          return f(result.value)
            ? createResultValue(result.value, takeWhile(f, result.next))
            : empty
      }
    },
  }),
)

export const takeUntil: {
  <T>(f: PredicateFunction<T>, stream: Stream<T>): Stream<T>
  <T>(f: PredicateFunction<T>): (stream: Stream<T>) => Stream<T>
} = curry(
  <T>(f: PredicateFunction<T>, stream: Stream<T>): Stream<T> =>
    takeWhile(not(f), stream),
)

// Utils
// =====

export const pipe = lodashPipe

// Errors
// ======

export class UnsafeNumber extends Error {
  constructor(n: number) {
    super(`Please provide a finite integer for \`take\`: ${n}.`)
  }
}

export class UnsafeError extends Error {
  constructor() {
    super(
      'Stream unsafe and could produce an infinite loop. Please limit your results with `take(n)`.',
    )
  }
}

export class PossibleInfiniteLoopError extends Error {
  constructor() {
    super(
      "Possible infinite loop.\nCheck any `keep` or `reject` operations that never find a matching value or can't find enough matching values for `take(n)`.",
    )
  }
}

// Consumers
// =========

const run = <T>(stream: Stream<T>): Result<T> => stream.thunk()

const DEFAULT_MAX_LOOPS_WITHOUT_VALUE = 10000

export const toArray = <T>(
  stream: Stream<T>,
  maxLoopsWithoutValue: number = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
): T[] => {
  if (!stream.isSafe) {
    throw new UnsafeError()
  }

  let result = run(stream)
  const array = []
  let loopsSinceValue = 0

  while (result.type !== 'empty') {
    if (loopsSinceValue > maxLoopsWithoutValue) {
      throw new PossibleInfiniteLoopError()
    }

    if (result.type === 'value') {
      array.push(result.value)
      loopsSinceValue = 0
    } else {
      loopsSinceValue += 1
    }

    result = run(result.next)
  }

  return array
}

export const unsafeToArray = <T>(
  stream: Stream<T>,
  maxLoopsWithoutValue: number = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
): T[] => {
  let result = run(stream)
  const array = []
  let loopsSinceValue = 0

  while (result.type !== 'empty') {
    if (loopsSinceValue > maxLoopsWithoutValue) {
      throw new PossibleInfiniteLoopError()
    }

    if (result.type === 'value') {
      array.push(result.value)
      loopsSinceValue = 0
    } else {
      loopsSinceValue += 1
    }

    result = run(result.next)
  }

  return array
}

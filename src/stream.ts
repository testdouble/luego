import { not } from './function-utils'
import { MapF, PredicateF, Thunk } from './types'
import {
  PossibleInfiniteLoopError,
  UnsafeError,
  UnsafeNumberError,
} from './errors'

export const DEFAULT_MAX_LOOPS_WITHOUT_VALUE = 10000

export function createSafeStream<T>(thunk: Thunk<Result<T>>): Stream<T> {
  const stream = new Stream(thunk)
  stream.isSafe = true
  return stream
}

export class Stream<T> {
  thunk: Thunk<Result<T>>
  isSafe: boolean

  constructor(thunk: Thunk<Result<T>>, isSafe = false) {
    this.thunk = thunk
    this.isSafe = isSafe
  }

  map<U>(f: MapF<T, U>): Stream<U> {
    const { thunk } = this
    return new Stream(() => thunk().map(f), this.isSafe)
  }

  keep(f: PredicateF<T>): Stream<T> {
    const { thunk } = this
    return new Stream(() => thunk().keep(f), this.isSafe)
  }

  reject(f: PredicateF<T>): Stream<T> {
    const { thunk } = this
    return new Stream(() => thunk().reject(f), this.isSafe)
  }

  take(n: number): Stream<T> {
    if (!Number.isSafeInteger(n)) {
      throw new UnsafeNumberError(n)
    }

    const { thunk } = this
    return createSafeStream(() => thunk().take(n))
  }

  takeWhile(f: PredicateF<T>): Stream<T> {
    const { thunk } = this
    return new Stream(() => thunk().takeWhile(f), this.isSafe)
  }

  takeUntil(f: PredicateF<T>): Stream<T> {
    const { thunk } = this
    return new Stream(() => thunk().takeUntil(f), this.isSafe)
  }

  toArray(maxLoopsWithoutValue = DEFAULT_MAX_LOOPS_WITHOUT_VALUE): T[] {
    if (!this.isSafe) {
      throw new UnsafeError()
    }

    let result = this.thunk()
    const array = []
    let loopsSinceValue = 0

    while (!result.isEmpty()) {
      if (loopsSinceValue > maxLoopsWithoutValue) {
        throw new PossibleInfiniteLoopError()
      }

      if (result instanceof ResultValue) {
        array.push(result.value)
        loopsSinceValue = 0
      } else {
        loopsSinceValue += 1
      }

      result = (result as Nextable<T>).next.thunk()
    }

    return array
  }

  unsafeToArray(maxLoopsWithoutValue = DEFAULT_MAX_LOOPS_WITHOUT_VALUE): T[] {
    let result = this.thunk()
    const array = []
    let loopsSinceValue = 0

    while (!result.isEmpty()) {
      if (loopsSinceValue > maxLoopsWithoutValue) {
        throw new PossibleInfiniteLoopError()
      }

      if (result instanceof ResultValue) {
        array.push(result.value)
        loopsSinceValue = 0
      } else {
        loopsSinceValue += 1
      }

      result = (result as Nextable<T>).next.thunk()
    }

    return array
  }
}

interface Result<T> {
  map<U>(f: MapF<T, U>): Result<U>
  keep(f: PredicateF<T>): Result<T>
  reject(f: PredicateF<T>): Result<T>
  take(n: number): Result<T>
  takeWhile(f: PredicateF<T>): Result<T>
  takeUntil(f: PredicateF<T>): Result<T>
  isEmpty(): boolean
}

type Nextable<T> = ResultValue<T> | Filtered<T>

export class ResultValue<T> implements Result<T> {
  value: T
  next: Stream<T>

  constructor(value: T, next: Stream<T>) {
    this.value = value
    this.next = next
  }

  map<U>(f: MapF<T, U>): ResultValue<U> {
    return new ResultValue(f(this.value), this.next.map(f))
  }

  keep(f: PredicateF<T>): Result<T> {
    return f(this.value)
      ? new ResultValue(this.value, this.next.keep(f))
      : new Filtered(this.next.keep(f))
  }

  reject(f: PredicateF<T>): Result<T> {
    return this.keep(not(f))
  }

  take(n: number): Result<T> {
    return n <= 0 ? empty : new ResultValue(this.value, this.next.take(n - 1))
  }

  takeWhile(f: PredicateF<T>): Result<T> {
    return f(this.value)
      ? new ResultValue(this.value, this.next.takeWhile(f))
      : empty
  }

  takeUntil(f: PredicateF<T>): Result<T> {
    return this.takeWhile(not(f))
  }

  isEmpty(): boolean {
    return false
  }
}

class Filtered<T> implements Result<T> {
  next: Stream<T>

  constructor(next: Stream<T>) {
    this.next = next
  }

  map<U>(f: MapF<T, U>): Filtered<U> {
    return new Filtered(this.next.map(f))
  }

  keep(f: PredicateF<T>): Result<T> {
    return new Filtered(this.next.keep(f))
  }

  reject(f: PredicateF<T>): Result<T> {
    return this.keep(not(f))
  }

  take(n: number): Result<T> {
    return n <= 0 ? empty : new Filtered(this.next.take(n))
  }

  takeWhile(f: PredicateF<T>): Filtered<T> {
    return new Filtered(this.next.takeWhile(f))
  }

  takeUntil(f: PredicateF<T>): Result<T> {
    return this.takeWhile(not(f))
  }

  isEmpty(): boolean {
    return false
  }
}

class Empty<T> implements Result<T> {
  map<U>(): Empty<U> {
    return this
  }

  keep(): Empty<T> {
    return this
  }

  reject(): Empty<T> {
    return this
  }

  take(): Empty<T> {
    return this
  }

  takeWhile(): Empty<T> {
    return this
  }

  takeUntil(): Empty<T> {
    return this
  }

  isEmpty(): boolean {
    return true
  }
}

export const empty = new Empty()

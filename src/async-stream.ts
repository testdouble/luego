import { not } from './function-utils'
import { IResult, EffectF, MapF, PredicateF, Thunk } from './types'
import {
  PossibleInfiniteLoopError,
  UnsafeError,
  UnsafeNumberError,
} from './errors'

export const DEFAULT_MAX_LOOPS_WITHOUT_VALUE = 10000

export function createSafeStream<T>(thunk: Thunk<IResult<T>>): AsyncStream<T> {
  const stream = new AsyncStream(thunk)
  stream.isSafe = true
  return stream
}

export class AsyncStream<T> {
  thunk: Thunk<IResult<T>>
  isSafe: boolean

  constructor(thunk: Thunk<IResult<T>>, isSafe = false) {
    this.thunk = thunk
    this.isSafe = isSafe
  }

  map<U>(f: MapF<T, U>): AsyncStream<U> {
    const { thunk } = this
    return new AsyncStream(() => thunk().map(f), this.isSafe)
  }

  keep(f: PredicateF<T>): AsyncStream<T> {
    const { thunk } = this
    return new AsyncStream(() => thunk().keep(f), this.isSafe)
  }

  reject(f: PredicateF<T>): AsyncStream<T> {
    const { thunk } = this
    return new AsyncStream(() => thunk().reject(f), this.isSafe)
  }

  take(n: number): AsyncStream<T> {
    if (!Number.isSafeInteger(n)) {
      throw new UnsafeNumberError(n)
    }

    const { thunk } = this
    return createSafeStream(() => thunk().take(n))
  }

  takeWhile(f: PredicateF<T>): AsyncStream<T> {
    const { thunk } = this
    return new AsyncStream(() => thunk().takeWhile(f), this.isSafe)
  }

  takeUntil(f: PredicateF<T>): AsyncStream<T> {
    const { thunk } = this
    return new AsyncStream(() => thunk().takeUntil(f), this.isSafe)
  }

  async each(
    f: EffectF<T>,
    maxLoopsWithoutValue = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
  ): Promise<void> {
    if (!this.isSafe) {
      throw new UnsafeError()
    }

    await this.unsafeEach(f, maxLoopsWithoutValue)
  }

  private async unsafeEach(
    f: EffectF<T>,
    maxLoopsWithoutValue = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
  ): Promise<void> {
    let result = this.thunk()
    let loopsSinceValue = 0

    while (!result.isEmpty()) {
      if (loopsSinceValue > maxLoopsWithoutValue) {
        throw new PossibleInfiniteLoopError()
      }

      if (result instanceof ResultValue) {
        f(result.value)
        loopsSinceValue = 0
        result = (result as Nextable<T>).next.thunk()
      } else if (result instanceof ResultPromise) {
        result = await result.promise
      } else {
        loopsSinceValue += 1
        result = (result as Nextable<T>).next.thunk()
      }
    }
  }

  // toArray(): AsyncStream<T> {
  //   if (!this.isSafe) {
  //     throw new UnsafeError()
  //   }

  //   const helper = (accum) => {
  //     const { thunk } = this

  //     return new AsyncStream(() => {
  //     }, this.isSafe)
  //   }

  //   return helper([])
  // }

  // toArray(maxLoopsWithoutValue = DEFAULT_MAX_LOOPS_WITHOUT_VALUE): T[] {
  //   const array: T[] = []

  //   this.each((value: T) => array.push(value), maxLoopsWithoutValue)

  //   return array
  // }

  // unsafeToArray(maxLoopsWithoutValue = DEFAULT_MAX_LOOPS_WITHOUT_VALUE): T[] {
  //   const array: T[] = []

  //   this.unsafeEach((value: T) => array.push(value), maxLoopsWithoutValue)

  //   return array
  // }
}

type Nextable<T> = ResultValue<T> | Filtered<T>
export type AsyncResult<T> = ResultPromise<T> | ResultValue<T> | Filtered<T> | Empty<T>

export class ResultPromise<T> implements IResult<T> {
  promise: Promise<AsyncResult<T>>

  constructor(promise: Promise<AsyncResult<T>>) {
    this.promise = promise
  }

  map<U>(f: MapF<T, U>): ResultPromise<U> {
    return new ResultPromise(this.promise.then((result) => result.map(f)))
  }

  keep(f: PredicateF<T>): ResultPromise<T> {
    return new ResultPromise(this.promise.then((result) => result.keep(f)))
  }

  reject(f: PredicateF<T>): ResultPromise<T> {
    return this.keep(not(f))
  }

  take(n: number): AsyncResult<T> {
    return n <= 0
      ? empty
      : new ResultPromise(this.promise.then((result) => result.take(n)))
  }

  takeWhile(f: PredicateF<T>): ResultPromise<T> {
    return new ResultPromise(this.promise.then((result) => result.takeWhile(f)))
  }

  takeUntil(f: PredicateF<T>): ResultPromise<T> {
    return this.takeWhile(not(f))
  }

  isEmpty(): boolean {
    return false
  }
}

export class ResultValue<T> implements IResult<T> {
  value: T
  next: AsyncStream<T>

  constructor(value: T, next: AsyncStream<T>) {
    this.value = value
    this.next = next
  }

  map<U>(f: MapF<T, U>): ResultValue<U> {
    return new ResultValue(f(this.value), this.next.map(f))
  }

  keep(f: PredicateF<T>): AsyncResult<T> {
    return f(this.value)
      ? new ResultValue(this.value, this.next.keep(f))
      : new Filtered(this.next.keep(f))
  }

  reject(f: PredicateF<T>): AsyncResult<T> {
    return this.keep(not(f))
  }

  take(n: number): AsyncResult<T> {
    return n <= 0 ? empty : new ResultValue(this.value, this.next.take(n - 1))
  }

  takeWhile(f: PredicateF<T>): AsyncResult<T> {
    return f(this.value)
      ? new ResultValue(this.value, this.next.takeWhile(f))
      : empty
  }

  takeUntil(f: PredicateF<T>): AsyncResult<T> {
    return this.takeWhile(not(f))
  }

  isEmpty(): boolean {
    return false
  }
}

class Filtered<T> implements IResult<T> {
  next: AsyncStream<T>

  constructor(next: AsyncStream<T>) {
    this.next = next
  }

  map<U>(f: MapF<T, U>): Filtered<U> {
    return new Filtered(this.next.map(f))
  }

  keep(f: PredicateF<T>): Filtered<T> {
    return new Filtered(this.next.keep(f))
  }

  reject(f: PredicateF<T>): Filtered<T> {
    return this.keep(not(f))
  }

  take(n: number): AsyncResult<T> {
    return n <= 0 ? empty : new Filtered(this.next.take(n))
  }

  takeWhile(f: PredicateF<T>): Filtered<T> {
    return new Filtered(this.next.takeWhile(f))
  }

  takeUntil(f: PredicateF<T>): Filtered<T> {
    return this.takeWhile(not(f))
  }

  isEmpty(): boolean {
    return false
  }
}

class Empty<T> implements IResult<T> {
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

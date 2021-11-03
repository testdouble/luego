import type { MapF, PredicateF, Thunk } from '../shared/types'
import type { Result } from '../shared/results'
import type { IProducer } from '../shared/producer/types'
import { End } from '../shared/results'

export class SyncProducerResult<T> {
  result: Result<T>
  next: SyncProducer<T>

  constructor(result: Result<T>, next: SyncProducer<T>) {
    this.result = result
    this.next = next
  }

  map<U>(f: MapF<T, U>): SyncProducerResult<U> {
    return new SyncProducerResult(this.result.map(f), this.next.map(f))
  }

  keep(f: PredicateF<T>): SyncProducerResult<T> {
    return new SyncProducerResult(this.result.keep(f), this.next.keep(f))
  }

  takeWhile(f: PredicateF<T>): SyncProducerResult<T> {
    const newResult = this.result.keep(f)
    return new SyncProducerResult(
      newResult.hasValue() ? newResult : new End(),
      this.next.takeWhile(f),
    )
  }
}

export default class SyncProducer<T> implements IProducer<T> {
  thunk: Thunk<SyncProducerResult<T>>

  constructor(thunk: Thunk<SyncProducerResult<T>>) {
    this.thunk = thunk
  }

  map<U>(f: MapF<T, U>): SyncProducer<U> {
    const { thunk } = this
    return new SyncProducer(() => thunk().map(f))
  }

  keep(f: PredicateF<T>): SyncProducer<T> {
    const { thunk } = this
    return new SyncProducer(() => thunk().keep(f))
  }

  takeWhile(f: PredicateF<T>): SyncProducer<T> {
    const { thunk } = this
    return new SyncProducer(() => thunk().takeWhile(f))
  }

  run(): SyncProducerResult<T> {
    const { thunk } = this
    return thunk()
  }
}

import type SyncProducer from './producer'
import type {
  IStream,
  KindArray,
  SubscribeOptions,
} from '../shared/stream/types'
import type { EffectF, MapF, PositiveInt, PredicateF } from '../shared/types'
import { PossibleInfiniteLoopError } from '../shared/errors'
import { DEFAULT_MAX_LOOPS_WITHOUT_VALUE } from './constants'
import { validateHaveLimit, validateLimit } from '../shared/validate'
import { not } from '../shared/function-utils'

export default class SyncStream<Data> implements IStream<Data, KindArray> {
  constructor(
    protected producer: SyncProducer<Data>,
    protected limit: PositiveInt | null = null,
  ) {}

  map<Data2>(f: MapF<Data, Data2>): SyncStream<Data2> {
    return new SyncStream(this.producer.map(f), this.limit)
  }

  keep(f: PredicateF<Data>): SyncStream<Data> {
    return new SyncStream(this.producer.keep(f), this.limit)
  }

  reject(f: PredicateF<Data>): SyncStream<Data> {
    return this.keep(not(f))
  }

  take(n: number): SyncStream<Data> {
    const limit = validateLimit(n)

    return new SyncStream(this.producer, limit)
  }

  takeWhile(f: PredicateF<Data>): SyncStream<Data> {
    return new SyncStream(this.producer.takeWhile(f), this.limit)
  }

  takeUntil(f: PredicateF<Data>): SyncStream<Data> {
    return this.takeWhile(not(f))
  }

  subscribe(
    f: EffectF<Data>,
    options: SubscribeOptions = {},
    maxLoopsWithoutValue = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
  ): void {
    const { onComplete } = options

    validateHaveLimit(this.limit)

    let limit = this.limit as number
    let response = this.producer.run()
    let loopsSinceValue = 0

    while (limit > 0 && !response.result.isEnd()) {
      if (loopsSinceValue > maxLoopsWithoutValue) {
        throw new PossibleInfiniteLoopError()
      }

      const { result } = response

      if (result.hasValue()) {
        f(result.value)
        loopsSinceValue = 0
        limit--
      } else {
        loopsSinceValue += 1
      }

      response = response.next.run()
    }

    if (onComplete) {
      onComplete()
    }
  }

  toArray(maxLoopsWithoutValue = DEFAULT_MAX_LOOPS_WITHOUT_VALUE): Data[] {
    const array: Data[] = []

    this.subscribe((value) => array.push(value), {}, maxLoopsWithoutValue)

    return array
  }
}

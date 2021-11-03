import type { Emitter } from './types'
import type { EffectF, MapF, PositiveInt, PredicateF } from '../shared/types'
import type { SubscriberF } from './producer'
import type { Result } from '../shared/results'
import type {
  IStream,
  KindArray,
  KindPromiseOf,
  SubscribeOptions,
} from '../shared/stream/types'
import AsyncProducer, { resultIdentity } from './producer'
import { validateHaveLimit, validateLimit } from '../shared/validate'
import { not } from '../shared/function-utils'

export default class AsyncStream<SourceData, Data>
  implements IStream<Data, KindPromiseOf<KindArray>>
{
  public static create<T>(generate: SubscriberF<T>): AsyncStream<T, T> {
    return new AsyncStream(new AsyncProducer(generate, resultIdentity))
  }

  public static fromEvent<S>(
    emitter: Emitter<S>,
    event: string,
  ): AsyncStream<S, S> {
    return new AsyncStream(AsyncProducer.fromEvent(emitter, event))
  }

  constructor(
    protected producer: AsyncProducer<SourceData, Data>,
    protected limit: PositiveInt | null = null,
  ) {}

  map<Data2>(f: MapF<Data, Data2>): AsyncStream<SourceData, Data2> {
    return new AsyncStream(this.producer.map(f), this.limit)
  }

  keep(f: PredicateF<Data>): AsyncStream<SourceData, Data> {
    return new AsyncStream(this.producer.keep(f), this.limit)
  }

  reject(f: PredicateF<Data>): AsyncStream<SourceData, Data> {
    return this.keep(not(f))
  }

  take(n: number): AsyncStream<SourceData, Data> {
    const limit = validateLimit(n)

    return new AsyncStream(this.producer, limit)
  }

  takeWhile(f: PredicateF<Data>): AsyncStream<SourceData, Data> {
    return new AsyncStream(this.producer.takeWhile(f), this.limit)
  }

  takeUntil(f: PredicateF<Data>): AsyncStream<SourceData, Data> {
    return this.takeWhile(not(f))
  }

  // TODO: producer is mutated, maybe return a SubscribedAsyncStream?
  subscribe(f: EffectF<Data>, options: SubscribeOptions = {}): void {
    const { onComplete } = options
    const { producer } = this
    let { limit } = this

    // TODO: prevent memory leaks when not limited
    const callback = (result: Result<Data>) => {
      if (result.hasValue()) {
        f(result.value)

        if (limit != null) {
          limit--
        }
      }

      if (result.isEnd() || (limit != null && limit <= 0)) {
        producer.unsubscribe()

        if (onComplete) {
          onComplete()
        }
      }
    }

    producer.subscribe(callback)
  }

  toArray(): Promise<Data[]> {
    return new Promise((resolve) => {
      validateHaveLimit(this.limit)

      const array: Data[] = []

      this.subscribe((value) => array.push(value), {
        onComplete() {
          resolve(array)
        },
      })
    })
  }
}

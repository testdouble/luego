import type { EffectF, MapF, PredicateF, Thunk } from '../shared/types'
import type { Result } from '../shared/results'
import type { IProducer } from '../shared/producer/types'
import type { Emitter } from './types'
import { End, ResultValue } from '../shared/results'

export const resultIdentity = <T>(x: T): Result<T> => new ResultValue(x)

export class Subscriber<T> {
  private listener: EffectF<T> | null

  constructor(listener: EffectF<T>) {
    this.listener = listener
    this.next = this.next.bind(this)
  }

  next(value: T): void {
    const { listener } = this

    if (listener) {
      listener(value)
    }
  }

  unsubscribe(): void {
    this.listener = null
  }
}

export type SubscriberF<T> = (subscriber: Subscriber<T>) => Thunk<void> | void

export default class AsyncProducer<S, T> implements IProducer<T> {
  private transform: MapF<S, Result<T>>
  private generate: SubscriberF<S>
  private subscriber: Subscriber<S> | null
  private unsubscriber: Thunk<void> | null

  public static fromEvent<S>(
    emitter: Emitter<S>,
    event: string,
  ): AsyncProducer<S, S> {
    return new AsyncProducer((subscriber) => {
      emitter.on(event, subscriber.next)

      return () => emitter.off(event, subscriber.next)
    }, resultIdentity)
  }

  constructor(generate: SubscriberF<S>, transform: MapF<S, Result<T>>) {
    this.generate = generate
    this.transform = transform
    this.subscriber = null
    this.unsubscriber = null
  }

  map<U>(f: MapF<T, U>): AsyncProducer<S, U> {
    const { transform } = this
    return new AsyncProducer(this.generate, (value) => transform(value).map(f))
  }

  keep(f: PredicateF<T>): AsyncProducer<S, T> {
    const { transform } = this
    return new AsyncProducer(this.generate, (value) => transform(value).keep(f))
  }

  takeWhile(f: PredicateF<T>): AsyncProducer<S, T> {
    const { transform } = this
    return new AsyncProducer(this.generate, (value) => {
      const newResult = transform(value).keep(f)
      return newResult.hasValue() ? newResult : new End()
    })
  }

  // TODO: prevent memory leaks
  // TODO: mutating, so double check for any bugs
  subscribe(listener: EffectF<Result<T>>): void {
    const { generate, transform } = this

    this.unsubscribe()

    this.subscriber = new Subscriber<S>((value) => listener(transform(value)))
    this.unsubscriber = generate(this.subscriber) || null
  }

  unsubscribe(): void {
    const { subscriber, unsubscriber } = this

    if (unsubscriber) {
      unsubscriber()
    }

    if (subscriber) {
      subscriber.unsubscribe()
    }

    this.subscriber = null
    this.unsubscriber = null
  }
}

import curry from 'lodash/curry'
import { EffectF, GenerateNextF, MapF, Thunk } from './types'
import { PossibleInfiniteLoopError, UnsafeError } from './errors'

const DEFAULT_MAX_LOOPS_WITHOUT_VALUE = 10000

// const identity = <T>(x: T): T => x
const resultIdentity = <T>(x: T): Result<T> => new ResultValue(x)

// interface IProducer<T> {
//   map<U>(f: MapF<T, U>): IProducer<U>
// }
// const myEmitter = new EventEmitter()
// new AsyncProducerEmitter(subscriber => {
//   myEmitter.on('foo', subscriber.next)
// })
// type ListenerF<T> = (value: T) => void
// class Subscriber<T> {
//   listener: ListenerF<T>

//   constructor(listener: ListenerF<T>) {
//     this.listener = listener
//   }

//   next(value: T): void {
//     const { listener } = this
//     listener(value)
//   }
// }
interface Emitter<T> {
  on(event: string, callback: (value: T) => void): void 
  off(event: string, callback: (value: T) => void): void 
}
// class AsyncProducerEmitter<T> {
//   listener: (subscriber: Subscriber<T>) => void

//   // TODO: cleanup to prevent memory leaks
//   static fromEvent<T>(emitter: Emitter<T>, event: string): AsyncProducerEmitter<T> {
//     return new AsyncProducerEmitter((subscriber) => {
//       emitter.on(event, subscriber.next)
//     })
//   }

//   constructor(listener: (subscriber: Subscriber<T>) => void) {
//     this.listener = listener
//   }
// }
// interface IProducer<T> {
// }
// class AsyncProducer<T, U> {
//   emitter: AsyncProducerEmitter<T>
//   // transform: (value: T) => Result<U>

//   // constructor(emitter: AsyncProducerEmitter<T>, transform = resultIdentity) {
//   constructor(emitter: AsyncProducerEmitter<T>) {
//     this.emitter = emitter
//     // this.transform = transform
//   }

//   subscribe(listener) {
//     this.emitter.on
//   }

//   // map<U>(f: MapF<T, U>): AsyncProducer<U> {
//   //   const { transform } = this

//   //   return new AsyncProducer<U>(
//   //     this.thunk,
//   //     (value: T) => transform(value).map(f)
//   //   )
//   // }
//   // map<V>(f: MapF<U, V>): AsyncProducer<T, V> {
//   //   const newEmitter = AsyncProducerEmitter((subscriber) => {
//   //   })

//   //   return new AsyncProducer<U>(
//   //     this.thunk,
//   //     (value: T) => transform(value).map(f)
//   //   )
//   // }
// }
class SyncProducer<T> {
  thunk: Thunk<SyncProducerResult<T>>

  constructor(thunk: Thunk<SyncProducerResult<T>>) {
    this.thunk = thunk
  }

  map<U>(f: MapF<T, U>): SyncProducer<U> {
    const { thunk } = this
    return new SyncProducer(() => thunk().map(f))
  }

  run(): SyncProducerResult<T> {
    const { thunk } = this
    return thunk()
  }
}
interface ISyncProducerResult<T> {
  map<U>(f: MapF<T, U>): ISyncProducerResult<U>
}
class SyncProducerContinue<T> implements ISyncProducerResult<T> {
  result: Result<T>
  next: SyncProducer<T>

  constructor(result: Result<T>, next: SyncProducer<T>) {
    this.result = result
    this.next = next
  }

  map<U>(f: MapF<T, U>): SyncProducerContinue<U> {
    return new SyncProducerContinue(this.result.map(f), this.next.map(f))
  }
}
class SyncProducerEnd<T> implements ISyncProducerResult<T> {
  map<U>(): SyncProducerEnd<U> {
    return this
  }
}
type SyncProducerResult<T> = SyncProducerContinue<T> | SyncProducerEnd<T>
// type Producer<T> = SyncProducer<T> | AsyncProducer<T>

interface IResult<T> {
  map<U>(f: MapF<T, U>): IResult<U>
}
class ResultValue<T> implements IResult<T> {
  value: T

  constructor(value: T) {
    this.value = value
  }

  map<U>(f: MapF<T, U>): ResultValue<U> {
    return new ResultValue(f(this.value))
  }
}
class Filtered<T> implements IResult<T> {
  map<U>(): Filtered<U> {
    return this
  }
}
// class Empty {}
// type Result<T> = ResultValue<T> | Filtered | Empty
type Result<T> = ResultValue<T> | Filtered<T>

interface IStream<T> {
  take(n: number): IStream<T>
}

export class AsyncStream<S, T> implements IStream<T> {
  // private producer: AsyncProducer<T>
  // private limit: number | null
  private emitter: Emitter<S>
  private event: string
  private limit: number | null
  private transform: MapF<S, Result<T>>

  public static fromEvent<S>(emitter: Emitter<S>, event: string): AsyncStream<S, S> {
    return new AsyncStream(emitter, event, resultIdentity)
  }

  constructor(emitter: Emitter<S>, event: string, transform: MapF<S, Result<T>>, limit: number | null = null) {
    this.emitter = emitter
    this.event = event
    this.transform = transform
    this.limit = limit
  }
  // constructor(producer: AsyncProducer<T>, limit: number | null = null) {
  //   this.producer = producer
  //   this.limit = limit
  // }

  map<U>(f: MapF<T, U>): AsyncStream<S, U> {
    const { transform } = this

    return new AsyncStream(
      this.emitter,
      this.event,
      (value: S) => transform(value).map(f),
      this.limit
    )
  }

  take(n: number): AsyncStream<S, T> {
    return new AsyncStream(this.emitter, this.event, this.transform, n)
  }

  subscribe(f: EffectF<T>): void {
    const { emitter, event, limit, transform } = this
    let counter = 0

    // TODO: prevent memory leaks when not limited
    const callback = (value: S) => {
      const result = transform(value)

      if (result instanceof ResultValue) {
        f(result.value)
        counter++
      }

      if (limit != null && counter >= limit) {
        emitter.off(event, callback)
      }
    }

    emitter.on(event, callback)
  }
}
export class SyncStream<T> implements IStream<T> {
  private producer: SyncProducer<T>
  private limit: number | null

  constructor(producer: SyncProducer<T>, limit: number | null = null) {
    this.producer = producer
    this.limit = limit
  }

  take(n: number): SyncStream<T> {
    return new SyncStream(this.producer, n)
  }

  toArray(maxLoopsWithoutValue = DEFAULT_MAX_LOOPS_WITHOUT_VALUE): T[] {
    const array = []
    let { limit } = this

    if (limit === null) {
      throw new UnsafeError()
    }

    let response = this.producer.run()
    let loopsSinceValue = 0

    while (limit > 0 && !(response instanceof SyncProducerEnd)) {
      if (loopsSinceValue > maxLoopsWithoutValue) {
        throw new PossibleInfiniteLoopError()
      }

      const { result } = response

      if (result instanceof ResultValue) {
        array.push(result.value)
        loopsSinceValue = 0
        limit--
      } else {
        loopsSinceValue += 1
      }

      response = response.next.run()
    }

    return array
  }
}
type Stream<T> = SyncStream<T>

// Constructors
// ============

export const sequence: {
  <T>(value: T, generateNext: GenerateNextF<T>): SyncStream<T>
  <T>(value: T): (generateNext: GenerateNextF<T>) => SyncStream<T>
} = curry(<T>(value: T, generateNext: GenerateNextF<T>): SyncStream<T> => {
  const sequenceProducer = (value: T): SyncProducer<T> =>
    new SyncProducer(
      () =>
        new SyncProducerContinue(
          new ResultValue(value),
          sequenceProducer(generateNext(value)),
        ),
    )

  return new SyncStream(sequenceProducer(value))
})

// Operations
// ==========

// export const map: {
//   <T, U>(f: MapF<T, U>, stream: Stream<T>): Stream<U>
//   <T, U>(f: MapF<T, U>): (stream: Stream<T>) => Stream<U>
// } = curry(<T, U>(f: MapF<T, U>, stream: Stream<T>): Stream<U> => stream.map(f))

// export const keep: {
//   <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T>
//   <T>(f: PredicateF<T>): (stream: Stream<T>) => Stream<T>
// } = curry(<T>(f: PredicateF<T>, stream: Stream<T>): Stream<T> => stream.keep(f))

// export const reject: {
//   <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T>
//   <T>(f: PredicateF<T>): (stream: Stream<T>) => Stream<T>
// } = curry(
//   <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T> => stream.reject(f),
// )

export const take: {
  <T>(n: number, stream: Stream<T>): Stream<T>
  <T>(n: number): (stream: Stream<T>) => Stream<T>
} = curry(<T>(n: number, stream: Stream<T>): Stream<T> => stream.take(n))

// export const takeWhile: {
//   <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T>
//   <T>(f: PredicateF<T>): (stream: Stream<T>) => Stream<T>
// } = curry(
//   <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T> => stream.takeWhile(f),
// )

// export const takeUntil: {
//   <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T>
//   <T>(f: PredicateF<T>): (stream: Stream<T>) => Stream<T>
// } = curry(
//   <T>(f: PredicateF<T>, stream: Stream<T>): Stream<T> => stream.takeUntil(f),
// )


// Consumers
// =========

export const toArray = <T>(
  stream: Stream<T>,
  maxLoopsWithoutValue: number = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
): T[] => stream.toArray(maxLoopsWithoutValue)

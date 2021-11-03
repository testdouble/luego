import type SyncStream from '../sync/stream'
import type { MapF, PredicateF } from '../shared/types'
import curry from 'lodash/curry'

export const map: {
  <T, T2>(f: MapF<T, T2>, stream: SyncStream<T>): SyncStream<T2>
  <T, T2>(f: MapF<T, T2>): (stream: SyncStream<T>) => SyncStream<T2>
} = curry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (f: any, stream: any) => stream.map(f),
)

export const keep: {
  <T>(f: PredicateF<T>, stream: SyncStream<T>): SyncStream<T>
  <T>(f: PredicateF<T>): (stream: SyncStream<T>) => SyncStream<T>
} = curry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (f: any, stream: any) => stream.keep(f),
)

export const reject: {
  <T>(f: PredicateF<T>, stream: SyncStream<T>): SyncStream<T>
  <T>(f: PredicateF<T>): (stream: SyncStream<T>) => SyncStream<T>
} = curry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (f: any, stream: any) => stream.reject(f),
)

export const take: {
  <T>(n: number, stream: SyncStream<T>): SyncStream<T>
  (n: number): <T>(stream: SyncStream<T>) => SyncStream<T>
} = curry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (n: number, stream: any) => stream.take(n),
)

export const takeWhile: {
  <T>(f: PredicateF<T>, stream: SyncStream<T>): SyncStream<T>
  <T>(f: PredicateF<T>): (stream: SyncStream<T>) => SyncStream<T>
} = curry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (f: any, stream: any) => stream.takeWhile(f),
)

export const takeUntil: {
  <T>(f: PredicateF<T>, stream: SyncStream<T>): SyncStream<T>
  <T>(f: PredicateF<T>): (stream: SyncStream<T>) => SyncStream<T>
} = curry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (f: any, stream: any) => stream.takeUntil(f),
)

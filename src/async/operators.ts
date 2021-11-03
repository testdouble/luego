import type AsyncStream from '../async/stream'
import type { MapF, PredicateF } from '../shared/types'
import curry from 'lodash/curry'

export const map: {
  <S, T, T2>(f: MapF<T, T2>, stream: AsyncStream<S, T>): AsyncStream<S, T2>
  <T, T2>(f: MapF<T, T2>): <S>(stream: AsyncStream<S, T>) => AsyncStream<S, T2>
} = curry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (f: any, stream: any) => stream.map(f),
)

export const keep: {
  <S, T>(f: PredicateF<T>, stream: AsyncStream<S, T>): AsyncStream<S, T>
  <T>(f: PredicateF<T>): <S>(stream: AsyncStream<S, T>) => AsyncStream<S, T>
} = curry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (f: any, stream: any) => stream.keep(f),
)

export const reject: {
  <S, T>(f: PredicateF<T>, stream: AsyncStream<S, T>): AsyncStream<S, T>
  <T>(f: PredicateF<T>): <S>(stream: AsyncStream<S, T>) => AsyncStream<S, T>
} = curry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (f: any, stream: any) => stream.reject(f),
)

export const take: {
  <S, T>(n: number, stream: AsyncStream<S, T>): AsyncStream<S, T>
  <T>(n: number): <S>(stream: AsyncStream<S, T>) => AsyncStream<S, T>
} = curry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (n: number, stream: any) => stream.take(n),
)

export const takeWhile: {
  <S, T>(f: PredicateF<T>, stream: AsyncStream<S, T>): AsyncStream<S, T>
  <T>(f: PredicateF<T>): <S>(stream: AsyncStream<S, T>) => AsyncStream<S, T>
} = curry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (f: any, stream: any) => stream.takeWhile(f),
)

export const takeUntil: {
  <S, T>(f: PredicateF<T>, stream: AsyncStream<S, T>): AsyncStream<S, T>
  <T>(f: PredicateF<T>): <S>(stream: AsyncStream<S, T>) => AsyncStream<S, T>
} = curry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (f: any, stream: any) => stream.takeUntil(f),
)

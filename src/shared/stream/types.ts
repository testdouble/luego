import type { EffectF, MapF, PredicateF } from '../types'

export interface URIToKind<A> {
  readonly Array: A[]
  readonly Promise: Promise<A>
}

type URIKey = keyof URIToKind<unknown>
type URIKey2 = [URIKey, URIKey]

export type URIs = URIKey | URIKey2

export type Kind<A, URI extends URIs> = URI extends URIKey
  ? URIToKind<A>[URI]
  : URI extends URIKey2
  ? Kind<Kind<A, URI[1]>, URI[0]>
  : never

export type KindArray = 'Array'
export type KindPromise = 'Promise'
export type KindPromiseOf<URI extends URIs> = [KindPromise, URI]

export interface SubscribeOptions {
  onComplete?: EffectF<void>
}

export interface IStream<Data, URI extends URIs> {
  // Operators
  map<Data2>(f: MapF<Data, Data2>): IStream<Data2, URI>
  keep(f: PredicateF<Data>): IStream<Data, URI>
  reject(f: PredicateF<Data>): IStream<Data, URI>
  take(n: number): IStream<Data, URI>
  takeWhile(f: PredicateF<Data>): IStream<Data, URI>
  takeUntil(f: PredicateF<Data>): IStream<Data, URI>

  // Consumers
  subscribe(f: EffectF<Data>, options?: SubscribeOptions): void
  toArray(): Kind<Data, URI>
}

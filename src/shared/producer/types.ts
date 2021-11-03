import type { MapF, PredicateF } from '../types'

export interface IProducer<T> {
  map<U>(f: MapF<T, U>): IProducer<U>
  keep(f: PredicateF<T>): IProducer<T>
  takeWhile(f: PredicateF<T>): IProducer<T>
}

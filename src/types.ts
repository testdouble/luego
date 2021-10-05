export type MapF<T, U> = (t: T) => U
export type PredicateF<T> = (t: T) => boolean
export type EffectF<T> = (t: T) => void
export type Thunk<T> = () => T
export type GenerateNextF<T> = (value: T) => T

export interface IResult<T> {
  map<U>(f: MapF<T, U>): IResult<U>
  keep(f: PredicateF<T>): IResult<T>
  reject(f: PredicateF<T>): IResult<T>
  take(n: number): IResult<T>
  takeWhile(f: PredicateF<T>): IResult<T>
  takeUntil(f: PredicateF<T>): IResult<T>
}

export interface IResult2<T> {
  map<U>(f: MapF<T, U>): IResult2<U>
  // keep(f: PredicateF<T>): IResult2<T>
  // reject(f: PredicateF<T>): IResult2<T>
  // takeWhile(f: PredicateF<T>): IResult2<T>
  // takeUntil(f: PredicateF<T>): IResult2<T>
}

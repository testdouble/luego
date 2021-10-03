export type MapF<T, U> = (t: T) => U
export type PredicateF<T> = (t: T) => boolean
export type EffectF<T> = (t: T) => void
export type Thunk<T> = () => T
export type GenerateNextF<T> = (value: T) => T

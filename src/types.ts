export type MapFunction<T, U> = (t: T) => U
export type PredicateFunction<T> = (t: T) => boolean

export type Thunk<T> = () => T

export type ResultValue<T> = {
  type: 'value'
  value: T
  next: Stream<T>
}

export type Empty = {
  type: 'empty'
}

export type Filtered<T> = {
  type: 'filtered'
  next: Stream<T>
}

export type Result<T> = ResultValue<T> | Empty | Filtered<T>

export type Stream<T> = {
  thunk: Thunk<Result<T>>
  isSafe: boolean
}

export type GenerateNext<T> = (value: T) => T

import { curry } from 'lodash/fp'
import { sequence } from 'src/sync/constructors'
import { create as createAsync } from 'src/async/constructors'

export const increment = (x: number): number => x + 1
export const double = (x: number): number => x * 2
export const gt = curry((x: number, y: number): boolean => y > x)
export const lt = curry((x: number, y: number): boolean => y < x)
export const toString = <T extends { toString(): string }>(x: T): string =>
  x.toString()

export const syncNumbersStream = sequence(1, increment)

export const asyncNumbersStream = createAsync<number>((subscriber) => {
  syncNumbersStream.take(100).subscribe(subscriber.next)
})

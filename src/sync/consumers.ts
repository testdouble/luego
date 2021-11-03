import type SyncStream from '../sync/stream'
import { DEFAULT_MAX_LOOPS_WITHOUT_VALUE } from './constants'

// Consumers
// =========

// export const each = <T>(
//   f: EffectF<T>,
//   stream: Stream<T>,
//   maxLoopsWithoutValue: number = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
// ): void => stream.each(f, maxLoopsWithoutValue)

// export const unsafeEach = <T>(
//   f: EffectF<T>,
//   stream: Stream<T>,
//   maxLoopsWithoutValue: number = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
// ): void => stream.unsafeEach(f, maxLoopsWithoutValue)

// TODO: test
export const toArray = <T>(
  stream: SyncStream<T>,
  maxLoopsWithoutValue: number = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
): T[] => stream.toArray(maxLoopsWithoutValue)

// export const unsafeToArray = <T>(
//   stream: Stream<T>,
//   maxLoopsWithoutValue: number = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
// ): T[] => stream.unsafeToArray(maxLoopsWithoutValue)

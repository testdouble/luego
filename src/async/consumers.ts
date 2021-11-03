import type AsyncStream from '../async/stream'

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
export const toArray = <S, T>(stream: AsyncStream<S, T>): Promise<T[]> =>
  stream.toArray()

// export const unsafeToArray = <T>(
//   stream: Stream<T>,
//   maxLoopsWithoutValue: number = DEFAULT_MAX_LOOPS_WITHOUT_VALUE,
// ): T[] => stream.unsafeToArray(maxLoopsWithoutValue)

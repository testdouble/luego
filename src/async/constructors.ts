import type { SubscriberF } from '../async/producer'
import AsyncStream from '../async/stream'

export const create: { <T>(generate: SubscriberF<T>): AsyncStream<T, T> } =
  AsyncStream.create

export interface Emitter<T> {
  on(event: string, callback: (value: T) => void): void
  off(event: string, callback: (value: T) => void): void
}

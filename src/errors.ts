export class UnsafeNumberError extends Error {
  constructor(n: number) {
    super(`Please provide a finite integer for \`take\`: ${n}.`)
  }
}

export class UnsafeError extends Error {
  constructor() {
    super(
      'Stream unsafe and could produce an infinite loop. Please limit your results with `take(n)`.',
    )
  }
}

export class PossibleInfiniteLoopError extends Error {
  constructor() {
    super(
      "Possible infinite loop.\nCheck any `keep` or `reject` operations that never find a matching value or can't find enough matching values for `take(n)`.",
    )
  }
}

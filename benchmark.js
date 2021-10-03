import { deepEqual as assertDeepEqual } from 'assert'
import { Suite } from 'benchmark'
import { keep, fromArray, map, pipe, take, toArray } from './src'

function runArraySuite(name, length) {
  const double = (n) => n * 2
  const toString = (n) => n.toString()
  const gt20 = (n) => n > 20
  const takeAmount = 10
  const array = Array.from({ length }, (_, i) => i + 1)
  const suite = new Suite(name)

  const arrayImplementation = () =>
    array.map(double).filter(gt20).map(toString).slice(0, takeAmount)

  const streamFunction = pipe(
    fromArray,
    map(double),
    keep(gt20),
    map(toString),
    take(takeAmount),
    toArray,
  )
  const streamFunctionImplementation = () => streamFunction(array)

  const streamChainImplementation = () =>
    fromArray(array)
      .map(double)
      .keep(gt20)
      .map(toString)
      .take(takeAmount)
      .toArray()

  const cycles = []

  assertDeepEqual(arrayImplementation(), streamFunctionImplementation())
  assertDeepEqual(arrayImplementation(), streamChainImplementation())

  return new Promise((resolve) => {
    suite
      .add('native', arrayImplementation)
      .add('stream function', streamFunctionImplementation)
      .add('stream chain', streamChainImplementation)
      .on('cycle', (event) => cycles.push(event.target))
      .on('complete', function () {
        const fastest = this.filter('fastest').map('name')

        resolve({ name, cycles, fastest })
      })
      .run()
  })
}

async function main() {
  const results = await Promise.all([
    runArraySuite('small array', 100),
    runArraySuite('medium array', 1000),
    runArraySuite('large array', 10000),
  ])

  const formattedResults = results
    .map(({ name, cycles, fastest }) => {
      const stats = [...cycles, `Fastest: ${fastest}`]
        .map((x) => `  ${x.toString()}`)
        .join('\n')

      return `${name}\n${stats}`
    })
    .join('\n\n')

  console.log(formattedResults)
}

main()

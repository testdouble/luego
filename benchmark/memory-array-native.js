const name = 'array-native'
const double = (n) => n * 2
const toString = (n) => n.toString()
const gt20 = (n) => n > 20
const array = Array.from({ length: 10000 }, (_, i) => i + 1)

const mbBefore = process.memoryUsage().heapUsed

function main() {
  const result = array.map(double).filter(gt20).map(toString)
  console.log(result[0])
  console.log(result[Math.floor(result.length / 2)])
  console.log(result[result.length - 1])

  const mbAfter = process.memoryUsage().heapUsed

  console.log(
    `${name} memory used: ${((mbAfter - mbBefore) / 1024 / 1024).toFixed(2)}MB`,
  )
}

main()

// import { exec } from 'child_process'
import * as childProcess from 'child_process'
import { resolve } from 'path'
import { promisify } from 'util'

const execFile = promisify(childProcess.execFile)

async function processResult(promise) {
  try {
    const { stdout, stderr } = await promise

    if (stdout) {
      console.log(stdout)
    }

    if (stderr) {
      console.error(stderr)
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

async function execute(filename) {
  const path = resolve('benchmark', filename)
  const outfile = resolve('build', filename)

  await processResult(
    execFile('npx', [
      'esbuild',
      path,
      '--bundle',
      '--platform=node',
      `--outfile=${outfile}`,
    ]),
  )

  await processResult(execFile('node', [outfile]))
}

const handlers = {
  async runtime() {
    await execute('runtime-array.js')
  },

  async memory() {
    await Promise.all([
      execute('memory-array-native.js'),
      execute('memory-stream-function.js'),
      execute('memory-stream-chain.js'),
    ])
  },
}

async function main() {
  const command = process.argv[2]

  if (!command || !(command in handlers)) {
    console.error(
      `Please provide a valid command: ${Object.keys(handlers).join(' | ')}`,
    )
    process.exit(1)
  }

  await handlers[command]()
}

main()

const { spawn } = require('child_process')

const nodeMajor = parseInt(process.versions.node.split('.')[0], 10)
const args = process.argv.slice(2)
const env = { ...process.env }
const nextBin = require.resolve('next/dist/bin/next')

if (nodeMajor >= 17) {
  const extra = '--openssl-legacy-provider'
  env.NODE_OPTIONS = env.NODE_OPTIONS
    ? `${env.NODE_OPTIONS} ${extra}`
    : extra
}

const child = spawn(process.execPath, [nextBin, ...args], {
  stdio: 'inherit',
  env,
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})

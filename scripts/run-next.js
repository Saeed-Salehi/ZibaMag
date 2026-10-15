const { spawn } = require('child_process')

const nodeMajor = parseInt(process.versions.node.split('.')[0], 10)
const args = process.argv.slice(2)
const env = { ...process.env }
const nextBin = require.resolve('next/dist/bin/next')
const command = args[0]

if (nodeMajor >= 17) {
  const extra = '--openssl-legacy-provider'
  env.NODE_OPTIONS = env.NODE_OPTIONS ? `${env.NODE_OPTIONS} ${extra}` : extra
}

if (command === 'dev') {
  env.API_URL = 'http://127.0.0.1:1337'
  env.NEXT_PUBLIC_SITE_URL = 'http://127.0.0.1:3000'
  delete env.NEXT_PUBLIC_API_URL
}

const child = spawn(process.execPath, [nextBin, ...args], {
  stdio: 'inherit',
  env,
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})

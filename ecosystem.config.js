module.exports = {
  apps: [
    {
      name: 'zibamag',
      cwd: '.',
      script: 'yarn',
      args: 'start',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        API_URL: 'http://127.0.0.1:1337',
        NEXT_PUBLIC_SITE_URL: 'https://zibamag.ir',
      },
      max_memory_restart: '512M',
    },
  ],
}

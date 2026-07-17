const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')
const path = require('path')

const withOffline = require('next-offline')

// Do NOT expose API_URL to the client — on production it is 127.0.0.1.
const sharedEnv = {
  env: {},
}

// Always proxy media to loopback Strapi. Do NOT use API_URL here — during
// deploy builds API_URL may be an SSH tunnel port that must not be baked in.
const strapiProxyOrigin =
  process.env.STRAPI_PROXY_URL || 'http://127.0.0.1:1337'

module.exports = (phase) => {
  const uploadsRewrite = {
    source: '/uploads/:path*',
    destination: `${strapiProxyOrigin}/uploads/:path*`,
  }

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...sharedEnv,
      images: {
        domains: ['localhost', '127.0.0.1', 'res.cloudinary.com', '79.141.168.50'],
      },
      async rewrites() {
        return [uploadsRewrite]
      },
    }
  }

  return withOffline({
    ...sharedEnv,
    generateInDevMode: false,
    dontAutoRegisterSw: true,
    generateSw: false,
    workboxOpts: {
      swDest: 'static/service-worker.js',
      swSrc: path.join(__dirname, 'sw.js'),
    },
    images: {
      domains: [
        'localhost',
        '127.0.0.1',
        'res.cloudinary.com',
        '79.141.168.50',
        'zibamag.ir',
      ],
    },
    async rewrites() {
      return [
        uploadsRewrite,
        {
          source: '/service-worker.js',
          destination: '/_next/static/service-worker.js',
        },
      ]
    },
  })
}

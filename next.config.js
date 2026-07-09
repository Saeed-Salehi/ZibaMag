const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

const path = require('path')

const withOffline = require('next-offline')

function withProductionWebpack(config, dev) {
  if (!dev) {
    // Work around postcss/cssnano "unprefixed" crash in Next.js 10 production builds
    config.optimization.minimize = false
  }

  return config
}

// const nextOfflineConfig = {
//   generateInDevMode: false,
//   dontAutoRegisterSw: true,
//   generateSw: false,
//   workboxOpts: {
//     swDest: 'static/service-worker.js',
//     swSrc: path.join(__dirname, 'sw.js'),
//   },
// }

module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      /* Localhost on development for next/image component */
      images: {
        domains: ['localhost', 'res.cloudinary.com', '79.141.168.50'],
      },
    }
  }

  return withOffline({
    generateInDevMode: false,
    dontAutoRegisterSw: true,
    generateSw: false,
    workboxOpts: {
      swDest: 'static/service-worker.js',
      swSrc: path.join(__dirname, 'sw.js'),
    },
    // I'm using cloudinary as a media provider, but you can use any other provider

    // This are the strapi docs of how to set a different provider
    // https://strapi.io/documentation/v3.x/plugins/upload.html#using-a-provider
    // And a list of the available providers
    // https://www.npmjs.com/search?q=strapi-provider-upload-

    // Also, this are the docs of to change the provider on next.js
    // https://nextjs.org/docs/basic-features/image-optimization#configuration

    images: {
      domains: ['res.cloudinary.com', '79.141.168.50'],
    },
    async rewrites() {
      return [
        {
          source: '/service-worker.js',
          destination: '/_next/static/service-worker.js',
        },
      ]
    },
    webpack(config, { dev }) {
      return withProductionWebpack(config, dev)
    },
  })
}

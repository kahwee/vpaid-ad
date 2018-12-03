const webpack = require('./webpack.config.js')
const browsers = !process.env.CI ? ['Chrome'] : ['ChromeHeadlessNoSandbox']
const customLaunchers = !process.env.CI ? {} : {
  // Workaround for permissions issues running Chrome with sandbox in docker
  ChromeHeadlessNoSandbox: {
    base: 'ChromeHeadless',
    flags: ['--no-sandbox']
  }
}
module.exports = function (config) {
  config.set({
    basePath: '.',
    frameworks: ['mocha', 'chai'],
    preprocessors: {
      'tests/*-spec.js': ['webpack'],
      'tests/**/*-spec.js': ['webpack']
    },
    files: [
      './tests/**/*-spec.js',
      {
        pattern: 'tests/fixtures/*.mp4',
        included: false,
        served: true,
        watched: false
      },
      {
        pattern: 'tests/fixtures/style.css',
        included: false,
        served: true,
        watched: false
      }
    ],
    browsers,
    customLaunchers,
    webpack,
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        {
          type: 'lcov',
          subdir: 'report-lcov'
        }
      ]
    },
    webpackMiddleware: {
      noInfo: true,
      stats: {
        chunks: false
      }
    },
    client: {
      mocha: {
        ui: 'bdd',
        reporter: 'html'
      }
    },
    singleRun: !!process.env.CI
  })
}

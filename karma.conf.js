module.exports = function (config) {
  var headless = process.env.CI === 'true'
  const pkg = require('./package.json')
  const browserifyTransform = [['browserify-istanbul', {
    instrumenter: require('babel-istanbul')
  }]].concat(pkg.browserify.transform)
  var preprocessors = {}
  preprocessors['./*.js'] = ['coverage']
  preprocessors['./tests/**/*.js'] = ['browserify']

  var browsers = headless ? ['Chrome_Travis'] : ['Chrome']

  config.set({
    basePath: '.',
    reporters: ['mocha', 'coverage'],
    frameworks: ['browserify', 'mocha', 'chai'],
    browsers: browsers,
    preprocessors: preprocessors,
    files: [
      './tests/**/*-spec.js',
      {
        pattern: 'node_modules/babel-polyfill/dist/polyfill.min.js',
        included: true,
        served: true,
        watched: false
      },
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
    browserify: {
      debug: true,
      transform: browserifyTransform
    },
    client: {
      mocha: {
        reporter: 'html'
      }
    },
    junitReporter: {
      outputFile: '_karma.xml',
      suite: ''
    },
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'lcov',
          subdir: 'report-lcov'
        },
        {
          type: 'cobertura',
          subdir: '.',
          file: 'cobertura.xml'
        }, {
          absolutePath: true,
          type: 'html',
          subdir: '.'
        }
      ]
    },
    mochaReporter: {
      divider: ''
    },
    customLaunchers: {
      Chrome_Travis: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    // logLevel: 'INFO',
    singleRun: headless
  })
}

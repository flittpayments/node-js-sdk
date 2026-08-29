module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    mocha: true,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  overrides: [
    {
      files: ['test/**/*.js'],
      parserOptions: {
        ecmaVersion: 2020
      }
    }
  ],
  plugins: [
    'mocha',
    'chai-expect'
  ]
}

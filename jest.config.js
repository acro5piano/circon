module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverage: false,
  collectCoverageFrom: ['<rootDir>/frontend/**/*.{ts,tsx}', '<rootDir>/api/**/*.{ts,tsx}'],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  testPathIgnorePatterns: ['<rootDir>/build', '\\.snap$', '<rootDir>/node_modules/'],
  cacheDirectory: '.jest/cache',
  timers: 'fake',
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
}

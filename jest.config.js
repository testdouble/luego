module.exports = {
  roots: ['<rootDir>/src/', '<rootDir>/spec/'],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
    'spec/(.*)': '<rootDir>/spec/$1',
  },
}

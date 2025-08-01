// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Configuration spécifique pour les tests d'intégration
const integrationJestConfig = {
  displayName: 'Integration Tests',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/__tests__/integration/**/*.test.ts'],
  testTimeout: 10000,
}

module.exports = createJestConfig(integrationJestConfig)

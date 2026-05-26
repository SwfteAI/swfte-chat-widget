/**
 * Jest configuration (.cjs because package.json sets "type": "module").
 *
 * Without this, Jest fell back to babel-jest, which cannot parse the
 * TypeScript test files (type assertions etc. -> "Unexpected token" /
 * "Missing semicolon"), so `npm test` -> `prepublishOnly` -> release failed.
 * ts-jest is already a devDependency; this wires it up.
 *
 * @type {import('jest').Config}
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    // Compile TS tests with ts-jest; force CommonJS so Jest's runtime can load
    // them (the package tsconfig targets ESNext modules).
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { module: 'CommonJS' } }],
  },
};

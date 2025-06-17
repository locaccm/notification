/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "json", "html"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!**/node_modules/**",
    "!src/**/__tests__/**",
    "!src/lib/**",
  ],
  coveragePathIgnorePatterns: [
    "/src/start.ts"
  ],
  testPathIgnorePatterns: ["/node_modules/", "/src/lib/"],
};

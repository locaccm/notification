/* eslint-env node */
/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: "ts-jest",
  testEnvironment: "node", 
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest", 
  },
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  coverageDirectory: "./coverage",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}", 
    "!src/**/*.d.ts", 
    "!src/tests/**/*", 
  ],
};

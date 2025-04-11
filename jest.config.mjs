/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest", // Utilise ts-jest pour transformer les fichiers TypeScript
  },
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  coverageDirectory: "./coverage",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}", // Prendre en compte les fichiers TypeScript
    "!src/**/*.d.ts", // Ignorer les fichiers de type TypeScript
    "!src/tests/**/*", // Ignorer les tests
  ],
};

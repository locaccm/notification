import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import jsdoc from "eslint-plugin-jsdoc";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
      globals: {
        process: "readonly",
        __dirname: "readonly",
        require: "readonly",
        setTimeout: "readonly",
        console: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
        jest: "readonly",
        global: "readonly",
        NodeJS: "readonly"
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      prettier,
      jsdoc,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      camelcase: ["error", { properties: "always" }],
      "prettier/prettier": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/require-description": "warn",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      globals: {
        test: "readonly",
        expect: "readonly",
      },
    },
  },
];

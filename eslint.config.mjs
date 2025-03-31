import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import jsdoc from "eslint-plugin-jsdoc";

export default [
  pluginJs.configs.recommended,
  prettierConfig,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      globals: {
        module: "readonly",
        require: "readonly",
      },
      parserOptions: {
        ecmaVersion: 2020,
      },
      globals: {
        module: "readonly",
        require: "readonly",
        process: "readonly",
        console: "readonly",
        jest: "readonly",
        describe: "readonly",
        beforeAll: "readonly",
        afterEach: "readonly",
        it: "readonly",
        expect: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      prettier: prettier,
      jsdoc: jsdoc,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      camelcase: ["error", { properties: "always" }],
      "prettier/prettier": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/require-description": "error",
    },
  },
];

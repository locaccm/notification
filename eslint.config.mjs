import pluginJs from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import jsdoc from "eslint-plugin-jsdoc";

export default [
  pluginJs.configs.recommended,
  prettierConfig,
  {
    plugins: {
      prettier: prettier,
      jsdoc: jsdoc,
    },
    languageOptions: {
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
        it: "readonly",
        expect: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      camelcase: "error",
      "prettier/prettier": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/require-description": "error",
    },
  },
];

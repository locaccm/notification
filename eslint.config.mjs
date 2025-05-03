import pluginJs from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import jsdoc from "eslint-plugin-jsdoc";

export default [
  pluginJs.configs.recommended,
  prettierConfig,
  {
    plugins: {
      prettier,
      jsdoc,
    },
    languageOptions: {
      globals: {
        Iterator: "readonly",
        module: "readonly",
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
        exports: "readonly",
        console: "readonly",
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

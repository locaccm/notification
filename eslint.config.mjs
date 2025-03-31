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
      globals: {
        module: "readonly", // Déclare module comme global
        require: "readonly", // Déclare require comme global
        process: "readonly", // Déclare process comme global
        console: "readonly", // Déclare console comme global
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn", // Les variables globales définies par Node.js ne poseront plus de problèmes ici
      camelcase: "error",
      "prettier/prettier": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/require-description": "error",
    },
  },
];

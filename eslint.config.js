// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
  // Configuração para ignorar pastas
  {
    ignores: ["node_modules/", "dist/", "functions/node_modules/"],
  },

  // Configuração para o código React (pasta src/)
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Regra desnecessária com Vite/React 17+
      "react/prop-types": "off", // Desativa a verificação de prop-types por agora
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Configuração específica para o código do servidor (pasta functions/)
  {
    files: ["functions/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node, // Habilita globais do Node.js como 'require', 'module', 'exports'
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      "no-undef": "error",
      "quotes": ["error", "double"],
    },
  },
];
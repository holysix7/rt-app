import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";


export default [
  js.configs.recommended,
  tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
    },
    rules: {
      // General JS/TS best practices
      "prefer-const": "warn",
      "no-var": "error",
      "no-unused-vars": "off",
      "object-shorthand": "warn",
      "quote-props": ["warn", "as-needed"],
      curly: ["error", "all"], // Matches Biome's useConsistentCurlyBraces + useBlockStatements
      "no-console": "error", // Matches Biome's noConsole: "error"
      "no-debugger": "error",
      "no-constant-condition": "error",
      "no-empty-pattern": "error",
      "no-unreachable": "error",
      eqeqeq: ["warn", "always", { null: "ignore" }],
      // TypeScript
      "@typescript-eslint/array-type": ["error", { default: "generic" }], // Matches Biome's useConsistentArrayType (Array<T>)
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"], // Matches Biome's useConsistentTypeDefinitions
      // React
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-fragments": ["warn", "syntax"],
      "react/jsx-filename-extension": ["warn", { extensions: [".ts", ".tsx"] }],
      "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
      // React Router (encourage hooks, discourage legacy context)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Import order
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"]],
          "newlines-between": "ignore",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "./app/globals.css": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      "build/**",
      "dist/**",
      "coverage/**",
      ".next/**",
      "out/**",
      "*.d.ts",
      "**/*.d.ts",
      "**/build/**",
      "**/dist/**",
      "**/test-results/**",
      "**/playwright-report/**",
      "**/*.test.*",
      "**/*.spec.*",
      "apps/docs/**", // internal documentation app, no need for linting
      "apps/admin/**", // depcreated app
      "apps/recruiterpal/**", // depcreated app
      "packages/core/**", // depcreated pacakge
    ],
  },
  prettierConfig,
  // Re-enable code quality rules that Prettier disables but don't actually conflict with formatting
  // These align with Biome's linter rules for consistency
  {
    rules: {
      curly: "error", // Enforce curly braces (matches Biome's useBlockStatements)
      "no-unexpected-multiline": "error", // Prevent ASI issues
      "no-mixed-operators": "warn", // Improve readability with explicit precedence
    },
  },
];

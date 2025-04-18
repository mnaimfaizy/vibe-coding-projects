// Using CommonJS format for compatibility
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const js = require("@eslint/js");
const globals = require("globals");

// Determine if we're in production based on NODE_ENV
const isProduction = process.env.NODE_ENV === "production";

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  // Base ESLint recommended rules
  js.configs.recommended,

  // Ignore the dist directory
  {
    ignores: ["dist/**/*"],
  },

  // TypeScript rules
  {
    files: ["**/*.ts"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    rules: {
      // Allow console statements in development, warn in production
      "no-console": isProduction ? "warn" : "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      ...tseslint.configs.recommended.rules,
    },
  },

  // Environment settings for all files
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        // Equivalent to env.node, env.jest, and env.es6
        ...Object.fromEntries(
          Object.entries(globals.node)
            .concat(Object.entries(globals.jest))
            .concat(Object.entries(globals.es2020))
        ),
      },
    },
  },
];

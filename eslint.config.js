import parser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["node_modules/**", ".next/**"],
  },
  {
    files: ["**/*.{js,cjs,mjs,ts,tsx}"],
    languageOptions: {
      parser,
    },
    rules: {},
  },
];

import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
    { ignores: ["dist", "build", "coverage"] },
    { linterOptions: { reportUnusedDisableDirectives: true } },
    js.configs.recommended,
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
            },
        },
        plugins: {
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/jsx-uses-react": "off",
            "react/prop-types": "off",
            "no-unused-vars": [
                "error",
                {
                    varsIgnorePattern: "^[A-Z_]",
                    argsIgnorePattern: "^_",
                    ignoreRestSiblings: true,
                },
            ],
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
        },
        settings: {
            react: { version: "detect" },
        },
    },
    {
        files: ["**/*.{test,spec}.{js,jsx}"],
        languageOptions: {
            globals: {
                ...globals.browser,
                vi: true,
                describe: true,
                it: true,
                expect: true,
                global: true,
            },
        },
    },
    {
        files: [
            "*.config.{js,cjs,mjs}",
            "scripts/**/*.{js,jsx}",
            "eslint.config.js",
        ],
        languageOptions: { globals: { ...globals.node } },
    },
];

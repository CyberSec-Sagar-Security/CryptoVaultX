import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  // Ignore patterns
  {
    ignores: ['dist', 'node_modules', '*.config.js'],
  },
  
  // Main configuration
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // JavaScript recommended rules
      ...js.configs.recommended.rules,
      
      // React recommended rules
      ...react.configs.recommended.rules,
      
      // React Hooks rules
      ...reactHooks.configs.recommended.rules,
      
      // React Refresh rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Disable React in scope rule (not needed in modern React)
      'react/react-in-jsx-scope': 'off',
      
      // Code quality rules
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        caughtErrors: 'none',
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      
      // React Hooks rules
      'react-hooks/exhaustive-deps': 'warn',
      
      // Import/Export rules
      'no-duplicate-imports': 'error',
      
      // Style rules (basic)
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
]

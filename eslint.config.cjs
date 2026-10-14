const FS = require('fs')
const Path = require('path')
const yaml = require('yaml')
const globals = require('globals')

// The rules come from the app that has this repo as a submodule.
const rules = yaml.parse(FS.readFileSync(Path.resolve(__dirname, '../eslint.rules.yml'), 'utf-8'))

module.exports = [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
    ],
  },

  {
    files: [
      '*/*/src/**/*.ts',
    ],

    languageOptions: {
      globals: {
        ...globals.es2022,
        ...globals.browser,
      },

      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaVersion: 2022,
      },
    },

    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      '@stylistic': require('@stylistic/eslint-plugin'),
      'unused-imports': require('eslint-plugin-unused-imports'),
      '@mosdev': require('@mosdev/eslint-plugin'),
    },

    rules,
  },

  {
    files: [
      '*/server/src/**/*.ts',
    ],

    languageOptions: {
      globals: {
        ...globals.es2022,
        ...globals.node,
      },
    },
  },
]

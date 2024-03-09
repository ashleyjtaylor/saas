/** @type {import("eslint").Linter.Config} */
module.exports = {
  $schema: 'https://json.schemastore.org/eslintrc',
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json'
      }
    }
  },
  ignorePatterns: ['dist', 'cdk.out'],
  rules: {
    'max-len': ['error', { 'code': 160 }],
    'eol-last': 'error',
    'comma-dangle': 'error',
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    indent: ['error', 2, { 'SwitchCase': 1 }],
    'no-trailing-spaces': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }
    ]
  }
}

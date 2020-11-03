module.exports = {
  env: {
    'react-native/react-native': true,
  },
  parser: 'babel-eslint',
  extends: [
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-native',
  ],
  rules: {
    'no-console': ['warn', { allow: ['error'] }],
    'react/jsx-filename-extension': [1, { extensions: ['js'] }],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
  },
};

module.exports = {
  "extends": ["ash-nazg/sauron"],
  "parserOptions": {
    "sourceType": "module"
  },
  "settings": {
    "polyfills": [
      'fetch',
      'Reflect'
    ]
  },
  "env": {
    "node": false,
    "browser": true
  },
  overrides: [
    {
      files: '*.md',
      globals: {
        require: true,
        IMF: true
      },
      rules: {
        'import/unambiguous': 0,
        'import/no-commonjs': 0,
        'import/no-unresolved': 0,
        'no-alert': 0,
        'no-console': 0,
        'no-shadow': ['error', {allow: ['IMF']}],
        'no-unused-vars': ['error', {varsIgnorePattern: 'IMF'}]
      }
    }
  ],
  "rules": {
  }
};

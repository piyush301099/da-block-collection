// Isolated from the repo's browser/airbnb config: this project runs in the Cloudflare Workers runtime.
module.exports = {
  root: true,
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    es2022: true,
  },
  globals: {
    caches: 'readonly',
    fetch: 'readonly',
    Request: 'readonly',
    Response: 'readonly',
  },
};

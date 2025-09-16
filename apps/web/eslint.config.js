import config from '@snappo/eslint-config/nuxt.js'

export default [
  {
    ignores: ['.nuxt', '.output', 'dist', 'coverage', 'node_modules'],
  },
  ...config,
]

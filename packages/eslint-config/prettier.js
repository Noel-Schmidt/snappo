import eslintConfigPrettier from 'eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier'

export default [
  eslintConfigPrettier,
  {
    plugins: { prettier: pluginPrettier },
    rules: { 'prettier/prettier': 'warn' },
  },
]

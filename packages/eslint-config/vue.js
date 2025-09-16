module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  plugins: ['vue', '@typescript-eslint'],
  extends: ['plugin:vue/vue3-recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'off',
  },
}

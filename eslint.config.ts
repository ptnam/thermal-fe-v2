import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      'prettier/prettier': 'error',
      'no-useless-escape': 0,
      'no-undef': 0,
      '@typescript-eslint/no-unused-expressions': 0,
      '@typescript-eslint/no-unsafe-function-type': 0,
      'vue/no-setup-props-destructure': 0,
      'vue/script-setup-uses-vars': 1,
      'vue/no-reserved-component-names': 0,
      '@typescript-eslint/ban-ts-ignore': 0,
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/no-empty-function': 0,
      'vue/custom-event-name-casing': 0,
      'no-use-before-define': 0,
      '@typescript-eslint/no-use-before-define': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/ban-types': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/no-unused-vars': 0,
      'no-unused-vars': 0,
      'space-before-function-paren': 0,
      'vue/attributes-order': 0,
      'vue/one-component-per-file': 0,
      'vue/html-closing-bracket-newline': 0,
      'vue/max-attributes-per-line': 0,
      'vue/multiline-html-element-content-newline': 0,
      'vue/singleline-html-element-content-newline': 0,
      'vue/attribute-hyphenation': 0,
      'vue/require-default-prop': 0,
      'vue/require-explicit-emits': 0,
      'vue/html-self-closing': [
        1,
        {
          html: {
            void: 'always',
            normal: 'never',
            component: 'always'
          },
          svg: 'always',
          math: 'always'
        }
      ],
      'vue/multi-word-component-names': 0,
      'vue/no-v-html': 0,
      'vue/require-toggle-inside-transition': 0,
      "printWidth": 80,                     // shorter = breaks earlier
      "htmlWhitespaceSensitivity": "ignore",
      "singleQuote": true,
      "semi": false,
      "tabWidth": 2,
      "bracketSameLine": false,
    },
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  ...pluginOxlint.configs['flat/recommended'],
  skipFormatting,

)

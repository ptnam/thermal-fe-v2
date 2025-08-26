<script setup lang="ts">
import { computed, ref, unref } from 'vue'
import { useLocaleStore } from '@/store/modules/locale'
import { useLocale } from '@/hooks/web/useLocale'

const localeStore = useLocaleStore()

const langMap = computed(() => localeStore.getLocaleMap)

const currentLang = computed(() => localeStore.getCurrentLocale)
const modelLang = ref(currentLang.value.lang)

const setLang = (lang: LocaleType) => {
  if (lang === unref(currentLang).lang) return
  localeStore.setCurrentLocale({
    lang,
  })
  const { changeLocale } = useLocale()
  changeLocale(lang)
}
</script>

<template>
  <el-select v-model="modelLang" placeholder="Select" size="large" @change="setLang">
    <el-option v-for="item in langMap" :key="item.lang" :label="item.name" :value="item.lang" />
  </el-select>
</template>

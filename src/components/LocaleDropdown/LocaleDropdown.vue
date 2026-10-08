<script setup lang="ts">
import { computed } from 'vue'
import { useLocaleStore } from '@/store/modules/locale'
import { useLocale } from '@/hooks/web/useLocale'
import { useLang } from '@/hooks/web/useI18n'

const { t } = useLang()
const localeStore = useLocaleStore()
const { changeLocale } = useLocale()

const langMap = computed(() => localeStore.getLocaleMap)
const currentLang = computed(() => localeStore.getCurrentLocale.lang)

const setLang = (lang: LocaleType) => {
  if (lang !== currentLang.value) changeLocale(lang)
}
</script>

<template>
  <el-dropdown trigger="click" @command="setLang">
    <button type="button" class="locale-btn" :title="t('common.language')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M2 12h20"></path>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <span>{{ currentLang.toUpperCase() }}</span>
    </button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in langMap"
          :key="item.lang"
          :command="item.lang"
          :class="{ 'is-current': item.lang === currentLang }"
        >
          {{ item.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
.locale-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-sub);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}

[data-theme='dark'] .locale-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.is-current {
  color: var(--el-color-primary);
  font-weight: 600;
}
</style>

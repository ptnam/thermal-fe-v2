<template>
  <el-button
      class="float-end mb-2"
      type="primary"
      :icon="Plus"
      v-bind="$attrs"
  >
    {{ t('buttons.add_new') }}
  </el-button>
</template>
<script lang="ts" setup>
import {Plus} from '@element-plus/icons-vue'
import {useLang} from "@/hooks/web/useI18n";

const {t} = useLang()

</script>
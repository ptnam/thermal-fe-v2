<template>
  <el-dropdown trigger="click">
    <el-badge :value="total" class="cursor-pointer">
      <el-icon size="medium" class="p-0">
        <Bell/>
      </el-icon>
    </el-badge>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
            v-for="(item, index) in newsList"
            :key="index"
            :divided="index !== 0"
            class="whitespace-normal"
            @click="() => router.push({name: 'event_history_detail', query: {id:item.id, dataTime:item.dataTime}})"
        >
          <div class="w-[250px]">
            <div class="text-sm">{{ item.warningEventName }}</div>
            <div class="flex justify-between mt-2">
              <div class="font-semibold text-sm">{{ item.areaName }}</div>
              <div class="text-sm">{{ item.dateData }} {{ item.timeData }}</div>
            </div>
            <div class="flex justify-between mt-2">
              <div class="text-sm text-gray-500">{{ item.machineName }}</div>
              <div class="text-sm text-gray-500">{{ item.machineComponentName }}</div>
            </div>
          </div>
        </el-dropdown-item>

        <el-dropdown-item divided>
          <router-link class="block w-full text-center text-blue-500 hover:underline text-sm"
                       to="/event/notification-system">Xem tất cả
          </router-link>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {Bell} from '@element-plus/icons-vue'
import {lastestBriefApi} from '@/api/notification'
import router from "@/router";

const newsList = ref<any[]>([])
const total = ref();
const getNotices = () => {
  lastestBriefApi().then((res: any) => {
    newsList.value = res.data?.notifications ?? []
    total.value = res.data.total ?? ''
  })
}
onMounted(() => {
  getNotices()
})
</script>

<template>
  <div class="notif-wrapper">
    <el-button class="notif-btn" @click="toggleNotifDropdown">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <span class="notif-badge">{{ total }}</span>
    </el-button>
    <div v-show="visibleDropdown" class="fixed w-screen h-screen bg-blue top-0 left-0" @click="toggleNotifDropdown"> </div>
    <div v-show="visibleDropdown" class="notif-dropdown">
      <div class="notif-list">
        <a
            v-for="(item, index) in newsList"
            :key="index" href="#"
            class="notif-item"
            @click="() => redirect(item)"
        >
          <div class="notif-title">{{ item?.warningEventName }}</div>
          <div class="notif-main-row">
            <div class="notif-source">{{ item.areaName }}</div>
            <div class="notif-time">{{ item.dateData }}</div>
          </div>
          <div class="notif-bottom-row">
            <span>{{ item.machineName }}</span>
            <span>{{ item.machineComponentName }}</span>
          </div>
        </a>
      </div>
      <div class="notif-footer">
        <router-link class="btn-view-all"
                     to="/event/notification-system">Xem tất cả
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {lastestBriefApi} from '@/api/notification'
import { useRouter } from 'vue-router'
const router = useRouter();

const newsList = ref<any[]>([])
const total = ref();
const visibleDropdown = ref(false);
const getNotices = () => {
  lastestBriefApi().then((res: any) => {
    newsList.value = res.data?.notifications ?? []
    total.value = res.data.total ?? ''
  })
}

const redirect = (item: any) => {
  router.push({name: 'event_history_detail', query: {id:item.id, dataTime:item.dataTime}})
}
const toggleNotifDropdown = () => {
  visibleDropdown.value = !visibleDropdown.value;
}
onMounted(() => {
  getNotices()
})
</script>

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import Layout from '@/layout/index.vue'
import { downloadFileFromUrl } from '@/utils/fileUtil'

const constantRoutes: AppRouteRecordRaw[] = [
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { icon: 'dashboard', permission: ['home'] },
      },
    ],
  },
  {
    path: '/live',
    component: Layout,
    meta: { icon: 'table', permission: ['live'] },
    children: [
      {
        path: '',
        name: 'live',
        component: () => import('@/views/live/StreamPage.vue'),
        meta: { icon: 'camera', permission: ['live'] },
      },
      {
        path: 'detail/:id',
        name: 'live_detail',
        component: () => import('@/views/live/StreamDetail.vue'),
        meta: { icon: 'camera', permission: ['live'] },
      },
    ],
  },
  {
    path: '/event',
    component: Layout,
    redirect: '/event/ai-notification',
    name: 'event',
    meta: { icon: 'map_pointer', permission: ['monitoring'] },
    children: [
      {
        path: 'ai-notification',
        name: 'ai_system',
        component: () => import('@/views/event/ai-notification.vue'),
        meta: { icon: 'setting-bell', permission: ['ai-monitoring'] },
      },
      {
        path: 'vision-event-history/detail',
        name: 'vision_event_history_detail',
        component: () => import('@/views/event/vision-event-history/detail.vue'),
        hidden:true,
        meta: { icon: 'history', permission: ['monitoring'], hidden: true },
      },
      {
        path: 'notification-system',
        name: 'notification_system',
        component: () => import('@/views/event/notification-system.vue'),
        meta: { icon: 'bell', permission: ['monitoring'] },
      },
      {
        path: 'event-history',
        name: 'event_history',
        component: () => import('@/views/event/event-history.vue'),
        meta: { icon: 'history', permission: ['monitoring'] },
      },
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/event/home.vue'),
        meta: { icon: 'chart', permission: ['monitoring'] },
      },
      {
        path: 'event-history/detail',
        name: 'event_history_detail',
        component: () => import('@/views/event/notification-system-detail.vue'),
        hidden:true,
        meta: { icon: 'history', permission: ['monitoring'], hidden: true },
      },
    ],
  },
  {
    path: '/setting',
    component: Layout,
    redirect: '/setting/notification-group',
    name: 'notification_setting',
    meta: { icon: 'bell', permission: ['warning-settings'] },
    children: [
      {
        path: 'notification-channel',
        name: 'notification_channel',
        component: () => import('@/views/notification/channel-list.vue'),
        meta: { icon: 'bell', permission: ['warning-settings'] },
      },
      {
        path: 'notification-group',
        name: 'notification_group',
        component: () => import('@/views/notification/group-list.vue'),
        meta: { icon: 'menu', permission: ['warning-settings'] },
      },
    ],
  },
  {
    path: '/category',
    component: Layout,
    redirect: '/category/area',
    name: 'category',
    meta: { icon: 'menu', permission: ['common-list'] },
    children: [
      {
        path: 'area',
        name: 'area',
        component: () => import('@/views/category/area/area-list.vue'),
        meta: { icon: 'map', permission: ['common-list'] },
      },
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/category/user/user-list.vue'),
        meta: { icon: 'user', permission: ['common-list'] },
      },
      {
        path: 'camera-list',
        name: 'camera_list',
        component: () => import('@/views/category/camera/camera-list.vue'),
        meta: { icon: 'menu-camera', permission: ['common-list'] },
      },

      {
        path: 'camera-sensor',
        name: 'device_sensor',
        component: () => import('@/views/category/sensor/sensor-list.vue'),
        meta: { icon: 'sensor', permission: ['common-list'] },
      },

      {
        path: 'machine-type',
        name: 'machine_type_list',
        component: () => import('@/views/category/machine-type/machine-type-list.vue'),
        meta: { icon: 'transformer', permission: ['common-list'] },
      },
      {
        path: 'machine-list',
        name: 'machine_station',
        component: () => import('@/views/category/machine/machine-list.vue'),
        meta: { icon: 'factory', permission: ['common-list'] },
      },
      {
        path: 'machine-part/:machineTypeId',
        name: 'machine_part',
        component: () => import('@/views/category/machine-part/machine-part-list.vue'),
        hidden: true,
      },
    ],
  },
    {
        path: '/report',
        component: Layout,
        name: 'report',
        meta: { icon: 'chart', permission: ['manual'] },
        children: [
            {
                path: 'download/CGI Manual.pdf',
                name: 'user_manual',
                meta: { icon: 'chart', permission: ['manual'] },
                beforeEnter: (_to, _from, next) => {
                    const fileUrl = '/download/huong-dan.pdf'
                    downloadFileFromUrl(fileUrl, 'Hướng dẫn sử dụng.pdf')
                    next(false)
                },
            },
            // {
            //   path: 'temperature-report',
            //   name: 'temperature_report',
            //   component: () => import('@/views/notification/group-list.vue'),
            //   meta: { icon: 'chart', permission: ['reporting'] },
            // },
        ],
    },
  {
    path: '/login',
    component: () => import('@/views/auth/login.vue'),
    hidden: true,
  },
  {
    path: '/change-password',
    component: () => import('@/views/auth/change-password.vue'),
    hidden: true,
  },
  {
    path: '/404',
    component: () => import('@/views/error/404.vue'),
    hidden: true,
  },
  {
    path: '/403',
    component: () => import('@/views/error/403.vue'),
    name: "403",
    hidden: true,
  },
  { path: '/:pathMatch(.*)*', redirect: '/404', hidden: true },
]

const history = createWebHistory()

const router = createRouter({
  history: history,
  strict: true,
  routes: constantRoutes as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 }),
})
export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router

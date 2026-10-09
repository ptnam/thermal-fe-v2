import { defineStore } from 'pinia'
import { store } from '@/store'
import { UserType } from '@/api/login/types'
import { ElMessageBox } from 'element-plus'
import router from '@/router'
import { logoutApi, myProfileApi, refreshTokenApi } from '@/api/login'
import { getFirebaseToken } from '@/plugins/firebase/firebase'
import { useLang } from '@/hooks/web/useI18n'

let refreshTimer: number | null = null

interface UserState {
  userInfo?: UserType
  accessToken: string
  refreshToken: string
  expiresAt: number
  roleRouters?: string[] | AppCustomRouteRecordRaw[]
  rememberMe: boolean
  permissions: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    return {
      userInfo: undefined,
      accessToken: '',
      refreshToken: '',
      expiresAt: 0 as number, // timestamp (milliseconds)
      rememberMe: true,
      permissions: [] as string[],
    }
  },
  getters: {
    isAdmin(): boolean {
      return this?.userInfo?.roleNames === 'Admin';
    },
    getAccessToken(): string {
      return this.accessToken
    },
    isAuthenticated(): boolean {
      return !!this.getAccessToken
    },
    getUserInfo(): UserType | undefined {
      return this.userInfo
    },
    getRoleRouters(): string[] | AppCustomRouteRecordRaw[] | undefined {
      return this.roleRouters
    },
    getRememberMe(): boolean {
      return this.rememberMe
    },
    getUserName(): string | undefined {
      return this.userInfo?.username
    },
  },
  actions: {
    updateStates(state: Partial<UserState>) {
      this.$state = { ...this.$state, ...state }
    },
    normalizePermissions(user: any): string[] {
      const raw = user?.permissions ?? user?.features
      if (!Array.isArray(raw)) return []
      return raw
        .map((item: any) => (typeof item === 'string' ? item : (item?.featureCode ?? item?.code)))
        .filter((code: unknown): code is string => typeof code === 'string' && code.length > 0)
    },
    updateStatesFromResponse(res: any) {
      const expireAt = new Date(res.data.refreshTokenExpiryTime).getTime()
      const user = expireAt ? res.data.user : res.data
      const permissions = this.normalizePermissions(user)
      let states = {
        userInfo: res.data,
        permissions,
      } as object
      if (expireAt) {
        states = {
          userInfo: res.data.user,
          accessToken: res.data.token,
          refreshToken: res.data.refreshToken,
          permissions,
          expiresAt: expireAt,
        }
      }
      this.updateStates(states)
      this.loadScheduleRefresh()
    },
    logoutConfirm() {
      const { t } = useLang()
      ElMessageBox.confirm(t('common.logoutConfirm'), '', {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }).then(async () => {
        const token = await getFirebaseToken();
        try {
          await logoutApi({
            firebaseToken: token,
            deviceType: 'web'
          })
        }finally {
          this.resetAndRedirectToLogin()
        }
      })
    },
    reset() {
      this.updateStates({ userInfo: undefined, accessToken: '', refreshToken: '', expiresAt: 0 })
    },
    resetAndRedirectToLogin() {
      this.reset()
      void router.replace('/login')
    },
    async loadCurrentUser() {
      await myProfileApi().then((res) => {
        this.updateStatesFromResponse(res)
      })
    },
    loadScheduleRefresh() {
      if (this.accessToken && this.refreshToken && this.expiresAt) {
        this.scheduleRefresh()
      }
    },
    scheduleRefresh() {
      if (refreshTimer) clearInterval(refreshTimer)
      const refreshBeforeMs = 30 * 1000 // refresh trước khi hết hạn 30s
      const timeLeft = this.expiresAt - Date.now() - refreshBeforeMs
      if (timeLeft <= 0) {
        void this.refreshTokenAction()
        return
      }
      refreshTimer = setTimeout(() => {
        void this.refreshTokenAction()
      }, timeLeft)
    },

    async refreshTokenAction() {
      try {
        const res = await refreshTokenApi({
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
        })
        this.updateStatesFromResponse(res)
        console.log('[Auth] Token refreshed successfully')
      } catch (err) {
        console.error('[Auth] Refresh token failed', err)
        this.resetAndRedirectToLogin()
      }
    },
  },
  persist: true,
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}

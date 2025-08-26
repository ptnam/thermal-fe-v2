import { useUserStore } from '@/store/modules/user'

export function usePermission() {
  const userStore = useUserStore()

  const hasPermission = (required: string[] = []) => {
    if (!required.length) return true
    return required.some((p) => userStore.permissions.includes(p))
  }

  return {
    hasPermission,
  }
}

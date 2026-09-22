import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'

// ApexCharts vẽ chữ/lưới bằng màu cứng truyền qua options (SVG fill/style), KHÔNG tự đổi theo CSS
// var(--text-*) như khung card - nên các widget PD (pd-summary.vue) phải tự tính lại màu theo
// app.isDark mỗi khi đổi dark/light. Giá trị màu lấy theo đúng --text-sub/--border của theme hiện tại.
export function useChartTheme() {
  const appStore = useAppStore()
  const isDark = computed(() => appStore.isDark)
  const axisTextColor = computed(() => (isDark.value ? '#CBD5E1' : '#64748b'))
  const gridColor = computed(() => (isDark.value ? '#334155' : '#e5e7eb'))
  const legendTextColor = computed(() => (isDark.value ? '#F8FAFC' : '#0f172a'))
  const tooltipTheme = computed<'dark' | 'light'>(() => (isDark.value ? 'dark' : 'light'))

  return { isDark, axisTextColor, gridColor, legendTextColor, tooltipTheme }
}

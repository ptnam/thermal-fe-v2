// Đồng bộ ngôn ngữ cho các thư viện không đi qua vue-i18n (Element Plus đổi qua el-config-provider)
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import apexVi from 'apexcharts/dist/locales/vi.json'
import apexEn from 'apexcharts/dist/locales/en.json'

export const applyLibraryLocale = (lang: LocaleType) => {
  dayjs.locale(lang)
  // Cấu hình global của ApexCharts, áp cho các chart được tạo sau đó
  ;(window as any).Apex = {
    ...(window as any).Apex,
    chart: { ...(window as any).Apex?.chart, locales: [apexVi, apexEn], defaultLocale: lang },
  }
}

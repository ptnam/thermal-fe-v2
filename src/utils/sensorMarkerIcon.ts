// Icon marker dùng chung cho SensorMarker.vue (L.divIcon) - tách riêng để thêm biến thể PD (bolt)
// mà không đụng tới icon nhiệt độ mặc định đang dùng.

export interface SensorMarkerIconOptions {
  iconColor?: string
  isBlink?: boolean
  iconVariant?: string
}

export interface SensorMarkerIcon {
  html: string
  className: string
  size: [number, number]
  anchor: [number, number]
}

export function buildSensorMarkerIcon(options: SensorMarkerIconOptions = {}): SensorMarkerIcon {
  const { iconColor = '#dd0c44', isBlink = false, iconVariant = 'default' } = options

  if (iconVariant === 'pd') {
    // SVG tia sét fill động theo iconColor - không dùng emoji ⚡ vì màu emoji cố định theo hệ điều
    // hành/trình duyệt, không đổi được theo mức Tốt/Khá/TB/Xấu.
    const boltSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
  <path fill="${iconColor}" stroke="#333" stroke-width="0.5" stroke-linejoin="round"
    d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>
</svg>`
    return {
      html: boltSvg,
      className: isBlink ? 'blink pd-icon-wrapper' : 'pd-icon-wrapper',
      size: [28, 28],
      anchor: [14, 24],
    }
  }

  const svgHtml = `<svg class="thermometer-icon" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
</svg>`
  return {
    html: svgHtml,
    className: isBlink ? 'blink' : '',
    size: [20, 20],
    anchor: [10, 10],
  }
}

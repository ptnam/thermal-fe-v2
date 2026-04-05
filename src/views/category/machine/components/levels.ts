import {
  TEMPERATURE_LEVEL_GOOD,
  TEMPERATURE_LEVEL_FAIR,
  TEMPERATURE_LEVEL_AVERAGE,
  TEMPERATURE_LEVEL_BAD
} from "@/constants"

export const defaultLevels = [
  {
    label: "Mức 1 - Tốt",
    note: "Nhiệt độ bình thường",
    fromText: "",
    toText: "<=",
    color: "bg-[green]",
    level: TEMPERATURE_LEVEL_GOOD,
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>`
  },
  {
    label: "Mức 2 - Chú ý",
    note: "Cần theo dõi",
    fromText: ">",
    toText: "<=",
    color: "bg-[blue]",
    level: TEMPERATURE_LEVEL_FAIR,
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                <circle cx="12" cy="12" r="10"></circle>
                            </svg>`
  },
  {
    label: "Mức 3 - Cảnh báo",
    note: "Cần xử lý sớm",
    fromText: ">",
    toText: "<=",
    color: "bg-[orange]",
    level: TEMPERATURE_LEVEL_AVERAGE,
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z">
                                </path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>`
  },
  {
    label: "Mức 4 - Nguy hiểm",
    note: "Cần xử lý ngay",
    fromText: ">",
    toText: "<=",
    color: "bg-[red]",
    level: TEMPERATURE_LEVEL_BAD,
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>`
  },
]

import {
    TEMPERATURE_LEVEL_GOOD,
    TEMPERATURE_LEVEL_FAIR,
    TEMPERATURE_LEVEL_AVERAGE,
    TEMPERATURE_LEVEL_BAD
} from "@/constants"
export const defaultLevels = [
    {
        label: "Tốt",
        fromText: "",
        toText: "<=",
        color: "bg-[green]",
        level: TEMPERATURE_LEVEL_GOOD
    },
    {
        label: "Khá",
        fromText: ">",
        toText: "<=",
        color: "bg-[blue]",
        level: TEMPERATURE_LEVEL_FAIR
    },
    {
        label: "Trung bình",
        fromText: ">",
        toText: "<=",
        color: "bg-[orange]",
        level: TEMPERATURE_LEVEL_AVERAGE
    },
    {
        label: "Xấu",
        fromText: ">",
        toText: "<=",
        color: "bg-[red]",
        level: TEMPERATURE_LEVEL_BAD
    },
]
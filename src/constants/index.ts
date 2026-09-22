export const CONTENT_TYPE: AxiosContentType = 'application/json'

export const REQUEST_TIMEOUT = 600000

export const NO_REDIRECT_WHITE_LIST = ['/login', '/change-password', '/403', '/404']

export const STATUS_ACTIVE = 'Active'
export const STATUS_INACTIVE = 'Inactive'
export const CAMERA_NORMAL_TYPE = 'Normal'
export const CAMERA_THERMAL_TYPE = 'Thermal'
export const CAMERA_PD_TYPE = 'Pd'
export const CAMERA_BATCAM_BRAND = 'BatCamFx2'

export const CAMERA_TYPE_COLOR = {
    Normal: 'blue',
    Thermal: 'red',
    Pd: 'purple'
}
export const MAP_TYPE_PICTURE = 'Picture'
export const MAP_TYPE_MAP = 'Map'

export const DEVICE_STATUS_ON = 'On'

export const TEMPERATURE_LEVEL_GOOD = 1
export const TEMPERATURE_LEVEL_FAIR = 2
export const TEMPERATURE_LEVEL_AVERAGE = 3
export const TEMPERATURE_LEVEL_BAD = 4

export const CAMERA_COMMANDS = {
    ADD: 1,
    REMOVE: 2,
    ALL: 3,
    SCREEN_NUMBER: 4
}

export const STATUS_COLOR_MAP = {
    Bad: 'red',
    Average: '#FBBF24',
    Fair: '#60A5FA',
    Good: '#34D399',
}

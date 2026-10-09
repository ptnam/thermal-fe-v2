// Nhãn enum backend (ThermalMonitoring.Common/Commons/Enums.cs), tra theo mã = tên enum C#.
// Nhóm đặt trùng tên config trong allEnums để SelectFromConfig tự dịch. Tiếng Việt vẫn ưu tiên
// chữ backend trả về (xem utils/enumLabel.ts) nên giá trị ở đây chỉ để khớp key với en.
export default {
  warningEventList: {
    PD_EXCEEDED: 'PD intensity exceeds threshold',
  },
  commonStatusList: {
    Inactive: 'Inactive',
    Active: 'Active',
    Deleted: 'Deleted',
  },
  userStatusList: {
    Inactive: 'Inactive',
    Active: 'Active',
    Deleted: 'Deleted',
  },
  deviceStatusList: {
    Off: 'Off',
    On: 'On',
  },
  cameraTypeList: {
    Normal: 'General surveillance camera',
    Thermal: 'Thermal camera',
    Pd: 'PD monitoring camera',
  },
  cameraPtzTypeList: {
    Ptz: 'PTZ camera',
    Fix: 'Fixed camera',
  },
  temperatureLevelList: {
    Undefined: 'Undefined',
    Good: 'Good',
    Fair: 'Fair',
    Average: 'Average',
    Bad: 'Poor',
  },
  notificationChannelStatusList: {
    NotUsed: 'Not in use',
    InUsed: 'In use',
  },
  notificationGroupStatusList: {
    NotUsed: 'Not in use',
    InUsed: 'In use',
  },
  notificationStatusList: {
    Pending: 'Unresolved',
    Resolved: 'Resolved',
  },
  mapTypeList: {
    Map: 'Map',
    Picture: 'Image',
  },
  monitorTypeList: {
    Machine: 'Device measurement',
    Environment: 'Ambient measurement',
  },
  thresholdTypeList: {
    Enviroment: 'Compared with ambient',
    Threshold: 'Compared with temperature threshold',
    MinPhase: 'Compared with min phase',
    TwoArea: 'Compared with same-type element',
    GlobalMinPhase: 'Compared with station-wide min phase',
    GlobalTwoArea: 'Compared with same-type element (station-wide)',
    PdGrowthRate: 'ΔPD% growth rate per period',
    PdLevelDb: 'PD intensity threshold (dB)',
  },
  presetType: {
    SyncFromCamera: 'Synced from camera',
    CreatedByManagementWeb: 'Created on management web',
  },
}

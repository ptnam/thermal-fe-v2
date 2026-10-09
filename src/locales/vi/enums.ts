// Nhãn enum backend (ThermalMonitoring.Common/Commons/Enums.cs), tra theo mã = tên enum C#.
// Nhóm đặt trùng tên config trong allEnums để SelectFromConfig tự dịch. Tiếng Việt vẫn ưu tiên
// chữ backend trả về (xem utils/enumLabel.ts) nên giá trị ở đây chỉ để khớp key với en.
export default {
  warningEventList: {
    PD_EXCEEDED: 'Cường độ PD vượt ngưỡng',
  },
  commonStatusList: {
    Inactive: 'Không hoạt động',
    Active: 'Hoạt động',
    Deleted: 'Đã xóa',
  },
  userStatusList: {
    Inactive: 'Không hoạt động',
    Active: 'Hoạt động',
    Deleted: 'Đã xóa',
  },
  deviceStatusList: {
    Off: 'Đang tắt',
    On: 'Đang bật',
  },
  cameraTypeList: {
    Normal: 'Camera giám sát tổng quát',
    Thermal: 'Camera mắt nhiệt',
    Pd: 'Camera giám sát phóng điện',
  },
  cameraPtzTypeList: {
    Ptz: 'Camera quay quét',
    Fix: 'Camera cố định',
  },
  temperatureLevelList: {
    Undefined: 'Không xác định',
    Good: 'Tốt',
    Fair: 'Khá',
    Average: 'Trung bình',
    Bad: 'Xấu',
  },
  notificationChannelStatusList: {
    NotUsed: 'Không sử dụng',
    InUsed: 'Đang sử dụng',
  },
  notificationGroupStatusList: {
    NotUsed: 'Không sử dụng',
    InUsed: 'Đang sử dụng',
  },
  notificationStatusList: {
    Pending: 'Chưa xử lý',
    Resolved: 'Đã xử lý',
  },
  mapTypeList: {
    Map: 'Bản đồ',
    Picture: 'Hình ảnh',
  },
  monitorTypeList: {
    Machine: 'Đo thiết bị',
    Environment: 'Đo môi trường',
  },
  thresholdTypeList: {
    Enviroment: 'So với môi trường',
    Threshold: 'So với ngưỡng nhiệt',
    MinPhase: 'So với pha min',
    TwoArea: 'So với phần tử cùng loại',
    GlobalMinPhase: 'So với pha min toàn trạm',
    GlobalTwoArea: 'So với phần tử cùng loại toàn trạm',
    PdGrowthRate: 'Tốc độ tăng ΔPD% theo kỳ',
    PdLevelDb: 'Ngưỡng cường độ PD (dB)',
  },
  presetType: {
    SyncFromCamera: 'Đồng bộ từ camera',
    CreatedByManagementWeb: 'Tạo từ web quản lý',
  },
}

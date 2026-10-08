# Đa ngôn ngữ (vue-i18n)

- `vi/` là ngôn ngữ chuẩn và mặc định; `en/` phải có đúng bộ key như `vi/` (kiểm tra bởi `schema.ts` khi `npm run type-check`).
- Mỗi file là một namespace: `vi/router.ts` → `t('router.dashboard')`. Thêm namespace mới thì tạo file ở **mọi** thư mục ngôn ngữ và khai báo trong `schema.ts`.
- File message chỉ chứa `export default { ... }` thuần (plugin precompile), không import, không tính toán.
- Ký tự đặc biệt của vue-i18n trong câu: `{ } @ $ |` → dùng literal `{'@'}`.
- Không gọi `t()` ở top-level module (không đổi theo ngôn ngữ); dùng trong template, `computed` hoặc hàm.
- `npm run i18n:report`: thống kê chuỗi tiếng Việt còn hardcode.
- Lỗi API được dịch tại `plugins/axios/apiError.ts`; câu lỗi backend cần dịch thì thêm vào `API_ERROR_PATTERNS`.

## Thuật ngữ

| Tiếng Việt | English |
|---|---|
| Thiết bị / Loại thiết bị | Device / Device type |
| Bộ phận | Component |
| Điểm đo / Điểm giám sát | Measurement point / Monitoring point |
| Khu vực | Area |
| Cảm biến | Sensor |
| Cảnh báo | Alert |
| Ngưỡng / Vượt ngưỡng | Threshold / Over-threshold |
| Phóng điện (cục bộ) | Partial discharge (PD) |
| Nhật ký | Log |
| Kênh cảnh báo / Bộ cảnh báo | Alert channel / Alert group |
| Góc quay (preset) / Tour | Preset / Tour |
| Giám sát trực tiếp | Live monitoring |

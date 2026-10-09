// Câu lỗi chung theo HTTP status, dùng khi không dịch được câu lỗi backend trả về
export default {
  badRequest: 'Dữ liệu gửi lên không hợp lệ.',
  unauthorized: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  forbidden: 'Bạn không có quyền thực hiện thao tác này.',
  notFound: 'Không tìm thấy dữ liệu yêu cầu.',
  conflict: 'Dữ liệu bị trùng hoặc xung đột với dữ liệu hiện có.',
  payloadTooLarge: 'Dữ liệu tải lên quá lớn.',
  server: 'Máy chủ gặp sự cố, vui lòng thử lại sau.',
  unavailable: 'Máy chủ tạm thời không khả dụng, vui lòng thử lại sau.',
  timeout: 'Máy chủ phản hồi quá lâu, vui lòng thử lại.',
  network: 'Không kết nối được tới máy chủ.',
  canceled: 'Yêu cầu đã bị hủy.',
  unknown: 'Đã xảy ra lỗi, vui lòng thử lại.',
}

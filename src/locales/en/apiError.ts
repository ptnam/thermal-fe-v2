// Câu lỗi chung theo HTTP status, dùng khi không dịch được câu lỗi backend trả về
export default {
  badRequest: 'The submitted data is invalid.',
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: 'You do not have permission to perform this action.',
  notFound: 'The requested data was not found.',
  conflict: 'The data is duplicated or conflicts with existing data.',
  payloadTooLarge: 'The uploaded data is too large.',
  server: 'The server encountered a problem. Please try again later.',
  unavailable: 'The server is temporarily unavailable. Please try again later.',
  timeout: 'The server took too long to respond. Please try again.',
  network: 'Unable to connect to the server.',
  canceled: 'The request was canceled.',
  unknown: 'Something went wrong. Please try again.',
}

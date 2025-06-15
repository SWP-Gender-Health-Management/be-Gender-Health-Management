import { format } from 'date-fns'

export const formatDate = (date: number) => {
  // Chuyển đổi sang mili giây và tạo đối tượng Date
  const dateObject = new Date(date)

  // Sử dụng hàm format để định dạng
  // 'ngày' dd 'tháng' MM 'năm' yyyy là chuỗi mẫu định dạng
  // dd: ngày (01, 02, ...)
  // MM: tháng (01, 02, ...)
  // yyyy: năm (2025)
  const formattedDate = format(dateObject, "'ngày' dd 'tháng' MM 'năm' yyyy")
  return formattedDate
}

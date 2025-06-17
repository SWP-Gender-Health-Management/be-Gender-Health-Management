import puppeteer from 'puppeteer'
import Result from '../models/Entity/result.entity.js'
import { formatDate } from './date-fns.js'

// Hàm tạo nội dung HTML từ dữ liệu
const createHtmlContent = (data: Result[]) => {
  let itemsHtml = ''
  data.forEach((item: Result) => {
    itemsHtml += `
      <tr>
        <td>${item.name}</td>
        <td class="text-right">${item.result}</td>
        <td class="text-right">${item.normal_range}</td>
        <td class="text-right">${item.unit}</td>
        <td class="text-right">${item.conclusion}</td>
      </tr>
    `
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        /* Thiết lập chung */
        body { 
            font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif; 
            font-size: 14px; 
            line-height: 1.6; 
            margin: 0;
            padding: 0;
        }
        /* Khối chứa toàn bộ nội dung */
        .invoice-box { 
          max-width: 800px; 
          margin: auto; 
          padding: 30px; 
          border: 1px solid #eee; 
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); 
          text-align: center;
        }
        /* Căn chỉnh các ô bên phải */
        .text-right { 
          text-align: right; 
        }
        /* Bảng dữ liệu */
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px;
        }
        table, th, td { 
          border-bottom: 1px solid #ddd; 
        }
        th, td { 
          padding: 8px; 
          text-align: center;
        }
        th { 
          background-color: #f2f2f2; 
          font-weight: bold;
        }
        /* Khối chứa thông tin ký tên */
        .signature-block {
            width: 350px; /* Độ rộng của khối */
            text-align: center; /* Căn giữa nội dung bên trong khối */
        }
        /* Dòng ngày tháng */
        .date-line {
            font-style: italic; /* In nghiêng dòng ngày tháng */
        }
        /* Tiêu đề vai trò (Nhân viên) */
        .role-title {
            font-weight: bold; /* In đậm */
            margin-bottom: 0; /* Bỏ khoảng cách dưới mặc định của heading */
        }
        /* Khoảng trắng để ký tên */
        .signature-space {
            height: 80px; /* Chiều cao của khoảng trắng cho chữ ký */
            margin-bottom: 5px;
            /* Tùy chọn: Thêm dòng kẻ dưới để dễ ký hơn */
            /* border-bottom: 1px solid black; */
        }
        /* Tên của nhân viên */
        .employee-name {
            font-weight: bold; /* In đậm tên */
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <h1>KẾT QUẢ XÉT NGHIỆM</h1>
        <p>
          Họ tên: ${data[0].laboratoryAppointment.customer.full_name}<br />
          Ngày: ${data[0].laboratoryAppointment.created_at}<br />
          Số điện thoại: ${data[0].laboratoryAppointment.customer.phone}
        </p>
        <table>
          <thead>
            <tr>
              <th>Tên xét nghiệm</th>
              <th class="text-right">Kết quả</th>
              <th class="text-right">Khoảng bình thường</th>
              <th class="text-right">Đơn vị</th>
              <th class="text-right">Kết luận</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>        
      </div>
      <div class="signature-container">
        <div class="signature-block">
            <p class="date-line">TP. Hồ Chí Minh, ngày ${formatDate(data[0].laboratoryAppointment.created_at.toNumber())}</p>
            <h4 class="role-title">Nhân viên</h4>
            <div class="signature-space">
                </div>
            <p class="employee-name">(Họ và tên của nhân viên)</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Hàm tạo PDF
export async function createPdfFromHtml(data: any, path: string) {
  // 1. Tạo nội dung HTML
  const htmlContent = createHtmlContent(data)

  // 2. Khởi chạy Puppeteer
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // 3. Set nội dung cho page
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

  // 4. Xuất PDF
  await page.pdf({
    path: path,
    format: 'A4',
    printBackground: true // Quan trọng để in cả background color/image
  })

  // 5. Đóng trình duyệt
  await browser.close()
  console.log(`Đã tạo hóa đơn thành công tại: ${path}`)
}

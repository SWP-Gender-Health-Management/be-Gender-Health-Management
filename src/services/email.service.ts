// src/services/emailService.ts (ví dụ)
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function createTransporter() {
  // Nếu dùng Gmail, bạn nên sử dụng biến môi trường cho email và mật khẩu ứng dụng
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Hoặc 'smtp.office365.com', 'smtp.mailgun.org', ...
    port: 465, // Hoặc 587 cho TLS
    secure: true, // true cho port 465, false cho các port khác (như 587 với STARTTLS)
    auth: {
      user: process.env.MAILER_EMAIL, // Địa chỉ email của bạn (ví dụ: your.email@gmail.com)
      pass: process.env.MAILER_EMAIL_APP_PASSWORD // Mật khẩu ứng dụng cho Gmail, hoặc mật khẩu tài khoản
    }
    // tls: {
    //   // không làm gì nếu servername không khớp với tên trong certificate
    //   rejectUnauthorized: false
    // }
  })

  // (Tùy chọn) Xác minh cấu hình transporter (chỉ nên làm một lần khi khởi tạo)
  try {
    await transporter.verify()
    console.log('📧 Server is ready to take our messages')
  } catch (error) {
    console.error('❌ Error verifying transporter:', error)
  }

  return transporter
}

interface MailOptions {
  to: string // Địa chỉ người nhận
  subject: string // Tiêu đề email
  text?: string // Nội dung dạng text thuần
  htmlPath: string // Nội dung dạng HTML (ưu tiên hơn text nếu cả hai cùng có)
  placeholders?: { [key: string]: string }
}

export async function sendMail(
  to: string, // Địa chỉ người nhận
  subject: string, // Tiêu đề email
  text?: string, // Nội dung dạng text thuần
  htmlPath?: string, // Nội dung dạng HTML (ưu tiên hơn text nếu cả hai cùng có)
  placeholders?: { [key: string]: string }
) {
  try {
    const transporter = await createTransporter() // Hoặc bạn có thể khởi tạo transporter một lần và tái sử dụng
    // console.log('htmlPath', htmlPath)
    const absolutePath = path.join(__dirname, '..', htmlPath as string) // Giả sử templates nằm ngoài thư mục services
    // console.log('absolutePath', absolutePath)
    let htmlContent = fs.readFileSync(absolutePath, 'utf-8')
    // console.log('htmlContent', htmlContent)
    if (placeholders) {
      for (const key in placeholders) {
        // Tạo một RegExp để thay thế tất cả các lần xuất hiện của placeholder
        // Ví dụ: /{{USER_NAME}}/g
        const regex = new RegExp(`{{${key}}}`, 'g')
        htmlContent = htmlContent.replace(regex, placeholders[key])
      }
    }

    const mailOptions = {
      from: `Gender Health Management: ${process.env.EMAIL_USER}`, // Địa chỉ người gửi (phải khớp với user trong auth)
      to,
      subject,
      text,
      html: htmlContent
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('📬 Message sent: %s', info.messageId)
    // Preview URL: %s (chỉ có nếu dùng Ethereal.email)
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info
  } catch (error) {
    console.error('❌ Error sending email:', error)
    throw error // Ném lỗi ra để hàm gọi có thể xử lý
  }
}

export default createTransporter

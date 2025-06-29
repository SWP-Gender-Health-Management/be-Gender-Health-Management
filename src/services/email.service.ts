import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import sgMail from '@sendgrid/mail'

dotenv.config()

// Lấy API Key từ biến môi trường (Doppler/.env)
const sendGridApiKey = process.env.SENDGRID_API_KEY as string

if (!sendGridApiKey) {
  console.error('Lỗi: SENDGRID_API_KEY không được tìm thấy. Hãy chắc chắn bạn đã thiết lập nó.')
} else {
  // Thiết lập API key cho thư viện SendGrid
  sgMail.setApiKey(sendGridApiKey)
  console.log('✅ SendGrid đã được cấu hình.')
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface MailOptions {
  to: string // Địa chỉ người nhận
  subject: string // Tiêu đề email
  text?: string // Nội dung dạng text thuần
  htmlPath: string // Nội dung dạng HTML (ưu tiên hơn text nếu cả hai cùng có)
  placeholders?: { [key: string]: string }
}

/**
 * @description Send an email
 * @param to - The email address of the recipient
 * @param subject - The subject of the email
 * @param text - The text of the email
 * @param htmlPath - The path to the HTML file
 * @param placeholders - The placeholders to be replaced in the HTML file
 */
export async function sendMail(options: MailOptions) {
  const { to, subject, text, htmlPath, placeholders } = options
  // Địa chỉ email "from" phải LÀ ĐỊA CHỈ BẠN ĐÃ XÁC THỰC ở Bước 1.3
  const fromEmail = process.env.MAILER_EMAIL as string // Hoặc email bạn đã xác thực

  try {
    // Giả sử templates nằm ngoài thư mục services
    const absolutePath = path.join(__dirname, '..', htmlPath as string)
    // console.log('absolutePath', absolutePath)
    let htmlContent = fs.readFileSync(absolutePath, 'utf-8')
    // console.log('htmlContent', htmlContent)

    // Xử lý placeholders (ưu tiên placeholders trước)
    const templateData = placeholders
    if (templateData) {
      for (const key in templateData) {
        // Tạo một RegExp để thay thế tất cả các lần xuất hiện của placeholder
        // Ví dụ: /{{USER_NAME}}/g
        const regex = new RegExp(`{{${key}}}`, 'g')
        htmlContent = htmlContent.replace(regex, templateData[key])
      }
    }

    const msg = {
      to,
      from: {
        email: fromEmail,
        name: 'Gender Health Management'
      },
      subject,
      text,
      html: htmlContent // Sử dụng htmlContent thay vì htmlPath
    }

    await sgMail.send(msg)
    console.log('📬 Message sent: ' + msg.to)
    return msg
  } catch (error) {
    console.error('❌ Error sending email:', error)
    throw error // Ném lỗi ra để hàm gọi có thể xử lý
  }
}

/**
 * Gửi email hàng loạt giống hệt nhau từ một file template.
 * @param recipients Mảng các địa chỉ email người nhận.
 * @param subject Tiêu đề email.
 * @param templateName Tên của file template (ví dụ: 'general-announcement').
 * @param data Dữ liệu để điền vào template.
 */
export async function sendBulkFromTemplate(recipients: string[], subject: string, templateName: string) {
  if (!recipients || recipients.length === 0) {
    console.log('Không có người nhận, bỏ qua việc gửi email.')
    return
  }

  try {
    // 1. Xác định đường dẫn đến file template
    const templatePath = path.join(__dirname, `../views/emails/${templateName}.html`)

    // 3. Cấu hình các tùy chọn mail
    const mailOptions = {
      from: '"Gender Health Management" <no-reply@yourdomain.com>',
      to: 'undisclosed-recipients@yourdomain.com',
      bcc: recipients, // Dùng BCC để gửi hàng loạt
      subject: subject,
      html: templatePath // Sử dụng HTML đã được render
    }

    // 4. Gửi email
    const info = await sgMail.send(mailOptions)
    console.log(`Đã gửi thành công chiến dịch '${subject}' đến ${recipients.length} người.`)
    return info
  } catch (error) {
    console.error(`Lỗi khi gửi email hàng loạt từ template ${templateName}:`, error)
    throw error
  }
}

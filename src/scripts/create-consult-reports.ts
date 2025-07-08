import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import ConsultAppointment from '../models/Entity/consult_appointment.entity.js'
import ConsultReport from '../models/Entity/consult_report.entity.js'
import { StatusAppointment } from '../enum/statusAppointment.enum.js'
import { IsNull } from 'typeorm'

// Function to generate realistic report content based on appointment description
function generateReportContent(description: string) {
  // Common medical advice templates
  const adviceTemplates = [
    'Khuyến nghị theo dõi thêm và tái khám sau 2 tuần.',
    'Cần điều chỉnh chế độ ăn uống và sinh hoạt.',
    'Nên thực hiện xét nghiệm thêm để có kết quả chính xác.',
    'Tiếp tục duy trì liệu pháp hiện tại và theo dõi.',
    'Cần tham khảo ý kiến của bác sĩ chuyên khoa.',
    'Nên bổ sung thêm các vitamin và khoáng chất.',
    'Cần giảm stress và có chế độ nghỉ ngơi hợp lý.',
    'Khuyến nghị tập thể dục đều đặn, 30 phút mỗi ngày.'
  ]

  // Generate diagnosis based on description
  let diagnosis = ''
  if (description.includes('đau') || description.includes('pain')) {
    diagnosis = 'Đau do căng thẳng cơ bắp, không có dấu hiệu bệnh lý nghiêm trọng.'
  } else if (description.includes('mệt') || description.includes('tired') || description.includes('fatigue')) {
    diagnosis = 'Mệt mỏi do căng thẳng và thiếu ngủ, cần điều chỉnh lối sống.'
  } else if (description.includes('sốt') || description.includes('fever')) {
    diagnosis = 'Sốt nhẹ do nhiễm virus, cần theo dõi và nghỉ ngơi.'
  } else if (description.includes('da') || description.includes('skin')) {
    diagnosis = 'Viêm da nhẹ, có thể do dị ứng hoặc tiếp xúc với chất kích ứng.'
  } else if (description.includes('kinh nguyệt') || description.includes('menstrual')) {
    diagnosis = 'Rối loạn kinh nguyệt do thay đổi nội tiết, không có bất thường nghiêm trọng.'
  } else if (description.includes('tình dục') || description.includes('sexual')) {
    diagnosis = 'Sức khỏe tình dục bình thường, cần tuân thủ các biện pháp an toàn.'
  } else {
    diagnosis = 'Tình trạng sức khỏe chung ổn định, không phát hiện bất thường.'
  }

  // Generate treatment plan
  const treatmentPlan = [
    'Nghỉ ngơi đầy đủ, ít nhất 7-8 giờ mỗi ngày.',
    'Duy trì chế độ ăn uống cân bằng, giàu rau xanh và trái cây.',
    'Uống đủ nước, ít nhất 2 lít mỗi ngày.',
    'Tránh các thực phẩm cay nóng, nhiều dầu mỡ và đồ uống có cồn.',
    'Tập thể dục nhẹ nhàng, 30 phút mỗi ngày, 5 ngày/tuần.'
  ]

  // Generate medication recommendations if needed
  let medications = ''
  if (description.includes('đau') || description.includes('pain')) {
    medications = 'Paracetamol 500mg, uống 1 viên khi đau, không quá 4 viên/ngày.'
  } else if (description.includes('sốt') || description.includes('fever')) {
    medications = 'Paracetamol 500mg, uống 1 viên khi sốt trên 38.5°C, cách 6 giờ/lần.'
  } else if (description.includes('da') || description.includes('skin')) {
    medications = 'Kem Hydrocortisone 1%, bôi 2 lần/ngày lên vùng da bị ảnh hưởng.'
  } else {
    medications = 'Không cần dùng thuốc, chỉ cần điều chỉnh lối sống và theo dõi.'
  }

  // Random advice
  const randomAdvice = adviceTemplates[Math.floor(Math.random() * adviceTemplates.length)]

  // Compose full report
  return `
KẾT QUẢ KHÁM VÀ TƯ VẤN

CHẨN ĐOÁN:
${diagnosis}

KẾ HOẠCH ĐIỀU TRỊ:
${treatmentPlan.join('\n')}

THUỐC ĐIỀU TRỊ:
${medications}

KHUYẾN NGHỊ:
${randomAdvice}

LƯU Ý: Nếu các triệu chứng không cải thiện sau 7 ngày hoặc trở nên nghiêm trọng hơn, vui lòng liên hệ ngay với bác sĩ.
`
}

async function createConsultReports() {
  try {
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const consultAppointmentRepository = AppDataSource.getRepository(ConsultAppointment)
    const consultReportRepository = AppDataSource.getRepository(ConsultReport)

    // Get all COMPLETED consult appointments without reports
    const appointments = await consultAppointmentRepository.find({
      where: {
        status: StatusAppointment.COMPLETED,
        report: IsNull()
      },
      relations: ['consultant_pattern', 'consultant_pattern.working_slot', 'customer']
    })

    if (appointments.length === 0) {
      console.log('❌ No completed appointments without reports found')

      // Get pending appointments and update their status to COMPLETED
      const pendingAppointments = await consultAppointmentRepository.find({
        where: { status: StatusAppointment.PENDING },
        relations: ['consultant_pattern', 'consultant_pattern.working_slot', 'customer'],
        take: 5 // Limit to 5 appointments
      })

      if (pendingAppointments.length === 0) {
        console.log('❌ No pending appointments found')
        return
      }

      console.log(`Found ${pendingAppointments.length} pending appointments, updating to COMPLETED...`)

      for (const appointment of pendingAppointments) {
        appointment.status = StatusAppointment.COMPLETED
        await consultAppointmentRepository.save(appointment)
      }

      console.log(`✅ Updated ${pendingAppointments.length} appointments to COMPLETED`)

      // Use these appointments for reports
      appointments.push(...pendingAppointments)
    }

    console.log(`Creating reports for ${appointments.length} appointments...`)

    const reports = []
    for (const appointment of appointments) {
      // Generate report name
      const reportName = `Báo cáo tư vấn cho ${appointment.customer.full_name}`

      // Generate report description based on appointment description
      const reportDescription = generateReportContent(appointment.description)

      // Create report
      const report = consultReportRepository.create({
        name: reportName,
        description: reportDescription,
        consult_appointment: appointment
      })

      reports.push(report)
    }

    // Save all reports
    const savedReports = await consultReportRepository.save(reports)

    console.log(`✅ Successfully created ${savedReports.length} consult reports`)

    // Update the appointments with their reports
    for (let i = 0; i < appointments.length; i++) {
      appointments[i].report = savedReports[i]
      await consultAppointmentRepository.save(appointments[i])
    }

    console.log('✅ Successfully updated appointments with their reports')

    // Display report details
    savedReports.forEach((report, idx) => {
      console.log(`\n--- Report ${idx + 1} ---`)
      console.log(`Name: ${report.name}`)
      console.log(`ID: ${report.report_id}`)
      console.log(`Description excerpt: ${report.description.substring(0, 100)}...`)
    })
  } catch (error) {
    console.error('❌ Error creating consult reports:', error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('Database connection closed')
    }
    process.exit(0)
  }
}

createConsultReports()

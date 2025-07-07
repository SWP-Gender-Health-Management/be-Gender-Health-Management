import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import WorkingSlot from '../models/Entity/working_slot.entity.js'
import ConsultantPattern from '../models/Entity/consultant_pattern.entity.js'
import { Role } from '../enum/role.enum.js'
import { TypeAppointment } from '../enum/type_appointment.enum.js'

async function createConsultantPatterns() {
  try {
    // Khởi tạo kết nối database
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const accountRepository = AppDataSource.getRepository(Account)
    const workingSlotRepository = AppDataSource.getRepository(WorkingSlot)
    const consultantPatternRepository = AppDataSource.getRepository(ConsultantPattern)

    // Lấy 7 consultant đầu tiên
    const consultants = await accountRepository.find({
      where: { role: Role.CONSULTANT },
      skip: 7,
      take: 8
    })

    console.log(consultants)

    console.log(`Using ${consultants.length} consultants (first 7)`)

    // Lấy 4 working slots đầu tiên cho consultant
    const existingWorkingSlots = await workingSlotRepository.find({
      where: { type: TypeAppointment.CONSULT },
      skip: 4,
      take: 4
    })

    if (existingWorkingSlots.length === 0) {
      console.log('❌ No existing working slots found for CONSULT type')
      return
    }

    console.log(`Using ${existingWorkingSlots.length} working slots for consultants (4 slots per day)`)

    // Tạo pattern cho mỗi consultant từ 16/6 đến 30/6/2025
    const startDate = new Date('2025-06-16')
    const endDate = new Date('2025-06-30')
    const patterns = []

    for (const consultant of consultants) {
      let count = 0
      console.log(`Creating patterns for consultant: ${consultant.full_name}`)

      // Tạo pattern cho mỗi ngày từ 1/6 đến 30/6
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d)

        // Tạo pattern cho mỗi ngày (mỗi slot)
        for (const workingSlot of existingWorkingSlots) {
          count++
          const pattern = {
            account_id: consultant.account_id,
            date: currentDate,
            is_booked: false, // Mặc định chưa được book
            working_slot: workingSlot
          }
          patterns.push(pattern)
        }
      }
      console.log(`Created ${count} patterns for consultant: ${consultant.full_name}`)
    }

    // Lưu tất cả patterns vào database
    const savedPatterns = await consultantPatternRepository.save(patterns)

    console.log(`✅ Successfully created ${savedPatterns.length} consultant patterns`)
    console.log(`📊 Summary:`)
    console.log(`- ${consultants.length} consultants (first 7)`)
    console.log(`- ${existingWorkingSlots.length} working slots per day`)
    console.log(
      `- ${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days (16/6 - 30/6)`
    )
    console.log(
      `- Total patterns: ${consultants.length} × ${existingWorkingSlots.length} × 15 = ${savedPatterns.length}`
    )

    // Hiển thị chi tiết working slots
    console.log('\n📋 Existing working slots used:')
    existingWorkingSlots.forEach((slot: any, index: number) => {
      console.log(`${index + 1}. ${slot.name} (${slot.start_at} - ${slot.end_at})`)
    })
  } catch (error) {
    console.error('❌ Error creating consultant patterns:', error)
  } finally {
    // Đóng kết nối database
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('Database connection closed')
    }
    process.exit(0)
  }
}

// Chạy script
createConsultantPatterns()

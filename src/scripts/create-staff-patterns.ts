import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import WorkingSlot from '../models/Entity/working_slot.entity.js'
import StaffPattern from '../models/Entity/staff_pattern.entity.js'
import { Role } from '../enum/role.enum.js'
import { TypeAppointment } from '../enum/type_appointment.enum.js'

async function createStaffPatterns() {
  try {
    // Khởi tạo kết nối database
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const accountRepository = AppDataSource.getRepository(Account)
    const workingSlotRepository = AppDataSource.getRepository(WorkingSlot)
    const staffPatternRepository = AppDataSource.getRepository(StaffPattern)

    // Lấy 5 staff đầu tiên
    const staffs = await accountRepository.find({
      where: { role: Role.STAFF },
      skip: 5,
      take: 5
    })

    console.log(staffs)
    console.log(`Using ${staffs.length} staffs (first 5)`)

    // Lấy slot 1 (slot đầu tiên) cho staff
    const existingWorkingSlots = await workingSlotRepository.find({
      where: { type: TypeAppointment.CONSULT },
      skip: 1,
      take: 1
    })

    if (existingWorkingSlots.length === 0) {
      console.log('❌ No existing working slots found for CONSULT type')
      return
    }

    console.log(`Using ${existingWorkingSlots.length} working slot for staffs (slot 1 only)`)

    // Tạo pattern cho mỗi staff từ 16/6 đến 30/6/2025
    const startDate = new Date('2025-06-16')
    const endDate = new Date('2025-06-30')
    const patterns = []

    for (const staff of staffs) {
      let count = 0
      console.log(`Creating patterns for staff: ${staff.full_name}`)

      // Tạo pattern cho mỗi ngày từ 16/6 đến 30/6
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d)

        // Tạo 1 pattern cho mỗi ngày (slot 1)
        for (const workingSlot of existingWorkingSlots) {
          count++
          const pattern = {
            account_id: staff.account_id,
            date: currentDate,
            is_active: true, // Mặc định active
            working_slot: workingSlot
          }
          patterns.push(pattern)
        }
      }
      console.log(`Created ${count} patterns for staff: ${staff.full_name}`)
    }

    // Lưu tất cả patterns vào database
    const savedPatterns = await staffPatternRepository.save(patterns)

    console.log(`✅ Successfully created ${savedPatterns.length} staff patterns`)
    console.log(`📊 Summary:`)
    console.log(`- ${staffs.length} staffs (first 5)`)
    console.log(`- ${existingWorkingSlots.length} working slot per day`)
    console.log(
      `- ${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days (16/6 - 30/6)`
    )
    console.log(`- Total patterns: ${staffs.length} × ${existingWorkingSlots.length} × 15 = ${savedPatterns.length}`)

    // Hiển thị chi tiết working slot
    console.log('\n📋 Working slot used:')
    existingWorkingSlots.forEach((slot: any, index: number) => {
      console.log(`${index + 1}. ${slot.name} (${slot.start_at} - ${slot.end_at})`)
    })
  } catch (error) {
    console.error('❌ Error creating staff patterns:', error)
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
createStaffPatterns()

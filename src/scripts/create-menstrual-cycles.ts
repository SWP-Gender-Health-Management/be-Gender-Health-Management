import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import MenstrualCycle from '../models/Entity/menstrual_cycle.entity.js'
import { Role } from '../enum/role.enum.js'

async function createMenstrualCycles() {
  try {
    // Khởi tạo kết nối database
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const accountRepository = AppDataSource.getRepository(Account)
    const menstrualCycleRepository = AppDataSource.getRepository(MenstrualCycle)

    // Lấy 10 customer nữ đầu tiên
    const femaleCustomers = await accountRepository.find({
      where: {
        role: Role.CUSTOMER,
        gender: 'Nữ'
      },
      take: 10
    })

    console.log(`Found ${femaleCustomers.length} female customers`)

    if (femaleCustomers.length === 0) {
      console.log('❌ No female customers found')
      return
    }

    const menstrualCycles = []

    for (const customer of femaleCustomers) {
      console.log(`Creating menstrual cycle for: ${customer.full_name}`)

      // Tạo dữ liệu chu kỳ kinh nguyệt thực tế
      const cycleLength = faker.number.int({ min: 25, max: 35 }) // Chu kỳ 25-35 ngày
      const periodLength = faker.number.int({ min: 3, max: 7 }) // Kinh nguyệt 3-7 ngày

      // Tạo ngày bắt đầu chu kỳ gần đây (trong vòng 3 tháng qua)
      const recentStartDate = faker.date.between({
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 ngày trước
        to: new Date()
      })

      // Tính ngày kết thúc chu kỳ
      const endDate = new Date(recentStartDate)
      endDate.setDate(endDate.getDate() + cycleLength)

      // Tạo ngày bắt đầu kinh nguyệt (trong chu kỳ)
      const periodStartDate = new Date(recentStartDate)
      periodStartDate.setDate(periodStartDate.getDate() + faker.number.int({ min: 0, max: cycleLength - periodLength }))

      // Tính ngày kết thúc kinh nguyệt
      const periodEndDate = new Date(periodStartDate)
      periodEndDate.setDate(periodEndDate.getDate() + periodLength)

      // Tạo ghi chú ngẫu nhiên
      const notes = [
        'Chu kỳ đều đặn, không có triệu chứng bất thường',
        'Có đau bụng nhẹ trong ngày đầu',
        'Lượng máu kinh bình thường',
        'Có cảm giác mệt mỏi nhẹ',
        'Không có triệu chứng đặc biệt',
        'Chu kỳ ổn định, sức khỏe tốt',
        'Có đau lưng nhẹ',
        'Tâm trạng ổn định',
        'Chu kỳ bình thường',
        'Không có dấu hiệu bất thường'
      ]

      const randomNote = notes[Math.floor(Math.random() * notes.length)]

      const menstrualCycle = {
        start_date: periodStartDate,
        end_date: periodEndDate,
        period: cycleLength,
        note: randomNote,
        account: customer
      }

      menstrualCycles.push(menstrualCycle)

      console.log(`  - Cycle: ${cycleLength} days, Period: ${periodLength} days`)
      console.log(`  - Start: ${periodStartDate.toLocaleDateString('vi-VN')}`)
      console.log(`  - End: ${periodEndDate.toLocaleDateString('vi-VN')}`)
    }

    // Lưu tất cả menstrual cycles vào database
    const savedCycles = await menstrualCycleRepository.save(menstrualCycles)

    console.log(`\n✅ Successfully created ${savedCycles.length} menstrual cycles`)
    console.log(`📊 Summary:`)
    console.log(`- ${femaleCustomers.length} female customers`)
    console.log(`- ${savedCycles.length} menstrual cycles created`)

    // Thống kê chu kỳ
    const cycleStats = {
      total: savedCycles.length,
      avgPeriod: Math.round(savedCycles.reduce((sum, cycle) => sum + cycle.period, 0) / savedCycles.length),
      minPeriod: Math.min(...savedCycles.map((cycle) => cycle.period)),
      maxPeriod: Math.max(...savedCycles.map((cycle) => cycle.period))
    }

    console.log('\n📈 Cycle Statistics:')
    console.log(`- Average cycle length: ${cycleStats.avgPeriod} days`)
    console.log(`- Range: ${cycleStats.minPeriod} - ${cycleStats.maxPeriod} days`)

    // Hiển thị chi tiết từng chu kỳ
    console.log('\n📋 Menstrual Cycles Details:')
    savedCycles.forEach((cycle, index) => {
      const customer = femaleCustomers[index]
      console.log(`${index + 1}. ${customer.full_name}`)
      console.log(`   - Cycle: ${cycle.period} days`)
      console.log(
        `   - Period: ${cycle.start_date.toLocaleDateString('vi-VN')} - ${cycle.end_date.toLocaleDateString('vi-VN')}`
      )
      console.log(`   - Note: ${cycle.note}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ Error creating menstrual cycles:', error)
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
createMenstrualCycles()

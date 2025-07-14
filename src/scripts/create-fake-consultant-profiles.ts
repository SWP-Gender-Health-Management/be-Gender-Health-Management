import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import { Role } from '../enum/role.enum.js'
import StaffProfile from '../models/Entity/staff_profile.entity.js'

async function createFakeConsultantProfiles() {
  try {
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const accountRepository = AppDataSource.getRepository(Account)
    const staffProfileRepository = AppDataSource.getRepository(StaffProfile)

    // Lấy tất cả consultant chưa có staff_profile
    const consultants = await accountRepository.find({
      where: { role: Role.CONSULTANT },
      relations: ['staff_profile']
    })

    const specialties = [
      'Sản phụ khoa',
      'Nội tiết',
      'Hiếm muộn',
      'Ung bướu phụ khoa',
      'Tư vấn sức khỏe sinh sản',
      'Tư vấn tiền hôn nhân',
      'Tư vấn mãn kinh',
      'Tư vấn kế hoạch hóa gia đình'
    ]

    let count = 0
    for (const consultant of consultants) {
      if (consultant.staff_profile) continue // Đã có profile

      const profile = staffProfileRepository.create({
        specialty: faker.helpers.arrayElement(specialties),
        rating: parseFloat(faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }).toFixed(1)),
        description: faker.lorem.sentences(2) + ' ' + faker.lorem.sentence(),
        work_start_date: faker.date.between({ from: '2005-01-01', to: '2020-12-31' }),
        account: consultant
      })
      await staffProfileRepository.save(profile)
      count++
      console.log(`Created profile for consultant: ${consultant.full_name} (${consultant.email})`)
    }

    if (count === 0) {
      console.log('Tất cả consultant đã có staff_profile.')
    } else {
      console.log(`✅ Đã tạo ${count} staff_profile cho consultant.`)
    }
  } catch (error) {
    console.error('❌ Error creating consultant staff profiles:', error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('Database connection closed')
    }
    process.exit(0)
  }
}

createFakeConsultantProfiles()

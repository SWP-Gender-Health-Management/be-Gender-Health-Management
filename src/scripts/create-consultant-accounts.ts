import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import { Role } from '../enum/role.enum.js'
import argon2 from 'argon2'

async function createConsultantAccounts() {
  try {
    // Khởi tạo kết nối database
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const accountRepository = AppDataSource.getRepository(Account)

    // Tạo 15 account Consultant
    const consultantAccounts = []

    for (let i = 0; i < 15; i++) {
      const hashedPassword = await argon2.hash('123456') // Mật khẩu mặc định

      const consultantAccount = {
        full_name: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword,
        phone: `0${faker.number.int({ min: 100000000, max: 999999999 })}`, // Format số điện thoại Việt Nam
        dob: faker.date.between({ from: '1970-01-01', to: '1995-12-31' }), // Consultant thường có tuổi từ 28-53
        gender: faker.helpers.arrayElement(['Nam', 'Nữ']),
        avatar: undefined, // Có thể để undefined hoặc tạo URL avatar giả
        role: Role.CONSULTANT,
        is_verified: true, // Consultant thường được verified
        is_banned: false // Mặc định không bị ban
      }

      consultantAccounts.push(consultantAccount)
    }

    // Lưu vào database
    const savedAccounts = await accountRepository.save(consultantAccounts)

    console.log(`✅ Successfully created ${savedAccounts.length} consultant accounts`)
    console.log('\n📋 Consultant account details:')

    savedAccounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.full_name} - ${account.email} - ${account.phone}`)
    })
  } catch (error) {
    console.error('❌ Error creating consultant accounts:', error)
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
createConsultantAccounts()

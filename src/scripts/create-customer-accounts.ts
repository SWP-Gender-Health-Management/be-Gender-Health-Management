import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import { Role } from '../enum/role.enum.js'
import argon2 from 'argon2'

async function createCustomerAccounts() {
  try {
    // Khởi tạo kết nối database
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const accountRepository = AppDataSource.getRepository(Account)

    // Tạo 30 account Customer
    const customerAccounts = []

    for (let i = 0; i < 30; i++) {
      const hashedPassword = await argon2.hash('123456') // Mật khẩu mặc định

      const customerAccount = {
        full_name: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword,
        phone: `0${faker.number.int({ min: 100000000, max: 999999999 })}`, // Format số điện thoại Việt Nam
        dob: faker.date.between({ from: '1980-01-01', to: '2005-12-31' }),
        gender: faker.helpers.arrayElement(['Nam', 'Nữ']),
        avatar: undefined, // Có thể để undefined hoặc tạo URL avatar giả
        role: Role.CUSTOMER,
        is_verified: faker.datatype.boolean({ probability: 0.8 }), // 80% verified
        is_banned: false // Mặc định không bị ban
      }

      customerAccounts.push(customerAccount)
    }

    // Lưu vào database
    const savedAccounts = await accountRepository.save(customerAccounts)

    console.log(`✅ Successfully created ${savedAccounts.length} customer accounts`)
    console.log('\n📋 Account details:')

    savedAccounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.full_name} - ${account.email} - ${account.phone}`)
    })
  } catch (error) {
    console.error('❌ Error creating customer accounts:', error)
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
createCustomerAccounts()

import { AppDataSource } from '../config/database.config.js'
import Laboratory from '../models/Entity/laborarity.entity.js'

async function createSTITests() {
  try {
    // Khởi tạo kết nối database
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const laboratoryRepository = AppDataSource.getRepository(Laboratory)

    // Tạo các loại xét nghiệm STIs
    const stiTests = [
      {
        name: 'Xét nghiệm HIV (Anti-HIV)',
        specimen: 'Máu tĩnh mạch',
        normal_range: 'Âm tính',
        unit: 'S/CO',
        description:
          'Xét nghiệm kháng thể HIV để phát hiện nhiễm HIV. Kết quả âm tính có nghĩa là không phát hiện kháng thể HIV trong máu.',
        price: 250000,
        is_active: true
      },
      {
        name: 'Xét nghiệm Chlamydia trachomatis',
        specimen: 'Nước tiểu/Phết tế bào',
        normal_range: 'Âm tính',
        unit: 'Copies/ml',
        description: 'Xét nghiệm phát hiện vi khuẩn Chlamydia trachomatis gây bệnh lây truyền qua đường tình dục.',
        price: 180000,
        is_active: true
      },
      {
        name: 'Xét nghiệm Neisseria gonorrhoeae',
        specimen: 'Nước tiểu/Phết tế bào',
        normal_range: 'Âm tính',
        unit: 'Copies/ml',
        description: 'Xét nghiệm phát hiện vi khuẩn lậu cầu (Neisseria gonorrhoeae) gây bệnh lậu.',
        price: 180000,
        is_active: true
      },
      {
        name: 'Xét nghiệm Treponema pallidum (Giang mai)',
        specimen: 'Máu tĩnh mạch',
        normal_range: 'Âm tính',
        unit: 'Titer',
        description: 'Xét nghiệm phát hiện kháng thể kháng Treponema pallidum gây bệnh giang mai.',
        price: 200000,
        is_active: true
      },
      {
        name: 'Xét nghiệm Herpes Simplex Virus (HSV)',
        specimen: 'Máu tĩnh mạch',
        normal_range: 'Âm tính',
        unit: 'Index',
        description: 'Xét nghiệm phát hiện kháng thể kháng virus Herpes Simplex type 1 và 2.',
        price: 220000,
        is_active: true
      },
      {
        name: 'Xét nghiệm Human Papillomavirus (HPV)',
        specimen: 'Phết tế bào cổ tử cung',
        normal_range: 'Âm tính',
        unit: 'RLU/CO',
        description: 'Xét nghiệm phát hiện virus HPV gây mụn cóc sinh dục và ung thư cổ tử cung.',
        price: 350000,
        is_active: true
      },
      {
        name: 'Xét nghiệm Trichomonas vaginalis',
        specimen: 'Dịch âm đạo',
        normal_range: 'Âm tính',
        unit: 'Copies/ml',
        description: 'Xét nghiệm phát hiện ký sinh trùng Trichomonas vaginalis gây viêm âm đạo.',
        price: 150000,
        is_active: true
      },
      {
        name: 'Xét nghiệm Mycoplasma genitalium',
        specimen: 'Nước tiểu/Phết tế bào',
        normal_range: 'Âm tính',
        unit: 'Copies/ml',
        description: 'Xét nghiệm phát hiện vi khuẩn Mycoplasma genitalium gây viêm niệu đạo và viêm cổ tử cung.',
        price: 200000,
        is_active: true
      },
      {
        name: 'Xét nghiệm Ureaplasma urealyticum',
        specimen: 'Nước tiểu/Phết tế bào',
        normal_range: 'Âm tính',
        unit: 'Copies/ml',
        description: 'Xét nghiệm phát hiện vi khuẩn Ureaplasma urealyticum gây viêm niệu đạo.',
        price: 180000,
        is_active: true
      },
      {
        name: 'Gói xét nghiệm STIs cơ bản',
        specimen: 'Máu tĩnh mạch + Nước tiểu',
        normal_range: 'Âm tính',
        unit: 'N/A',
        description:
          'Gói xét nghiệm bao gồm: HIV, Chlamydia, Gonorrhea, Giang mai. Phù hợp cho việc tầm soát STIs cơ bản.',
        price: 650000,
        is_active: true
      },
      {
        name: 'Gói xét nghiệm STIs toàn diện',
        specimen: 'Máu tĩnh mạch + Nước tiểu + Phết tế bào',
        normal_range: 'Âm tính',
        unit: 'N/A',
        description:
          'Gói xét nghiệm bao gồm tất cả các xét nghiệm STIs: HIV, Chlamydia, Gonorrhea, Giang mai, HSV, HPV, Trichomonas, Mycoplasma, Ureaplasma.',
        price: 1200000,
        is_active: true
      },
      {
        name: 'Xét nghiệm HBsAg (Viêm gan B)',
        specimen: 'Máu tĩnh mạch',
        normal_range: 'Âm tính',
        unit: 'S/CO',
        description: 'Xét nghiệm phát hiện kháng nguyên bề mặt virus viêm gan B (HBsAg).',
        price: 120000,
        is_active: true
      },
      {
        name: 'Xét nghiệm Anti-HCV (Viêm gan C)',
        specimen: 'Máu tĩnh mạch',
        normal_range: 'Âm tính',
        unit: 'S/CO',
        description: 'Xét nghiệm phát hiện kháng thể kháng virus viêm gan C.',
        price: 150000,
        is_active: true
      }
    ]

    // Lưu tất cả xét nghiệm STIs vào database
    const savedTests = await laboratoryRepository.save(stiTests)

    console.log(`✅ Successfully created ${savedTests.length} STI tests`)
    console.log('\n📋 STI Tests created:')

    savedTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.name} - ${test.price.toLocaleString('vi-VN')} VNĐ`)
    })

    console.log('\n💰 Price Summary:')
    const totalPrice = savedTests.reduce((sum, test) => sum + test.price, 0)
    console.log(`Total value: ${totalPrice.toLocaleString('vi-VN')} VNĐ`)
  } catch (error) {
    console.error('❌ Error creating STI tests:', error)
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
createSTITests()

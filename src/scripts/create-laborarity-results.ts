import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import LaboratoryAppointment from '../models/Entity/laborarity_appointment.entity.js'
import Result from '../models/Entity/result.entity.js'
import { StatusAppointment } from '../enum/statusAppointment.enum.js'

// IDs of the appointments to add results for (from the previous script output)
const APPOINTMENT_IDS = [
  'b1dc13c6-6a54-4018-af6d-fe6186724a8c', // Herpes & Giang mai
  'e5a32565-1ba4-4f33-aef9-0c0b62d27a2d', // Anti-HCV, Neisseria & HSV
  'd115dfb4-8ab3-4251-a161-ac9b75a355c7' // Gói xét nghiệm STIs toàn diện
]

// Function to generate realistic test results based on test name
function generateTestResult(testName: string) {
  // Default values
  let result = 0
  let unit = ''
  let normalRange = ''
  let conclusion = ''

  // Generate results based on test type
  if (testName.includes('Herpes') || testName.includes('HSV')) {
    // HSV test - typically negative (0) or positive (1)
    result = Math.random() > 0.9 ? 1 : 0 // 10% chance of positive
    unit = 'Index'
    normalRange = '< 0.9'
    conclusion =
      result < 0.9 ? 'Âm tính. Không phát hiện kháng thể HSV.' : 'Dương tính. Có kháng thể HSV, cần tư vấn với bác sĩ.'
  } else if (testName.includes('Giang mai') || testName.includes('Treponema')) {
    // Syphilis test - typically negative (0) or positive (1)
    result = Math.random() > 0.95 ? 1 : 0 // 5% chance of positive
    unit = 'Index'
    normalRange = '< 1.0'
    conclusion =
      result < 1.0
        ? 'Âm tính. Không phát hiện kháng thể Treponema pallidum.'
        : 'Dương tính. Có kháng thể Treponema pallidum, cần điều trị.'
  } else if (testName.includes('HCV') || testName.includes('gan C')) {
    // Hepatitis C test
    result = Math.random() > 0.92 ? 1.2 + Math.random() : 0.2 + Math.random() * 0.5 // 8% chance of positive
    result = parseFloat(result.toFixed(2))
    unit = 'S/CO'
    normalRange = '< 1.0'
    conclusion =
      result < 1.0
        ? 'Âm tính. Không phát hiện kháng thể HCV.'
        : 'Dương tính. Có kháng thể HCV, cần xét nghiệm khẳng định.'
  } else if (testName.includes('Neisseria') || testName.includes('gonorrhoeae')) {
    // Gonorrhea test
    result = Math.random() > 0.9 ? 1 : 0 // 10% chance of positive
    unit = 'Index'
    normalRange = '< 0.8'
    conclusion =
      result < 0.8
        ? 'Âm tính. Không phát hiện Neisseria gonorrhoeae.'
        : 'Dương tính. Có Neisseria gonorrhoeae, cần điều trị kháng sinh.'
  } else if (testName.includes('HIV')) {
    // HIV test
    result = Math.random() > 0.97 ? 1.5 + Math.random() : 0.1 + Math.random() * 0.6 // 3% chance of positive
    result = parseFloat(result.toFixed(2))
    unit = 'S/CO'
    normalRange = '< 1.0'
    conclusion =
      result < 1.0
        ? 'Âm tính. Không phát hiện kháng thể HIV.'
        : 'Dương tính. Có kháng thể HIV, cần xét nghiệm khẳng định Western Blot.'
  } else if (testName.includes('HBsAg') || testName.includes('gan B')) {
    // Hepatitis B test
    result = Math.random() > 0.9 ? 250 + Math.random() * 500 : Math.random() * 100 // 10% chance of positive
    result = parseFloat(result.toFixed(2))
    unit = 'mIU/ml'
    normalRange = '< 100'
    conclusion = result < 100 ? 'Âm tính. Không phát hiện HBsAg.' : 'Dương tính. Có HBsAg, cần tư vấn với bác sĩ.'
  } else if (testName.includes('toàn diện') || testName.includes('Gói')) {
    // Comprehensive STI package - create multiple results
    // For simplicity, we'll return a generic result and handle the package specially
    result = Math.random() > 0.8 ? 1 : 0 // 20% chance of some positive finding
    unit = 'Index'
    normalRange = '0'
    conclusion =
      result === 0
        ? 'Tất cả các xét nghiệm trong gói đều âm tính.'
        : 'Có bất thường trong một số xét nghiệm, xem chi tiết từng xét nghiệm.'
  } else {
    // Generic result for other tests
    result = Math.random() * 10
    result = parseFloat(result.toFixed(2))
    unit = 'U/L'
    normalRange = '0.0 - 5.0'
    conclusion =
      result <= 5.0
        ? 'Kết quả trong giới hạn bình thường.'
        : 'Kết quả cao hơn giới hạn bình thường, cần tư vấn với bác sĩ.'
  }

  return { result, unit, normalRange, conclusion }
}

async function createLaborarityResults() {
  try {
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const laboratoryAppointmentRepository = AppDataSource.getRepository(LaboratoryAppointment)
    const resultRepository = AppDataSource.getRepository(Result)

    // Process each appointment
    for (const appointmentId of APPOINTMENT_IDS) {
      // Get the appointment with its laborarity tests
      const appointment = await laboratoryAppointmentRepository.findOne({
        where: { app_id: appointmentId },
        relations: ['laborarity']
      })

      if (!appointment) {
        console.log(`❌ Appointment with ID ${appointmentId} not found`)
        continue
      }

      console.log(`Processing appointment: ${appointmentId}`)
      console.log(`Date: ${new Date(appointment.date).toISOString().split('T')[0]}`)
      console.log(`Tests: ${appointment.laborarity.length}`)

      const results = []

      // Handle comprehensive package specially
      if (appointment.laborarity.some((lab) => lab.name.includes('toàn diện') || lab.name.includes('Gói'))) {
        // For a comprehensive package, create results for common STI tests
        const stiTests = [
          {
            name: 'HIV (Anti-HIV)',
            ...generateTestResult('HIV')
          },
          {
            name: 'HBsAg (Viêm gan B)',
            ...generateTestResult('HBsAg')
          },
          {
            name: 'Anti-HCV (Viêm gan C)',
            ...generateTestResult('HCV')
          },
          {
            name: 'Treponema pallidum (Giang mai)',
            ...generateTestResult('Giang mai')
          },
          {
            name: 'Neisseria gonorrhoeae',
            ...generateTestResult('Neisseria')
          },
          {
            name: 'Herpes Simplex Virus (HSV)',
            ...generateTestResult('HSV')
          },
          {
            name: 'Chlamydia trachomatis',
            result: Math.random() > 0.9 ? 1 : 0,
            unit: 'Index',
            normalRange: '< 0.9',
            conclusion:
              Math.random() > 0.9
                ? 'Dương tính. Có Chlamydia trachomatis, cần điều trị.'
                : 'Âm tính. Không phát hiện Chlamydia trachomatis.'
          }
        ]

        for (const test of stiTests) {
          const result = resultRepository.create({
            name: test.name,
            result: test.result,
            unit: test.unit,
            normal_range: test.normalRange,
            conclusion: test.conclusion,
            laboratoryAppointment: appointment
          })
          results.push(result)
        }
      } else {
        // For individual tests, create a result for each test
        for (const lab of appointment.laborarity) {
          const { result, unit, normalRange, conclusion } = generateTestResult(lab.name)

          const resultEntity = resultRepository.create({
            name: lab.name,
            result,
            unit,
            normal_range: normalRange,
            conclusion,
            laboratoryAppointment: appointment
          })
          results.push(resultEntity)
        }
      }

      // Save all results
      const savedResults = await resultRepository.save(results)

      // Update appointment status to COMPLETED
      appointment.status = StatusAppointment.COMPLETED
      await laboratoryAppointmentRepository.save(appointment)

      console.log(`✅ Added ${savedResults.length} results for appointment ${appointmentId}`)
      savedResults.forEach((result, idx) => {
        console.log(
          `  ${idx + 1}. ${result.name}: ${result.result} ${result.unit} (Normal range: ${result.normal_range})`
        )
        console.log(`     Conclusion: ${result.conclusion}`)
      })
      console.log('-----------------------------------')
    }

    console.log('✅ Successfully added results for all specified appointments')
  } catch (error) {
    console.error('❌ Error creating laborarity results:', error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('Database connection closed')
    }
    process.exit(0)
  }
}

createLaborarityResults()

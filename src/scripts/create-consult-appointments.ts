import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import ConsultantPattern from '../models/Entity/consultant_pattern.entity.js'
import ConsultAppointment from '../models/Entity/consult_appointment.entity.js'
import { Role } from '../enum/role.enum.js'
import { StatusAppointment } from '../enum/statusAppointment.enum.js'

const CUSTOMER_ID = '2e7f0017-083d-4b04-8cb7-693723d99c96'

async function createConsultAppointments() {
  try {
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const accountRepository = AppDataSource.getRepository(Account)
    const consultantPatternRepository = AppDataSource.getRepository(ConsultantPattern)
    const consultAppointmentRepository = AppDataSource.getRepository(ConsultAppointment)

    // Get the customer
    const customer = await accountRepository.findOne({
      where: { account_id: CUSTOMER_ID }
    })
    if (!customer) {
      console.log('❌ Customer not found')
      return
    }

    // Get all consultants
    const consultants = await accountRepository.find({
      where: { role: Role.CONSULTANT }
    })
    if (consultants.length < 5) {
      console.log('❌ Not enough consultants found')
      return
    }

    // Pick 5 random consultants
    const shuffledConsultants = consultants.sort(() => 0.5 - Math.random())
    const selectedConsultants = shuffledConsultants.slice(0, 5)

    const appointments = []
    for (const consultant of selectedConsultants) {
      // Get all available patterns for this consultant (not booked, no appointment)
      const patterns = await consultantPatternRepository.find({
        where: {
          account_id: consultant.account_id,
          is_booked: false
        },
        relations: ['consult_appointment']
      })
      // Filter out patterns that already have an appointment
      const availablePatterns = patterns.filter((p) => !p.consult_appointment)
      if (availablePatterns.length === 0) {
        console.log(`⚠️ No available patterns for consultant ${consultant.full_name}`)
        continue
      }
      // Pick a random pattern
      const pattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)]
      // Create appointment
      const appointment = consultAppointmentRepository.create({
        status: StatusAppointment.PENDING,
        description: faker.lorem.sentence(),
        customer,
        consultant_pattern: pattern,
        report: null
      })
      appointments.push(appointment)
      // Mark pattern as booked
      pattern.is_booked = true
      await consultantPatternRepository.save(pattern)
    }

    if (appointments.length === 0) {
      console.log('❌ No appointments created')
      return
    }

    // Save all appointments
    const savedAppointments = await consultAppointmentRepository.save(appointments)
    console.log(
      `✅ Successfully created ${savedAppointments.length} consult appointments for customer ${customer.full_name}`
    )
    savedAppointments.forEach((app, idx) => {
      console.log(`  ${idx + 1}. Appointment ID: ${app.app_id}`)
    })
  } catch (error) {
    console.error('❌ Error creating consult appointments:', error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('Database connection closed')
    }
    process.exit(0)
  }
}

createConsultAppointments()

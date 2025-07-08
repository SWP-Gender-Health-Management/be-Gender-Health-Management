import { faker } from '@faker-js/faker'
import { AppDataSource } from '../config/database.config.js'
import Account from '../models/Entity/account.entity.js'
import WorkingSlot from '../models/Entity/working_slot.entity.js'
import LaboratoryAppointment from '../models/Entity/laborarity_appointment.entity.js'
import Laborarity from '../models/Entity/laborarity.entity.js'
import { TypeAppointment } from '../enum/type_appointment.enum.js'
import { StatusAppointment } from '../enum/statusAppointment.enum.js'

const CUSTOMER_ID = '2e7f0017-083d-4b04-8cb7-693723d99c96'

async function createLaborarityAppointments() {
  try {
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const accountRepository = AppDataSource.getRepository(Account)
    const workingSlotRepository = AppDataSource.getRepository(WorkingSlot)
    const laboratoryAppointmentRepository = AppDataSource.getRepository(LaboratoryAppointment)
    const laborarityRepository = AppDataSource.getRepository(Laborarity)

    // Get the customer
    const customer = await accountRepository.findOne({
      where: { account_id: CUSTOMER_ID }
    })
    if (!customer) {
      console.log('❌ Customer not found')
      return
    }

    // Get all working slots for laboratory appointments
    const workingSlots = await workingSlotRepository.find({
      where: { type: TypeAppointment.LABORATORY }
    })
    if (workingSlots.length === 0) {
      console.log('❌ No working slots found for laboratory appointments')
      return
    }

    // Get all laborarity tests
    const laborarityTests = await laborarityRepository.find({
      where: { is_active: true }
    })
    if (laborarityTests.length === 0) {
      console.log('❌ No laborarity tests found')
      return
    }

    // Generate 5 random dates between 16/6 and 30/6/2025
    const startDate = new Date('2025-06-16')
    const endDate = new Date('2025-06-30')
    const dateRange = endDate.getTime() - startDate.getTime()

    const randomDates = Array.from({ length: 5 }, () => {
      const randomTime = Math.random() * dateRange
      const date = new Date(startDate.getTime() + randomTime)
      return new Date(date.setHours(0, 0, 0, 0))
    }).sort((a, b) => a.getTime() - b.getTime()) // Sort dates chronologically

    // Create 5 appointments with random slots and dates
    const appointments = []
    for (let i = 0; i < 5; i++) {
      // Select a random working slot
      const randomSlot = workingSlots[Math.floor(Math.random() * workingSlots.length)]

      // Select 1-3 random laborarity tests
      const numberOfTests = Math.floor(Math.random() * 3) + 1
      const selectedTests = []
      const usedIndices = new Set()

      for (let j = 0; j < numberOfTests; j++) {
        let randomIndex
        do {
          randomIndex = Math.floor(Math.random() * laborarityTests.length)
        } while (usedIndices.has(randomIndex))

        usedIndices.add(randomIndex)
        selectedTests.push(laborarityTests[randomIndex])
      }

      // Get queue index (count existing appointments for the same slot and date)
      const queueIndex = await laboratoryAppointmentRepository.count({
        where: {
          working_slot: { slot_id: randomSlot.slot_id },
          date: randomDates[i]
        }
      })

      // Create appointment
      const appointment = laboratoryAppointmentRepository.create({
        queue_index: queueIndex + 1,
        description: faker.lorem.sentence(),
        date: randomDates[i],
        status: StatusAppointment.PENDING,
        customer: customer,
        working_slot: randomSlot,
        laborarity: selectedTests
      })

      appointments.push(appointment)
    }

    if (appointments.length === 0) {
      console.log('❌ No appointments created')
      return
    }

    // Save all appointments
    const savedAppointments = await laboratoryAppointmentRepository.save(appointments)
    console.log(
      `✅ Successfully created ${savedAppointments.length} laborarity appointments for customer ${customer.full_name}`
    )

    // Log details of each appointment
    savedAppointments.forEach((app, idx) => {
      console.log(`  ${idx + 1}. Appointment ID: ${app.app_id}`)
      console.log(`     Date: ${app.date.toISOString().split('T')[0]}`)
      console.log(`     Time: ${app.working_slot.start_at} - ${app.working_slot.end_at}`)
      console.log(`     Tests: ${app.laborarity.length} tests`)
      app.laborarity.forEach((lab, labIdx) => {
        console.log(`       - ${labIdx + 1}. ${lab.name} (${lab.price} VND)`)
      })
      console.log(`     Total cost: ${app.laborarity.reduce((sum, lab) => sum + lab.price, 0)} VND`)
    })
  } catch (error) {
    console.error('❌ Error creating laborarity appointments:', error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('Database connection closed')
    }
    process.exit(0)
  }
}

createLaborarityAppointments()

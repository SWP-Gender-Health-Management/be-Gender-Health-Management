import { AppDataSource } from '../config/database.config.js'
import LaboratoryAppointment from '../models/Entity/laborarity_appointment.entity.js'
import Result from '../models/Entity/result.entity.js'
import { StatusAppointment } from '../enum/statusAppointment.enum.js'

async function updateLaborarityAppointmentStatus() {
  try {
    await AppDataSource.initialize()
    console.log('Database connected successfully')

    const laboratoryAppointmentRepository = AppDataSource.getRepository(LaboratoryAppointment)
    const resultRepository = AppDataSource.getRepository(Result)

    // Find all appointments that have results
    const appointmentsWithResults = await laboratoryAppointmentRepository
      .createQueryBuilder('appointment')
      .innerJoin('appointment.result', 'result')
      .where('result.result_id IS NOT NULL')
      .getMany()

    if (appointmentsWithResults.length === 0) {
      console.log('❌ No appointments with results found')
      return
    }

    console.log(`Found ${appointmentsWithResults.length} appointments with results`)

    // Update status to COMPLETED for each appointment
    const updatedAppointments = []
    for (const appointment of appointmentsWithResults) {
      if (appointment.status !== StatusAppointment.COMPLETED) {
        appointment.status = StatusAppointment.COMPLETED
        updatedAppointments.push(appointment)
      }
    }

    if (updatedAppointments.length === 0) {
      console.log('✅ All appointments with results are already marked as COMPLETED')
      return
    }

    // Save the updated appointments
    await laboratoryAppointmentRepository.save(updatedAppointments)

    console.log(`✅ Successfully updated ${updatedAppointments.length} appointments to COMPLETED status`)

    // Log details of each updated appointment
    updatedAppointments.forEach((app, idx) => {
      console.log(`  ${idx + 1}. Appointment ID: ${app.app_id}`)
    })
  } catch (error) {
    console.error('❌ Error updating laborarity appointment status:', error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('Database connection closed')
    }
    process.exit(0)
  }
}

updateLaborarityAppointmentStatus()

export enum StatusAppointment {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PENDING_CANCELLED = 'pending_cancelled',
  CONFIRMED_CANCELLED = 'confirmed_cancelled',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  DELAYED = 'delayed'
}

export const stringToStatus = (status: number) => {
  switch (status) {
    case 0:
      return StatusAppointment.PENDING
    case 1:
      return StatusAppointment.COMPLETED
    case 2:
      return StatusAppointment.PENDING_CANCELLED
    case 3:
      return StatusAppointment.CONFIRMED
    case 4:
      return StatusAppointment.IN_PROGRESS
    case 5:
      return StatusAppointment.DELAYED
  }
}

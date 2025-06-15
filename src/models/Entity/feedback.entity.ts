import {
  Entity,
  Column,
  Timestamp,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne
} from 'typeorm'
import ConsultAppointment from './consult_appointment.entity.js'
import LaboratoryAppointment from './laborarity_appointment.entity.js'

export interface FeedbackType {
  feed_id: string
  content: string
  rating: number
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'feedback' })
export default class Feedback implements FeedbackType {
  @PrimaryGeneratedColumn('uuid')
  feed_id: string

  @Column({ type: 'text', nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  content: string

  @Column({ type: 'integer', nullable: true })
  rating: number

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @OneToOne(() => ConsultAppointment, (consultAppointment: ConsultAppointment) => consultAppointment.feedback)
  consult_appointment: ConsultAppointment

  @OneToOne(
    () => LaboratoryAppointment,
    (laboratoryAppointment: LaboratoryAppointment) => laboratoryAppointment.feedback
  )
  laboratoryAppointment: LaboratoryAppointment
}

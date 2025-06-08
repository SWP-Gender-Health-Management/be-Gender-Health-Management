import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
  ManyToOne,
  OneToOne,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  JoinColumn
} from 'typeorm'
import WorkingSlot from './working_slot.entity'
import Account from './account.entity'
import Result from './result.entity'
import Feedback from './feedback.entity'
import Laborarity from './laborarity.entity'

export interface LaboratoryAppointmentType {
  app_id: string
  queue_index: number
  description: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'laborarity_appointment' })
export default class LaboratoryAppointment implements LaboratoryAppointmentType {
  @PrimaryGeneratedColumn('uuid')
  app_id: string

  @Column({ type: 'int', nullable: false })
  queue_index: number

  @Column({ type: 'text', nullable: true, charset: 'utf8', collation: 'utf8_general_ci' })
  description: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  //foreign key
  @ManyToOne(() => Account, (customer: Account) => customer.laborarity_appointment)
  customer: Account

  @ManyToOne(() => WorkingSlot, (working_slot: WorkingSlot) => working_slot.laborarity_appointment)
  working_slot: WorkingSlot

  @ManyToMany(() => Laborarity, (laborarity: Laborarity) => laborarity.laboratoryAppointment)
  @JoinTable({
    name: 'laboratory_appointment_lab',
    joinColumn: {
      name: 'app_id',
      referencedColumnName: 'app_id'
    },
    inverseJoinColumn: {
      name: 'lab_id',
      referencedColumnName: 'lab_id'
    }
  })
  laborarity: Laborarity[]

  @OneToOne(() => Result, (result: Result) => result.laboratoryAppointment)
  @JoinColumn({ name: 'result_id' })
  result: Result

  @OneToOne(() => Feedback, (feedback: Feedback) => feedback.laboratoryAppointment)
  @JoinColumn({ name: 'feed_id' })
  feedback: Feedback | null
}

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
  PrimaryGeneratedColumn
} from 'typeorm'
import WorkingSlot from './working_slot.entity'
import Account from './account.entity'
import Result from './result.entity'
import Feedback from './feedback.entity'
import Laborarity from './laborarity.entity'

export interface LaboratoryAppointmentType {
  app_id: string
  customer_id: string
  slot_id: string
  lab_id: string
  result_id: string
  feed_id: string
  queue_index: number
  description: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'laborarity_appointment' })
export default class LaboratoryAppointment implements LaboratoryAppointmentType {
  @PrimaryGeneratedColumn('uuid')
  app_id: string

  @Column({ type: 'uuid', nullable: false })
  customer_id: string

  @Column({ type: 'uuid', nullable: false })
  slot_id: string

  @Column({ type: 'uuid', nullable: false })
  lab_id: string

  @Column({ type: 'uuid', nullable: false })
  result_id: string

  @Column({ type: 'uuid', nullable: false })
  feed_id: string

  @Column({ type: 'int', nullable: false })
  queue_index: number

  @Column({ type: 'text', nullable: true, charset: 'utf8', collation: 'utf8_general_ci' })
  description: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

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
  result: Result

  @OneToOne(() => Feedback, (feedback: Feedback) => feedback.laboratoryAppointment)
  feedback: Feedback
}

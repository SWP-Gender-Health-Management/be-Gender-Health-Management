import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
  ManyToOne,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany
} from 'typeorm'
import WorkingSlot from '../Entity/working_slot.entity.js'
import Account from '../Entity/account.entity.js'
import Result from '../Entity/result.entity.js'
import Laborarity from '../Entity/laborarity.entity.js'
import { StatusAppointment } from '../../enum/statusAppointment.enum.js'

export interface LaboratoryAppointmentType {
  app_id: string
  queue_index: number
  description: string
  date: Date
  status: StatusAppointment
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

  @Column({ type: 'text', nullable: true })
  feed_id: string

  @Column({ type: 'date', nullable: true })
  date: Date

  @Column({ type: 'enum', enum: StatusAppointment, default: StatusAppointment.PENDING })
  status: StatusAppointment

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  //foreign key
  @ManyToOne(() => Account, (customer: Account) => customer.labAppointment)
  @JoinColumn({ name: 'customer_id' })
  customer: Account

  @Column({ type: 'uuid', nullable: true, unique: false })
  staff_id: string

  @ManyToOne(() => WorkingSlot, (working_slot: WorkingSlot) => working_slot.laborarity_appointment)
  @JoinColumn({ name: 'slot_id' })
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

  @OneToMany(() => Result, (result: Result) => result.laboratoryAppointment)
  result: Result[]
}

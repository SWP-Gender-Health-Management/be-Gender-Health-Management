import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
  ManyToOne,
  JoinColumn,
  OneToOne,
  ManyToMany,
  JoinTable
} from 'typeorm'
import WorkingSlot from './working_slot.entity'
import Account from './Account.entity'
import Result from './result.entity'
import Feedback from './feedback.entity'
import Laborarity from './laborarity.entity'
// Interface định nghĩa cấu trúc dữ liệu
export interface LaboratoryAppointmentType {
  app_id: string
  customer_id: string
  slot_id: string
  lab_id: string
  result_id: string
  feed_id: string
  queue_index: number
  description: string
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity({ name: 'laborarity_appointment' }) // Tên bảng trong CSDL
export default class LaboratoryAppointment implements LaboratoryAppointmentType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  app_id: string

  @Column({ type: 'varchar', length: 20 })
  customer_id: string

  @Column({ type: 'varchar', length: 20 })
  slot_id: string

  @Column({ type: 'varchar', length: 20 })
  lab_id: string

  @Column({ type: 'varchar', length: 20 })
  result_id: string

  @Column({ type: 'varchar', length: 20 })
  feed_id: string

  @Column({ type: 'int' })
  queue_index: number

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'timestamptz' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (customer) => customer.account_id)
  @JoinColumn({ name: 'customer_id' })
  customer: Account

  @ManyToOne(() => WorkingSlot, (slot) => slot.slot_id)
  @JoinColumn({ name: 'slot_id' })
  slot: WorkingSlot

  @ManyToMany(() => Laborarity, (lab) => lab.lab_id)
  @JoinTable({
    name: 'laboratory_appointment_lab', // name of the junction table
    joinColumn: {
      name: 'app_id',
      referencedColumnName: 'app_id'
    },
    inverseJoinColumn: {
      name: 'lab_id',
      referencedColumnName: 'lab_id'
    }
  })
  lab: Laborarity[]

  @OneToOne(() => Result, (result) => result.result_id)
  @JoinColumn({ name: 'result_id' })
  result: Result

  @OneToOne(() => Feedback, (feedback) => feedback.feed_id)
  @JoinColumn({ name: 'feed_id' })
  feedback: Feedback
}

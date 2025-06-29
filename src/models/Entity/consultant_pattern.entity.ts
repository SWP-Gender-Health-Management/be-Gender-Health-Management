import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Timestamp,
  ManyToOne,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn
} from 'typeorm'
import WorkingSlot from './working_slot.entity.js'
import Account from './account.entity.js'
import ConsultAppointment from './consult_appointment.entity.js'

export interface ConsultantPatternType {
  pattern_id: string
  date: Date
  is_booked: boolean
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'consultant_pattern' })
export default class ConsultantPattern implements ConsultantPatternType {
  @PrimaryGeneratedColumn('uuid')
  pattern_id: string

  @Column({ type: 'uuid', nullable: false })
  account_id: string

  @Column({ type: 'date', nullable: false })
  date: Date

  @Column({ type: 'boolean', default: false })
  is_booked: boolean

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  //foreign key
  @ManyToOne(() => WorkingSlot, (working_slot) => working_slot.consultant_pattern)
  working_slot: WorkingSlot

  @OneToOne(() => ConsultAppointment, (consultAppointment: ConsultAppointment) => consultAppointment.consultant_pattern)
  @JoinColumn({ name: 'app_id' })
  consult_appointment: ConsultAppointment | null
}

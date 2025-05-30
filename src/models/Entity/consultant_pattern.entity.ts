import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Timestamp,
  ManyToOne,
  UpdateDateColumn,
  OneToMany,
  OneToOne
} from 'typeorm'
import WorkingSlot from './working_slot.entity'
import Account from './account.entity'
import ConsultAppointment from './consult_appointment.entity'

export interface ConsultantPatternType {
  pattern_id: string
  slot_id: string
  consultant_id: string
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
  slot_id: string

  @Column({ type: 'uuid', nullable: false })
  consultant_id: string

  @Column({ type: 'date', nullable: false })
  date: Date

  @Column({ type: 'boolean', default: false })
  is_booked: boolean

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(() => WorkingSlot, (working_slot) => working_slot.consultant_pattern)
  working_slot: WorkingSlot

  @ManyToOne(() => Account, (consultant) => consultant.consultant_pattern)
  consultant: Account

  @OneToOne(() => ConsultAppointment, (consultAppointment: ConsultAppointment) => consultAppointment.consultant_pattern)
  consult_appointment: ConsultAppointment
}

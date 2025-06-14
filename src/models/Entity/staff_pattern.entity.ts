import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Timestamp,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm'
import WorkingSlot from '~/models/Entity/working_slot.entity'
import Account from '~/models/Entity/account.entity'

export interface StaffPatternType {
  pattern_id: string
  date: Date
  is_active: boolean
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'staff_pattern' })
export default class StaffPattern implements StaffPatternType {
  @PrimaryGeneratedColumn('uuid')
  pattern_id: string

  @Column({ type: 'date', nullable: false })
  date: Date

  @Column({ type: 'boolean', nullable: false, default: true })
  is_active: boolean

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(() => WorkingSlot, (working_slot: WorkingSlot) => working_slot.staff_pattern)
  working_slot: WorkingSlot

  @ManyToOne(() => Account, (account: Account) => account.consultant_pattern)
  account: Account
}

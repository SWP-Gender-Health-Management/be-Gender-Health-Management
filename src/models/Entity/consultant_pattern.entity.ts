import { Column, Entity, PrimaryColumn, Timestamp, ManyToOne, JoinColumn } from 'typeorm'
import WorkingSlot from './working_slot.entity'
import Account from './Account.entity'

export interface ConsultantPatternType {
  pattern_id: string
  slot_id: string
  consultant_id: string
  date: Date
  is_booked: boolean
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity({ name: 'consultant_pattern' })
export default class ConsultantPattern implements ConsultantPatternType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  pattern_id: string

  @Column({ type: 'varchar', length: 20 })
  slot_id: string

  @Column({ type: 'varchar', length: 20 })
  consultant_id: string

  @Column({ type: 'date' })
  date: Date

  @Column({ type: 'boolean' })
  is_booked: boolean

  @Column({ type: 'timestamptz' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  updated_at: Timestamp

  @ManyToOne(() => WorkingSlot, (slot) => slot.slot_id)
  @JoinColumn({ name: 'slot_id' })
  slot: WorkingSlot

  @ManyToOne(() => Account, (consultant) => consultant.account_id)
  @JoinColumn({ name: 'consultant_id' })
  consultant: Account
}

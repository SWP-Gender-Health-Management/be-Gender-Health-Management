import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Timestamp } from 'typeorm'
import WorkingSlot from './working_slot.entity'
import Account from './Account.entity'

export interface StaffPatternType {
  pattern_id: string
  slot_id: string
  staff_id: string
  date: Date
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity({ name: 'staff_pattern' }) // Tên bảng trong CSDL
export default class StaffPattern implements StaffPatternType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  pattern_id: string

  @Column({ type: 'varchar', length: 20 })
  slot_id: string

  @Column({ type: 'varchar', length: 20 })
  staff_id: string

  @Column({ type: 'date' }) // Giả sử 'date' có thể null
  date: Date

  @Column({ type: 'timestamptz' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  updated_at: Timestamp

  // --- Định nghĩa các mối quan hệ ---

  @ManyToOne(() => WorkingSlot, (slot) => slot.slot_id)
  @JoinColumn({ name: 'slot_id' })
  slot: WorkingSlot

  @ManyToOne(() => Account, (staff) => staff.account_id)
  @JoinColumn({ name: 'staff_id' })
  staff: Account
}

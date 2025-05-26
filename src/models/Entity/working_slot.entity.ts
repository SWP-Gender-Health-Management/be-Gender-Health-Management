import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from 'typeorm'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from 'typeorm'

export interface WorkingSlotType {
  slot_id: string
  name: string
  start_at: Timestamp
  end_at: Timestamp
  type: string
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity({ name: 'working_slot' })
export default class WorkingSlot implements WorkingSlotType {
  @PrimaryGeneratedColumn('uuid')
  slot_id: string

  @Column('varchar', { length: 1000 })
  name: string

  @Column('timestamptz')
  start_at: Timestamp

  @Column('timestamptz')
  end_at: Timestamp

  @Column('varchar', { length: 20 })
  type: string

  @Column({ type: 'timestamptz' })
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp
}

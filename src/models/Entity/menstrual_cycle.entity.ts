import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Timestamp,
  OneToOne,
  UpdateDateColumn,
  CreateDateColumn,
  JoinColumn
} from 'typeorm'
import Account from './account.entity'

export interface MenstrualCycleType {
  cycle_id: string
  start_date: Date
  end_date: Date
  period: number
  note: string
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity('menstrual_cycle')
export default class MenstrualCycle implements MenstrualCycleType {
  @PrimaryGeneratedColumn('uuid')
  cycle_id: string

  @Column({ type: 'date', nullable: false })
  start_date: Date

  @Column({ type: 'date', nullable: false })
  end_date: Date

  @Column({ type: 'int', default: 30 })
  period: number

  @Column({ type: 'text', nullable: true, charset: 'utf8', collation: 'utf8_general_ci' })
  note: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @OneToOne(() => Account, (customer: Account) => customer.menstrualCycle)
  @JoinColumn({ name: 'account_id' })
  customer: Account
}

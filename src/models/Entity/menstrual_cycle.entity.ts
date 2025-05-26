import { Entity, PrimaryColumn, Column, Timestamp, OneToOne, JoinColumn } from 'typeorm'
import Account from './Account.entity'

export interface MenstrualCycleType {
  cycle_id: string
  account_id: string
  start_date: Date
  end_date: Date
  period: number
  note: string
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity('menstrual_cycle')
export default class MenstrualCycle implements MenstrualCycleType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  cycle_id: string

  @Column({ type: 'varchar', length: 20 })
  account_id: string

  @Column({ type: 'date' })
  start_date: Date

  @Column({ type: 'date' })
  end_date: Date

  @Column({ type: 'int' })
  period: number

  @Column({ type: 'text' })
  note: string

  @Column({ type: 'timestamptz' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  updated_at: Timestamp

  @OneToOne(() => Account, (account) => account.account_id)
  @JoinColumn({ name: 'account_id' })
  account: Account
}

import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Timestamp } from 'typeorm'
import Account from './Account.entity'

export interface PaymentHistoryType {
  payment_id: string
  account_id: string
  method: string
  app_id: string
  description: string
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity('payment_history')
export default class PaymentHistory implements PaymentHistoryType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  payment_id: string

  @Column({ type: 'varchar', length: 20 })
  account_id: string

  @Column({ type: 'varchar', length: 20 })
  method: string

  @Column({ type: 'varchar', length: 20 })
  app_id: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'timestamptz' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (account) => account.paymentHistory)
  @JoinColumn({ name: 'account_id' })
  account: Account
}

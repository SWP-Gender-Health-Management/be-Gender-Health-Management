import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Timestamp,
  UpdateDateColumn,
  CreateDateColumn,
  Generated,
  OneToOne,
  JoinColumn
} from 'typeorm'
import Account from './account.entity.js'
import { TransactionStatus } from '../../enum/transaction.enum.js'
import Refund from './refund.entity.js'

export interface TransactionType {
  transaction_id: string
  order_code: number
  amount: number
  status: TransactionStatus
  description: string
  date: Date
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity('transaction')
export default class Transaction implements TransactionType {
  @PrimaryGeneratedColumn('uuid')
  transaction_id: string

  @Generated('increment')
  @Column({ type: 'int', nullable: true })
  order_code: number

  @Column({ type: 'varchar', nullable: false })
  app_id: string

  @Column({ type: 'float', nullable: false })
  amount: number

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus

  @Column({ type: 'text', nullable: true, charset: 'utf8', collation: 'utf8_general_ci' })
  description: string

  @Column({ type: 'date', nullable: true })
  date: Date

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (customer: Account) => customer.transaction)
  customer: Account

  @OneToOne(() => Refund, (refund: Refund) => refund.transaction)
  @JoinColumn({ name: 'refund' })
  refund: Refund
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Timestamp,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm'
import Account from './account.entity'

export interface TransactionType {
  transaction_id: string
  customer_id: string
  method: string
  app_id: string
  date: Timestamp
  description: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity('transaction')
export default class Transaction implements TransactionType {
  @PrimaryGeneratedColumn('uuid')
  transaction_id: string

  @Column({ type: 'uuid', nullable: false })
  customer_id: string

  @Column({ type: 'varchar', length: 20, nullable: false })
  method: string

  @Column({ type: 'uuid', nullable: false })
  app_id: string

  @Column({ type: 'timestamptz' })
  date: Timestamp

  @Column({ type: 'text', nullable: true, charset: 'utf8', collation: 'utf8_general_ci' })
  description: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (account) => account.transaction)
  account: Account
}

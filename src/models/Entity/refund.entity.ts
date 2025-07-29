import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Timestamp,
  ManyToMany,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne
} from 'typeorm'

import Transaction from './transaction.entity.js'

export interface RefundType {
  refund_id: string
  description: string
  amount: number
  is_refunded: boolean
    
}

@Entity({ name: 'refund' })
export default class Refund implements RefundType {
  @PrimaryGeneratedColumn('uuid')
  refund_id: string

  @Column({ type: 'text', /*charset: 'utf8', collation: 'utf8_general_ci' */})
  description: string

  @Column({ type: 'text', /*charset: 'utf8', collation: 'utf8_general_ci' */})
  bankName: string

  @Column({ type: 'text', /*charset: 'utf8', collation: 'utf8_general_ci' */})
  accountNumber: string

  @Column({ type: 'real', nullable: false })
  amount: number

  @Column({ type: 'boolean', default: false })
  is_refunded: boolean

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @OneToOne(
    () => Transaction,
    (transaction: Transaction) => transaction.refund
  )
  transaction: Transaction

  
}

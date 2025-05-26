// src/entity/Reply.ts

import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Timestamp } from 'typeorm'
import Account from './Account.entity'

// Interface định nghĩa cấu trúc dữ liệu cho Reply
export interface ReplyType {
  reply_id: string
  consultant_id: string
  content: string
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity({ name: 'reply' }) // Tên bảng trong CSDL
export default class Reply implements ReplyType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  reply_id: string

  @Column({ type: 'varchar', length: 20 })
  consultant_id: string

  @Column({ type: 'text' })
  content: string

  @Column({ type: 'timestamptz' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (account: Account) => account.account_id)
  @JoinColumn({ name: 'consultant_id', referencedColumnName: 'account_id' })
  consultant: Account
}

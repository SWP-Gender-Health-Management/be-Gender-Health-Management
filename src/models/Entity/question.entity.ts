// src/entity/Question.ts

import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Timestamp } from 'typeorm'
import Account from './Account.entity'
import Reply from './reply.etity'
// Interface định nghĩa cấu trúc dữ liệu cho Question
export interface QuestionType {
  ques_id: string
  reply_id: string
  created_by: string
  status: boolean
  content: string
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity({ name: 'question' }) // Tên bảng trong CSDL
export default class Question implements QuestionType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  ques_id: string

  @Column({ type: 'varchar', length: 20 })
  reply_id: string

  @Column({ type: 'varchar', length: 20 })
  created_by: string

  @Column({ type: 'boolean', default: false }) // Giả sử mặc định là false nếu không có giá trị
  status: boolean

  @Column({ type: 'text' })
  content: string

  @Column({ type: 'timestamptz' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  updated_at: Timestamp

  // --- Định nghĩa các mối quan hệ (Relationships) ---

  @ManyToOne(() => Account, (account: Account) => account.account_id)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'account_id' })
  account: Account

  @ManyToOne(() => Reply, (reply: Reply) => reply.reply_id)
  @JoinColumn({ name: 'reply_id', referencedColumnName: 'reply_id' })
  reply: Reply
}

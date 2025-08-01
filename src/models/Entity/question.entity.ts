import {
  ManyToOne,
  Timestamp,
  UpdateDateColumn,
  OneToOne,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Entity,
  JoinColumn
} from 'typeorm'
import Account from './account.entity.js'
import Reply from './reply.entity.js'

export interface QuestionType {
  ques_id: string
  content: string
}

@Entity({ name: 'question' })
export default class Question implements QuestionType {
  @PrimaryGeneratedColumn('uuid')
  ques_id: string

  @Column({ type: 'text', nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  content: string

  @Column({ type: 'boolean', default: false })
  status: boolean

  @Column({ type: 'boolean', default: false })
  is_replied: boolean

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (customer: Account) => customer.question)
  customer: Account

  @OneToOne(() => Reply, (reply: Reply) => reply.question)
  @JoinColumn({ name: 'reply_id' })
  reply: Reply | null
}

import {
  Entity,
  Column,
  ManyToOne,
  Timestamp,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne
} from 'typeorm'
import Account from './account.entity'
import Question from './question.entity'

export interface ReplyType {
  reply_id: string
  consultant_id: string
  content: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'reply' })
export default class Reply implements ReplyType {
  @PrimaryGeneratedColumn('uuid')
  reply_id: string

  @Column({ type: 'uuid', nullable: false })
  consultant_id: string

  @Column({ type: 'text', nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  content: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (account: Account) => account.reply)
  account: Account

  @OneToOne(() => Question, (question: Question) => question.reply)
  question: Question
}

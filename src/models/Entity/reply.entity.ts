import {
  Entity,
  Column,
  ManyToOne,
  Timestamp,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn
} from 'typeorm'
import Account from '~/models/Entity/account.entity'
import Question from '~/models/Entity/question.entity'

export interface ReplyType {
  reply_id: string
  content: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'reply' })
export default class Reply implements ReplyType {
  @PrimaryGeneratedColumn('uuid')
  reply_id: string

  @Column({ type: 'text', nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  content: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (consultant: Account) => consultant.reply)
  consultant: Account

  @OneToOne(() => Question, (question: Question) => question.reply)
  @JoinColumn({ name: 'ques_id' })
  question: Question
}

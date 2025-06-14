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
import Account from '~/models/Entity/account.entity'
import Reply from '~/models/Entity/reply.entity'
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

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (consultant: Account) => consultant.question)
  consultant: Account

  @OneToOne(() => Reply, (reply: Reply) => reply.question)
  @JoinColumn({ name: 'reply_id' })
  reply: Reply
}

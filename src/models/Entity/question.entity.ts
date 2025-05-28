import {
  ManyToOne,
  Timestamp,
  UpdateDateColumn,
  OneToOne,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Entity
} from 'typeorm'
import Account from './account.entity'
import Reply from './reply.entity'
export interface QuestionType {
  ques_id: string
  reply_id: string
  created_by: string
  content: string
}

@Entity({ name: 'question' })
export default class Question implements QuestionType {
  @PrimaryGeneratedColumn('uuid')
  ques_id: string

  @Column({ type: 'uuid', nullable: false })
  reply_id: string

  @Column({ type: 'uuid', nullable: false })
  created_by: string

  @Column({ type: 'text', nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  content: string

  @Column({ type: 'boolean', default: false })
  status: boolean

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (account: Account) => account.question)
  account: Account

  @OneToOne(() => Reply, (reply: Reply) => reply.question)
  reply: Reply
}

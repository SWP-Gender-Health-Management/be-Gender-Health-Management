import {
  Entity,
  Column,
  Timestamp,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne
} from 'typeorm'
import { TypeAppointment } from '~/enum/type_appointment.enum.js'
import Account from './account.entity.js'

export interface FeedbackType {
  feed_id: string
  app_id: string
  content: string
  rating: number
  type: TypeAppointment
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'feedback' })
export default class Feedback implements FeedbackType {
  @PrimaryGeneratedColumn('uuid')
  feed_id: string

  @Column({ type: 'uuid', nullable: true })
  app_id: string

  @Column({ type: 'text', nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  content: string

  @Column({ type: 'integer', nullable: true })
  rating: number

  @Column({ type: 'enum', enum: TypeAppointment, nullable: false })
  type: TypeAppointment

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (account: Account) => account.feedback)
  account: Account
}

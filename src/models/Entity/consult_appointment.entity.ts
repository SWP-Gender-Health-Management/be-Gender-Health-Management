import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Timestamp, OneToOne } from 'typeorm'
import Account from './Account.entity'

import Feedback from './feedback.entity'
import ConsultantPattern from './consultant_pattern.entity'
export interface ConsultAppointmentType {
  app_id: string
  customer_id: string
  pattern_id: string
  feed_id: string
  status: string
  description: string
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity({ name: 'consult_appointment' })
export default class ConsultAppointment implements ConsultAppointmentType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  app_id: string

  @Column({ type: 'varchar', length: 20 })
  customer_id: string

  @Column({ type: 'varchar', length: 20 })
  pattern_id: string

  @Column({ type: 'varchar', length: 20 })
  feed_id: string

  @Column({ type: 'varchar', length: 100 })
  status: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'timestamptz' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (customer: Account) => customer.account_id)
  @JoinColumn({ name: 'customer_id' })
  customer: Account

  @ManyToOne(() => ConsultantPattern, (pattern: ConsultantPattern) => pattern.pattern_id)
  @JoinColumn({ name: 'pattern_id' })
  pattern: ConsultantPattern

  @OneToOne(() => Feedback, (feedback: Feedback) => feedback.feed_id)
  @JoinColumn({ name: 'feed_id' })
  feedback: Feedback
}

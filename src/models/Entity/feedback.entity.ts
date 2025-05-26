import { Entity, PrimaryColumn, Column, Timestamp } from 'typeorm'

export interface FeedbackType {
  feed_id: string
  content: string
  rating: number
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity({ name: 'feedback' })
export default class Feedback implements FeedbackType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  feed_id: string

  @Column({ type: 'text' })
  content: string

  @Column({ type: 'integer' })
  rating: number

  @Column({ type: 'timestamptz' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  updated_at: Timestamp
}

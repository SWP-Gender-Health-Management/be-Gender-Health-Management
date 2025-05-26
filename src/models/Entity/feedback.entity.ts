import { Entity, PrimaryColumn, Column, Timestamp } from 'typeorm'
import {
  Entity,
  PrimaryColumn,
  Column,
  Timestamp,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm'

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
  @PrimaryGeneratedColumn('uuid')
  feed_id: string

  @Column({ type: 'text' })
  content: string

  @Column({ type: 'integer' })
  rating: number

  @Column({ type: 'timestamptz' })
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp
}

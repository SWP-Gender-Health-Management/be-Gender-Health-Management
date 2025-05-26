import { Entity, PrimaryColumn, Column, Timestamp, ManyToOne, JoinColumn } from 'typeorm'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Timestamp,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm'
import Account from './Account.entity'

export interface BlogType {
  blog_id: string
  title: string
  content: string
  status: string
  status: boolean
  created_by: string
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity('blog')
export default class Blog implements BlogType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  @PrimaryGeneratedColumn('uuid')
  blog_id: string

  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'text' })
  content: string

  @Column({ type: 'varchar', length: 20 })
  status: string
  @Column({ type: 'boolean' })
  status: boolean

  @Column({ type: 'varchar', length: 20 })
  created_by: string

  @Column({ type: 'timestamptz' })
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (account) => account.account_id)
  @JoinColumn({ name: 'created_by' })
  account: Account
}

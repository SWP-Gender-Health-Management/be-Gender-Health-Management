import { Entity, PrimaryColumn, Column, Timestamp, ManyToOne, JoinColumn } from 'typeorm'
import Account from './Account.entity'

export interface BlogType {
  blog_id: string
  title: string
  content: string
  status: string
  created_by: string
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity('blog')
export default class Blog implements BlogType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  blog_id: string

  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'text' })
  content: string

  @Column({ type: 'varchar', length: 20 })
  status: string

  @Column({ type: 'varchar', length: 20 })
  created_by: string

  @Column({ type: 'timestamptz' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (account) => account.account_id)
  @JoinColumn({ name: 'created_by' })
  account: Account
}

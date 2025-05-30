import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Timestamp,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm'
import Account from './account.entity'
import { Major } from '~/enum/major.enum'

export interface BlogType {
  blog_id: string
  major: Major
  title: string
  content: string
  status: boolean
  created_by: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity('blog')
export default class Blog implements BlogType {
  @PrimaryGeneratedColumn('uuid')
  blog_id: string

  @Column({ type: 'enum', nullable: false, enum: Major })
  major: Major

  @Column({ type: 'varchar', length: 255, nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  title: string

  @Column({ type: 'text', nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  content: string

  @Column({ type: 'boolean', default: false })
  status: boolean

  @Column({ type: 'uuid', nullable: false })
  created_by: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (account) => account.blog)
  account: Account
}

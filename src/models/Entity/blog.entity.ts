import {
  PrimaryColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Timestamp,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm'
import { Major } from '../../enum/major.enum.js'
import Account from './account.entity.js'

export interface BlogType {
  blog_id: string
  major: Major
  title: string
  content: string
  status: boolean
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity('blog')
export default class Blog implements BlogType {
  @PrimaryGeneratedColumn('uuid')
  blog_id: string

  @Column({ type: 'enum', nullable: false, enum: Major })
  major: Major

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string

  @Column({ type: 'text', nullable: false })
  content: string

  //path of image
  @Column({ type: 'json', nullable: true })
  images: string[]

  @Column({ type: 'boolean', default: false })
  status: boolean

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  //foreign key to author of blog
  @ManyToOne(() => Account, (account) => account.blog)
  account: Account
}

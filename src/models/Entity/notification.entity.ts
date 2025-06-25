import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm'
import { Timestamp } from 'typeorm/browser'
import Account from './account.entity.js'

export interface NotificationType {
  notification_id: string
  title: string
  message: string
  is_read: boolean
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity('notification')
export default class Notification implements NotificationType {
  @PrimaryGeneratedColumn('uuid')
  notification_id: string

  @Column({ type: 'varchar', length: 1000, nullable: true, charset: 'utf8', collation: 'utf8_general_ci' })
  title: string

  @Column({ type: 'varchar', length: 1000, nullable: true, charset: 'utf8', collation: 'utf8_general_ci' })
  message: string

  @Column({ type: 'boolean', default: false })
  is_read: boolean

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(() => Account, (account: Account) => account.notification)
  account: Account
}

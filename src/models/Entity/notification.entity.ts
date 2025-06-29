import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm'
import { Timestamp } from 'typeorm/browser'
import Account from './account.entity.js'
import { TypeNoti } from '~/enum/type_noti.enum.js'

export interface NotificationType {
  noti_id: string
  type: TypeNoti
  title: string
  message: string
  is_read: boolean
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity('notification')
export default class Notification implements NotificationType {
  @PrimaryGeneratedColumn('uuid')
  noti_id: string

  @Column({ type: 'enum', nullable: false, enum: TypeNoti })
  type: TypeNoti

  @Column({ type: 'varchar', length: 1000, nullable: false })
  title: string

  @Column({ type: 'varchar', length: 1000, nullable: false })
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

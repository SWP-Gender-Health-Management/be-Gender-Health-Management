// import { BeforeInsert, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, Timestamp } from 'typeorm'
import {
  PrimaryColumn,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Timestamp
} from 'typeorm'
import idPrefix from '~/constants/idPrefix'
import { v4 as uuidvg4 } from 'uuid'
import RefreshToken from './Refresh_token.entity'
import PaymentHistory from './payment_history.entity'
import MenstrualCycle from './menstrual_cycle.entity'
import Blog from './blog.entity'

export interface AccountType {
  account_id: string
  full_name?: string | null
  email: string
  password: string
  phone?: string | null
  dob?: Date | null
  gender?: string | null
  role: string
  is_verified?: string | null
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity({ name: 'account' })
export default class Account implements AccountType {
  @PrimaryColumn('varchar')
  @PrimaryGeneratedColumn('uuid')
  account_id: string

  @Column('varchar', { length: 1000, nullable: true })
  full_name: string | null

  @Column('varchar', { length: 100 })
  email: string

  @Column('text')
  password: string

  @Column('varchar', { length: 10, nullable: true })
  phone: string | null

  @Column('date', { nullable: true })
  dob: Date | null

  @Column('varchar', { length: 100, nullable: true })
  gender: string | null

  @Column('varchar', { length: 100 })
  role: string

  @Column('text', { default: 'false' })
  is_verified: string

  @Column({ type: 'timestamptz' })
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @OneToOne(() => RefreshToken, (refreshToken: RefreshToken) => refreshToken.account_id)
  @JoinColumn({ name: 'account_id' })
  refreshToken: RefreshToken

  @OneToMany(() => PaymentHistory, (paymentHistory: PaymentHistory) => paymentHistory.account_id)
  @JoinColumn({ name: 'account_id' })
  paymentHistory: PaymentHistory[]

  @OneToOne(() => MenstrualCycle, (menstrualCycle: MenstrualCycle) => menstrualCycle.account_id)
  @JoinColumn({ name: 'account_id' })
  menstrualCycle: MenstrualCycle

  @OneToMany(() => Blog, (blog: Blog) => blog.created_by)
  @JoinColumn({ name: 'account_id' })
  blog: Blog[]

  @BeforeInsert()
  generateId() {
    const prefix = idPrefix.ACCOUNT
    const uuidPart = uuidvg4().split('-')[0] // Lấy 8 ký tự đầu của UUID
    this.account_id = `${prefix}-${uuidPart}`
  }
}

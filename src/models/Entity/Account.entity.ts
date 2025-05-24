import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm'
import idPrefix from '~/constants/idPrefix'
import { v4 as uuidvg4 } from 'uuid'

export interface AccountType {
  account_id: string
  full_name?: string | null
  email: string
  phone?: string | null
  dob?: Date | null
  gender?: string | null
  password: string
  role?: string | null
  is_verified?: string | null
  created_at: Date
  updated_at: Date
}

@Entity()
export default class Account implements AccountType {
  @PrimaryColumn('varchar')
  account_id!: string

  @Column('varchar', { nullable: true })
  full_name: string | null

  @Column('varchar')
  email!: string

  @Column('varchar', { nullable: true })
  phone: string | null

  @Column('date', { nullable: true })
  dob: Date | null

  @Column('varchar', { nullable: true })
  gender: string | null

  @Column('varchar')
  password!: string

  @Column('varchar', { nullable: true })
  role: string | null

  @Column('varchar', { default: 'false' })
  is_verified: string

  @Column('date')
  created_at!: Date

  @Column('date')
  updated_at!: Date

  @BeforeInsert()
  generateId() {
    const prefix = idPrefix.ACCOUNT
    const uuidPart = uuidvg4().split('-')[0] // Lấy 8 ký tự đầu của UUID
    this.account_id = `${prefix}-${uuidPart}`
  }
}

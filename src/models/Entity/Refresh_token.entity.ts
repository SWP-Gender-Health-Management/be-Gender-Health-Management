import { Entity, PrimaryColumn } from 'typeorm'
import { Column } from 'typeorm'
import { Entity, PrimaryColumn, Column, Timestamp, OneToOne, JoinColumn } from 'typeorm'
import Account from './Account.entity'

export interface RefreshTokenType {
  account_id: string
  token: string
  created_at: Date
  updated_at: Date
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity()
export default class refresh_tokens implements RefreshTokenType {
export default class RefreshToken implements RefreshTokenType {
  @PrimaryColumn('varchar')
  account_id: string

  @Column('varchar')
  token: string

  @Column('date')
  created_at: Date
  @Column('timestamptz')
  created_at: Timestamp

  @Column('date')
  updated_at: Date
  @Column('timestamptz')
  updated_at: Timestamp

  @OneToOne(() => Account, (account) => account.account_id)
  @JoinColumn({ name: 'account_id' })
  account: Account
}

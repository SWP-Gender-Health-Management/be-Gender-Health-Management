import { Entity, PrimaryColumn, Column, Timestamp, OneToOne, JoinColumn } from 'typeorm'
import Account from './Account.entity'

export interface RefreshTokenType {
  account_id: string
  token: string
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity()
export default class RefreshToken implements RefreshTokenType {
  @PrimaryColumn('varchar')
  account_id: string

  @Column('varchar')
  token: string

  @Column('timestamptz')
  created_at: Timestamp

  @Column('timestamptz')
  updated_at: Timestamp

  @OneToOne(() => Account, (account) => account.account_id)
  @JoinColumn({ name: 'account_id' })
  account: Account
}

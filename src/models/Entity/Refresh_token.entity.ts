import { Entity, PrimaryColumn, Column, Timestamp, OneToOne, JoinColumn } from 'typeorm'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Timestamp,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm'
import Account from './Account.entity'

export interface RefreshTokenType {
  account_id: string
  token: string
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity()
@Entity({ name: 'refresh_token' })
export default class RefreshToken implements RefreshTokenType {
  @PrimaryColumn('varchar')
  @PrimaryGeneratedColumn('uuid')
  account_id: string

  @Column('varchar')
  @Column({ type: 'varchar' })
  token: string

  @Column('timestamptz')
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @Column('timestamptz')
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @OneToOne(() => Account, (account) => account.account_id)
  @JoinColumn({ name: 'account_id' })
  account: Account
}

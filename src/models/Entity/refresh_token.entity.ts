import {
  Entity,
  Column,
  Timestamp,
  OneToOne,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn
} from 'typeorm'
import Account from './account.entity'

export interface RefreshTokenType {
  token_id: string
  token: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'refresh_token' })
export default class RefreshToken implements RefreshTokenType {
  @PrimaryGeneratedColumn('uuid')
  token_id: string

  @Column({ type: 'text', nullable: false })
  token: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @OneToOne(() => Account, (account: Account) => account.refreshToken)
  @JoinColumn({ name: 'account_id', referencedColumnName: 'account_id' })
  account: Account
}

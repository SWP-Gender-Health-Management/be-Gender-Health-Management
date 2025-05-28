import {
  Entity,
  Column,
  Timestamp,
  OneToOne,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn
} from 'typeorm'
import Account from './account.entity'

export interface RefreshTokenType {
  token_id: string
  account_id: string
  token: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'refresh_token' })
export default class RefreshToken implements RefreshTokenType {
  @PrimaryGeneratedColumn('uuid')
  token_id: string

  @Column({ type: 'uuid', nullable: false })
  account_id: string

  @Column({ type: 'text', nullable: false })
  token: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @OneToOne(() => Account, (account: Account) => account.refreshToken)
  account: Account
}

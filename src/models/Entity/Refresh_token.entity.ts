import { Entity, PrimaryColumn } from 'typeorm'
import { Column } from 'typeorm'

export interface RefreshTokenType {
  account_id: string
  token: string
  created_at: Date
  updated_at: Date
}

@Entity()
export default class refresh_tokens implements RefreshTokenType {
  @PrimaryColumn('varchar')
  account_id: string

  @Column('varchar')
  token: string

  @Column('date')
  created_at: Date

  @Column('date')
  updated_at: Date
}

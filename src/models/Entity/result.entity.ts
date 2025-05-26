import { Column, Entity, PrimaryColumn, Timestamp } from 'typeorm'

export interface ResultType {
  result_id: string
  name: string
  description: string
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity({ name: 'result' })
export default class Result implements ResultType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  result_id: string

  @Column({ type: 'varchar', length: 1000 })
  name: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'timestamptz' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  updated_at: Timestamp
}

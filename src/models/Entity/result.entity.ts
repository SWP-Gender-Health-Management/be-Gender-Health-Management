import { Column, Entity, PrimaryColumn, Timestamp } from 'typeorm'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from 'typeorm'

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
  @PrimaryGeneratedColumn('uuid')
  result_id: string

  @Column({ type: 'varchar', length: 1000 })
  name: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'timestamptz' })
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp
}

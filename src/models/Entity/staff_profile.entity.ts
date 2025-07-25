import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn
} from 'typeorm'
import Account from './account.entity.js'

@Entity({ name: 'staff_profile' })
export default class StaffProfile {
  @PrimaryGeneratedColumn('uuid')
  profile_id: string

  @Column({ type: 'varchar' })
  specialty: string

  @Column({ type: 'float' })
  rating: number

  @Column({ type: 'varchar' })
  description: string

  @Column({ type: 'date' })
  work_start_date: Date

  @Column({ type: 'text', nullable: true })
  gg_meet: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @OneToOne(() => Account, (account: Account) => account.staff_profile)
  account: Account
}

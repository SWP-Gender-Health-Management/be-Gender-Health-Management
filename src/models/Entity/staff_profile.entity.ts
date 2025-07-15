import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
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

  @OneToOne(() => Account, (account: Account) => account.staff_profile)
  account: Account
}

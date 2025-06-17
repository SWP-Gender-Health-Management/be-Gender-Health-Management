import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn
} from 'typeorm'
import RefreshToken from './refresh_token.entity'
import MenstrualCycle from './menstrual_cycle.entity'
import Blog from './blog.entity'
import Transaction from '../../enum/transaction.entity'
import ConsultAppointment from './consult_appointment.entity'
import ConsultantPattern from './consultant_pattern.entity'
import LaboratoryAppointment from './laborarity_appointment.entity'
import Reply from './reply.entity'
import { Role } from '~/enum/role.enum'
import Question from './question.entity'
export interface AccountType {
  account_id: string
  full_name?: string | null
  email: string
  password: string
  phone?: string | null
  dob?: Date | null
  gender?: string | null
  avatar?: string | null
  role: Role
  is_verified?: boolean
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'account' })
export default class Account implements AccountType {
  @PrimaryGeneratedColumn('uuid')
  account_id: string

  @Column({ type: 'varchar', length: 1000, nullable: true, charset: 'utf8', collation: 'utf8_general_ci' })
  full_name?: string

  @Column({ type: 'varchar', length: 100, nullable: false })
  email: string

  @Column({ type: 'text', nullable: false })
  password: string

  @Column({ type: 'varchar', length: 10, nullable: true })
  phone?: string

  @Column({ type: 'date', nullable: true })
  dob?: Date

  @Column({ type: 'varchar', length: 100, nullable: true, charset: 'utf8', collation: 'utf8_general_ci' })
  gender?: string

  @Column({ type: 'text', nullable: true })
  avatar?: string

  @Column({ type: 'enum', default: Role.CUSTOMER, enum: Role })
  role: Role

  @Column({ type: 'boolean', default: false })
  is_verified: boolean

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @OneToOne(() => RefreshToken, (refreshToken: RefreshToken) => refreshToken.account)
  refreshToken: RefreshToken

  @OneToMany(() => Transaction, (transaction: Transaction) => transaction.customer)
  transaction: Transaction[]

  @OneToOne(() => MenstrualCycle, (menstrualCycle: MenstrualCycle) => menstrualCycle.customer)
  menstrualCycle: MenstrualCycle

  @OneToMany(() => Blog, (blog: Blog) => blog.account)
  blog: Blog[]

  @OneToMany(() => ConsultAppointment, (consultAppointment: ConsultAppointment) => consultAppointment.customer)
  consult_appointment: ConsultAppointment[]

  @OneToMany(() => ConsultantPattern, (consultantPattern: ConsultantPattern) => consultantPattern.consultant)
  consultant_pattern: ConsultantPattern[]

  @OneToMany(
    () => LaboratoryAppointment,
    (laboratoryAppointment: LaboratoryAppointment) => laboratoryAppointment.customer
  )
  laborarity_appointment: LaboratoryAppointment[]

  @OneToMany(() => Reply, (reply: Reply) => reply.consultant)
  reply: Reply[]

  @OneToMany(() => Question, (question: Question) => question.consultant)
  question: Question[]
}

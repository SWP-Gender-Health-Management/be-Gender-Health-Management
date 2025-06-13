import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn
} from 'typeorm'
import RefreshToken from '~/models/Entity/refresh_token.entity.js'
import MenstrualCycle from '~/models/Entity/menstrual_cycle.entity.js'
import Blog from '~/models/Entity/blog.entity.js'
import Transaction from '~/models/Entity/transaction.entity.js'
import ConsultAppointment from '~/models/Entity/consult_appointment.entity.js'
import ConsultantPattern from '~/models/Entity/consultant_pattern.entity.js'
import LaboratoryAppointment from '~/models/Entity/laborarity_appointment.entity.js'
import Reply from '~/models/Entity/reply.entity.js'
import { Role } from '~/enum/role.enum.js'
import Question from '~/models/Entity/question.entity.js'
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

  // foreign key
  @OneToOne(() => RefreshToken, (refreshToken: RefreshToken) => refreshToken.account)
  refreshToken: RefreshToken

  @OneToMany(() => Transaction, (transaction: Transaction) => transaction.customer)
  transaction: Transaction[]

  @OneToOne(() => MenstrualCycle, (menstrualCycle: MenstrualCycle) => menstrualCycle.account)
  menstrualCycle: MenstrualCycle

  @OneToMany(() => Blog, (blog: Blog) => blog.account)
  blog: Blog[]

  @OneToMany(() => ConsultAppointment, (consultAppointment: ConsultAppointment) => consultAppointment.customer)
  consult_appointment: ConsultAppointment[]

  @OneToMany(() => ConsultantPattern, (consultantPattern: ConsultantPattern) => consultantPattern.consultant)
  consultant_pattern: ConsultantPattern[]

  @OneToMany(() => LaboratoryAppointment, (labAppointment: LaboratoryAppointment) => labAppointment.customer)
  labAppointment: LaboratoryAppointment[]

  @OneToMany(() => Reply, (reply: Reply) => reply.consultant)
  reply: Reply[]

  @OneToMany(() => Question, (question: Question) => question.consultant)
  question: Question[]
}

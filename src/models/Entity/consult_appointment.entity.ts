import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Timestamp,
  OneToOne,
  UpdateDateColumn,
  CreateDateColumn,
  JoinColumn,
  Transaction
} from 'typeorm'
import Account from './account.entity.js'
import ConsultantPattern from './consultant_pattern.entity.js'
import ConsultReport from './consult_report.entity.js'
import { StatusAppointment } from '../../enum/statusAppointment.enum.js'

export interface ConsultAppointmentType {
  app_id: string
  status: string
  description: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'consult_appointment' })
export default class ConsultAppointment implements ConsultAppointmentType {
  //field
  @PrimaryGeneratedColumn('uuid')
  app_id: string

  @Column({ type: 'enum', nullable: false, enum: StatusAppointment, default: StatusAppointment.PENDING })
  status: string

  @Column({ type: 'text', nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  description: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  //foreign key
  @ManyToOne(() => Account, (customer: Account) => customer.consult_appointment)
  customer: Account

  @OneToOne(() => ConsultantPattern, (consultant_pattern: ConsultantPattern) => consultant_pattern.consult_appointment)
  @JoinColumn({ name: 'pattern_id' })
  consultant_pattern: ConsultantPattern

  @OneToOne(() => ConsultReport, (report: ConsultReport) => report.consult_appointment)
  @JoinColumn({ name: 'report_id' })
  report: ConsultReport | null
}

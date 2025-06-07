import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn
} from 'typeorm'
import ConsultAppointment from './consult_appointment.entity'

export interface ConsultReportType {
  report_id: string
  name: string
  description: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'consult_report' })
export default class ConsultReport implements ConsultReportType {
  @PrimaryGeneratedColumn('uuid')
  report_id: string

  // @Column({ type: 'varchar', length: 1000, nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  @Column({ type: 'varchar', length: 1000, nullable: false})
  name: string

  // @Column({ type: 'text', nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  @Column({ type: 'text', nullable: false })
  description: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @OneToOne(() => ConsultAppointment, (consult_appointment: ConsultAppointment) => consult_appointment.report)
  consult_appointment: ConsultAppointment
}

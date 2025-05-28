import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn
} from 'typeorm'
import LaboratoryAppointment from './laborarity_appointment.entity'

export interface ResultType {
  result_id: string
  name: string
  description: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'result' })
export default class Result implements ResultType {
  @PrimaryGeneratedColumn('uuid')
  result_id: string

  @Column({ type: 'varchar', length: 1000, nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  name: string

  @Column({ type: 'text', nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  description: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @OneToOne(() => LaboratoryAppointment, (laboratoryAppointment: LaboratoryAppointment) => laboratoryAppointment.result)
  laboratoryAppointment: LaboratoryAppointment
}

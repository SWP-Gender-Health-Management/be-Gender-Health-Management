import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn
} from 'typeorm'
import LaboratoryAppointment from './laborarity_appointment.entity.js'

export interface ResultType {
  result_id: string
  name: string
  result: number
  unit: string
  normal_range: string
  conclusion: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'result' })
export default class Result implements ResultType {
  @PrimaryGeneratedColumn('uuid')
  result_id: string

  @Column({ type: 'varchar', length: 1000, nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  name: string

  @Column({ type: 'float', nullable: false })
  result: number

  @Column({ type: 'varchar', length: 100, nullable: false })
  unit: string

  @Column({ type: 'varchar', length: 100, nullable: false })
  normal_range: string

  @Column({ type: 'text', nullable: false })
  conclusion: string

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToOne(
    () => LaboratoryAppointment,
    (laboratoryAppointment: LaboratoryAppointment) => laboratoryAppointment.result
  )
  laboratoryAppointment: LaboratoryAppointment
}

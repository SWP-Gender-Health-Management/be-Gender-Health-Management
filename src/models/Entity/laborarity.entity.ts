import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Timestamp,
  ManyToMany,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm'
import LaboratoryAppointment from './laborarity_appointment.entity'

export interface LaborarityType {
  lab_id: string
  name: string
  description: string
  price: number
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'laborarity' })
export default class Laborarity implements LaborarityType {
  @PrimaryGeneratedColumn('uuid')
  lab_id: string

  @Column({ type: 'varchar', length: 1000, nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  name: string

  @Column({ type: 'text', nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  description: string

  @Column({ type: 'real', nullable: false })
  price: number

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToMany(
    () => LaboratoryAppointment,
    (laboratoryAppointment: LaboratoryAppointment) => laboratoryAppointment.laborarity
  )
  laboratoryAppointment: LaboratoryAppointment[]
}

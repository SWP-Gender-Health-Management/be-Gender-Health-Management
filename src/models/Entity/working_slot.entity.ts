import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn
} from 'typeorm'
import ConsultantPattern from '~/models/Entity/consultant_pattern.entity.js'
import LaboratoryAppointment from '~/models/Entity/laborarity_appointment.entity.js'
import StaffPattern from '~/models/Entity/staff_pattern.entity.js'
import { TypeAppointment } from '~/enum/type_appointment.enum.js'
export interface WorkingSlotType {
  slot_id: string
  name: string
  start_at: string
  end_at: string
  type: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'working_slot' })
export default class WorkingSlot implements WorkingSlotType {
  @PrimaryGeneratedColumn('uuid')
  slot_id: string

  @Column({ type: 'varchar', length: 1000, nullable: false, charset: 'utf8', collation: 'utf8_general_ci' })
  name: string

  @Column({ type: 'time', nullable: true })
  start_at: string

  @Column({ type: 'time', nullable: true })
  end_at: string

  @Column({ type: 'enum', nullable: false, enum: TypeAppointment })
  type: TypeAppointment

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @OneToMany(() => ConsultantPattern, (consultantPattern: ConsultantPattern) => consultantPattern.working_slot)
  consultant_pattern: ConsultantPattern[]

  @OneToMany(
    () => LaboratoryAppointment,
    (laboratoryAppointment: LaboratoryAppointment) => laboratoryAppointment.working_slot
  )
  laborarity_appointment: LaboratoryAppointment[]

  @OneToMany(() => StaffPattern, (staffPattern: StaffPattern) => staffPattern.working_slot)
  staff_pattern: StaffPattern[]
}

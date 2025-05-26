// src/entity/Laboratory.ts

import {
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Timestamp,
  ManyToMany
  // OneToMany, // Nếu entity này có quan hệ với các entity khác
  ManyToMany,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm'
import LaboratoryAppointment from './laborarity_appointment.entity'
import WorkingSlot from './working_slot.entity'

// Interface định nghĩa cấu trúc dữ liệu
export interface LaborarityType {
  lab_id: string
  name: string
  description: string
  price: number
  created_at: Timestamp
  updated_at: Timestamp
}

@Entity({ name: 'laborarity' })
export default class Laborarity implements LaborarityType {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  @PrimaryGeneratedColumn('uuid')
  lab_id: string

  @Column({ type: 'varchar', length: 1000 })
  name: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'real' })
  price: number

  @Column({ type: 'timestamptz' })
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp

  @Column({ type: 'timestamptz' })
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Timestamp

  @ManyToMany(() => LaboratoryAppointment, (appointment) => appointment.app_id)
  appointments: LaboratoryAppointment[]
}

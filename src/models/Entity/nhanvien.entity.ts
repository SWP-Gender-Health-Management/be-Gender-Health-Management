import {
  Entity,
  Column,
  ManyToOne,
  Timestamp,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn
} from 'typeorm'
import Account from './account.entity.js'
import Question from './question.entity.js'

export interface NhanVienType {
  nhanvien_id: string
  salary: number,
  name: string
  // created_at: Timestamp
  // updated_at: Timestamp
}

@Entity({ name: 'nhanvien' })
export default class NhanVien implements NhanVienType {
  @PrimaryGeneratedColumn('identity')
  nhanvien_id: string

  @Column({ type: 'text', nullable: false })
  name: string

  @Column({ nullable: false })
  salary: number

}
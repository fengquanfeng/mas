import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('departments')
export class Department {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  label: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  parentId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Department, department => department.children)
  parent: Department;

  @OneToMany(() => Department, department => department.parent)
  children: Department[];
}

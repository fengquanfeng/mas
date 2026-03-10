import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Role } from '../role/role.entity';

@Entity('menus')
export class Menu {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  path: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  component: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 20, nullable: true, default: 'menu' })
  type: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  affix: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tag: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  hidden: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  active: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  fullpage: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  parentId: string | null;

  @Column({ type: 'int', default: 0 })
  orderNum: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Role, role => role.menus)
  roles: Role[];

  @ManyToOne(() => Menu, menu => menu.children)
  parent: Menu;

  @OneToMany(() => Menu, menu => menu.children)
  children: Menu[];
}

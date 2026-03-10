import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Menu } from '../menu/menu.entity';

@Entity('roles')
export class Role {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  label: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  alias: string;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'varchar', length: 1, default: '1' })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @ManyToMany(() => Menu)
  menus: Menu[];
}

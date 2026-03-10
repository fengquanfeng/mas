import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('logs')
export class Log {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  level: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  type: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cip: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  user: string;

  @Column({ type: 'datetime', nullable: true })
  time: Date;

  @CreateDateColumn()
  createdAt: Date;
}

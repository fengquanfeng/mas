import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Dictionary } from './dictionary.entity';

@Entity('dictionary_items')
export class DictionaryItem {
  @PrimaryGeneratedColumn('increment')
  id: string;  // 字符串ID: 字典ID * 1000 + 序号 (如 "1001", "1002", ... "10001")

  @Column({ type: 'varchar', nullable: false })  // 保留，用于数据库关联查询
  dictionaryId: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  value: string;

  @Column({ type: 'int', default: 0 })
  orderNum: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Dictionary, dictionary => dictionary.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dictionaryId' })
  dictionary: Dictionary;
}

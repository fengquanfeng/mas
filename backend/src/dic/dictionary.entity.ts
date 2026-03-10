import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { DictionaryItem } from './dictionary-item.entity';

@Entity('dictionaries')
export class Dictionary {
  @PrimaryGeneratedColumn('increment')
  id: string;  // 字符串ID: "1", "2", "3", ... (自增)

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  code: string;  // 由后端自动生成，可为空

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DictionaryItem, item => item.dictionary)
  items: DictionaryItem[];
}

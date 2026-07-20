import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  UpdateDateColumn,
} from 'typeorm';

import { AbstractEntity } from '../database/abstract.entity';
import { DocumentStatus } from './document-status.enum';

@Entity('documents')
export class DocumentEntity extends AbstractEntity<DocumentEntity> {
  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Index({ unique: true })
  @Column({ nullable: true, type: 'varchar' })
  contentHash: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

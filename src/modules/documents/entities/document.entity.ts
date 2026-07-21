import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity';
import { DocumentStatus } from '../types/document-status.enum';
import { DocumentChunkEntity } from './document-chunk.entity';

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

  @OneToMany(() => DocumentChunkEntity, (chunk) => chunk.document)
  chunks: DocumentChunkEntity[];
}

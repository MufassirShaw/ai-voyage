import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity';
import { DocumentEntity } from '../entities/document.entity';

// OpenAI text-embedding-3-small produces 1536-dimensional vectors.
const EMBEDDING_DIMENSIONS = 1536;

@Entity('document_chunks')
export class DocumentChunkEntity extends AbstractEntity<DocumentChunkEntity> {
  @ManyToOne(() => DocumentEntity, (document) => document.chunks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'documentId' })
  document: DocumentEntity;

  @Index()
  @Column('int')
  documentId: number;

  @Column('int')
  chunkIndex: number;

  @Column('text')
  content: string;

  @Column('vector', { length: EMBEDDING_DIMENSIONS })
  embedding: number[];
}

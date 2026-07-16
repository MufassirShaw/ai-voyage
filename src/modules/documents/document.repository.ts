import { Injectable } from '@nestjs/common';
import { UpdateResult } from 'typeorm';

import { DatabaseService } from '../database/database.service';
import { DocumentStatus } from './document-status.enum';
import { DocumentEntity } from './document.entity';

@Injectable()
export class DocumentRepository {
  constructor(private readonly db: DatabaseService) {}

  create(title: string, contentHash?: string): Promise<DocumentEntity> {
    return this.db.createOne(DocumentEntity, {
      title,
      contentHash: contentHash ?? null,
      status: DocumentStatus.PENDING,
    });
  }

  findAll(): Promise<DocumentEntity[]> {
    return this.db.findMany(DocumentEntity, { order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<DocumentEntity | null> {
    return this.db.findOne(DocumentEntity, { id });
  }

  findByHash(contentHash: string): Promise<DocumentEntity | null> {
    return this.db.findOne(DocumentEntity, { contentHash });
  }

  updateStatus(id: string, status: DocumentStatus): Promise<UpdateResult> {
    return this.db.updateOne(DocumentEntity, { id }, { status });
  }
}

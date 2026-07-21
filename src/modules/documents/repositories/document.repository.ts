import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

import { DocumentEntity } from '../entities/document.entity';
import { DocumentStatus } from '../types/document-status.enum';

@Injectable()
export class DocumentRepository {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly repo: Repository<DocumentEntity>,
  ) {}

  create(title: string, contentHash?: string): Promise<DocumentEntity> {
    return this.repo.save(
      this.repo.create({
        title,
        contentHash: contentHash ?? null,
        status: DocumentStatus.PENDING,
      }),
    );
  }

  findAll(): Promise<DocumentEntity[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<DocumentEntity | null> {
    return this.repo.findOneBy({ id });
  }

  findByHash(contentHash: string): Promise<DocumentEntity | null> {
    return this.repo.findOneBy({ contentHash });
  }

  updateStatus(id: string, status: DocumentStatus): Promise<UpdateResult> {
    return this.repo.update({ id }, { status });
  }
}

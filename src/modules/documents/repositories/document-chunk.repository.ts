import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { toSql } from 'pgvector';
import { Repository } from 'typeorm';

import { DocumentChunkEntity } from '../entities/document-chunk.entity';

export interface ChunkInput {
  chunkIndex: number;
  content: string;
  embedding: number[];
}

@Injectable()
export class DocumentChunkRepository {
  constructor(
    @InjectRepository(DocumentChunkEntity)
    private readonly repo: Repository<DocumentChunkEntity>,
  ) {}

  insertMany(
    documentId: number,
    chunks: ChunkInput[],
  ): Promise<DocumentChunkEntity[]> {
    return this.repo.save(
      this.repo.create(chunks.map((chunk) => ({ ...chunk, documentId }))),
    );
  }

  // Nearest neighbours by cosine distance (`<=>`), closest first.
  // The parent document is joined in so callers can read its title.
  search(embedding: number[], topK: number): Promise<DocumentChunkEntity[]> {
    return this.repo
      .createQueryBuilder('chunk')
      .leftJoinAndSelect('chunk.document', 'document')
      .orderBy('chunk.embedding <=> :embedding')
      .setParameters({ embedding: toSql(embedding) })
      .limit(topK)
      .getMany();
  }
}

import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

import { DocumentChunkRepository } from '../documents/repositories/document-chunk.repository';
import { DocumentRepository } from '../documents/repositories/document.repository';
import { DocumentStatus } from '../documents/types/document-status.enum';
import { EmbeddingService } from '../embedding/embedding.service';
import { RagQueryDto } from './dto/rag-query.dto';
import { IngestionService } from './ingestion/ingestion.service';
import { TextExtractionService } from './text-extraction/text-extraction.service';

@Injectable()
export class RagService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly chunkRepository: DocumentChunkRepository,
    private readonly ingestionService: IngestionService,
    private readonly documentRepository: DocumentRepository,
    private readonly textExtractionService: TextExtractionService,
  ) {}

  async ingest(file: Express.Multer.File, title?: string) {
    const contentHash = createHash('sha256').update(file.buffer).digest('hex');
    const existing = await this.documentRepository.findByHash(contentHash);

    if (existing) {
      return { documentId: existing.id, status: existing.status };
    }

    const docTitle = title ?? file.originalname;
    const doc = await this.documentRepository.create(docTitle, contentHash);
    const { chunksStored } = await this.processAndIngest(doc.id, file.buffer);

    return {
      documentId: doc.id,
      status: DocumentStatus.COMPLETED,
      chunksStored,
    };
  }

  private async processAndIngest(id: string, buffer: Buffer) {
    await this.documentRepository.updateStatus(id, DocumentStatus.PROCESSING);
    try {
      const text = await this.textExtractionService.extract(buffer);
      const result = await this.ingestionService.ingest(Number(id), text);
      await this.documentRepository.updateStatus(id, DocumentStatus.COMPLETED);
      return result;
    } catch (e) {
      await this.documentRepository.updateStatus(id, DocumentStatus.FAILED);
      throw e;
    }
  }

  async query(dto: RagQueryDto) {
    const topK = dto.topK ?? 5;
    const queryEmbedding = await this.embeddingService.embedOne(dto.question);
    const chunks = await this.chunkRepository.search(queryEmbedding, topK);

    if (!chunks.length) {
      return { answer: 'No documents have been ingested yet.', sources: [] };
    }

    return {
      sources: chunks.map((c) => ({
        title: c.document.title,
        chunkIndex: c.chunkIndex,
      })),
    };
  }
}

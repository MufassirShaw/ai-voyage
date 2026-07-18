import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

import { DocumentStatus } from '../documents/document-status.enum';
import { DocumentRepository } from '../documents/document.repository';
import { VectorStoreService } from '../vector-store/vector-store.service';
import { RagQueryDto } from './dto/rag-query.dto';
import { IngestionService } from './ingestion/ingestion.service';
import { TextExtractionService } from './text-extraction/text-extraction.service';
import { StoredDocument } from './types/rag-document';

@Injectable()
export class RagService {
  constructor(
    private readonly vectorStore: VectorStoreService,
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
    const result = await this.processAndIngest(doc.id, docTitle, file.buffer);

    return { documentId: doc.id, status: doc.status, ...result };
  }

  private async processAndIngest(id: string, title: string, buffer: Buffer) {
    await this.documentRepository.updateStatus(id, DocumentStatus.PROCESSING);
    try {
      const text = await this.textExtractionService.extract(buffer);
      // TODO: ingest the text into the vector store
      // await this.ingestionService.ingest(title, text);
      await this.documentRepository.updateStatus(id, DocumentStatus.COMPLETED);
      return { text, title };
    } catch (e) {
      await this.documentRepository.updateStatus(id, DocumentStatus.FAILED);
      throw e;
    }
  }

  async query(dto: RagQueryDto) {
    const topK = dto.topK ?? 5;
    const chunks = await this.vectorStore.search<StoredDocument>(
      dto.question,
      topK,
    );

    if (!chunks.length) {
      return { answer: 'No documents have been ingested yet.', sources: [] };
    }

    return {
      sources: chunks.map((c) => ({
        title: c.title,
        chunkIndex: c.chunkIndex,
      })),
    };
  }
}

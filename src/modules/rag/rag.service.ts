import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';

import { DocumentStatus } from '../documents/document-status.enum';
import { DocumentRepository } from '../documents/document.repository';
import { VectorStoreService } from '../vector-store/vector-store.service';
import { IngestDocumentDto } from './dto/ingest-document.dto';
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

  async ingest(dto: IngestDocumentDto) {
    const doc = await this.documentRepository.create(dto.title);
    const result = await this.ingestionService.ingest(dto.title, dto.content);
    await this.documentRepository.updateStatus(
      doc.id,
      DocumentStatus.COMPLETED,
    );
    return result;
  }

  async uploadDocument(file: Express.Multer.File, title?: string) {
    const contentHash = createHash('sha256').update(file.buffer).digest('hex');
    const existingDoc = await this.documentRepository.findByHash(contentHash);

    if (existingDoc) {
      return {
        documentId: existingDoc.id,
        status: existingDoc.status,
        hash: contentHash,
      };
    }
    const docTitle = title ?? file.originalname;
    const doc = await this.documentRepository.create(docTitle, contentHash);
    const result = await this.processAndIngest(doc.id, docTitle, file.buffer);

    return {
      documentId: doc.id,
      status: doc.status,
      hash: contentHash,
      ...result,
    };
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

  async listDocuments() {
    const docs = await this.documentRepository.findAll();
    return {
      documents: docs.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        createdAt: d.createdAt,
      })),
    };
  }

  async getDocument(id: string) {
    const doc = await this.documentRepository.findById(id);

    if (!doc) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return {
      id: doc.id,
      title: doc.title,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
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

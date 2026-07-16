import { Anthropic } from '@anthropic-ai/sdk';
import { Injectable, NotFoundException } from '@nestjs/common';

import { AiService } from '../ai/ai.service';
import { DocumentStatus } from '../documents/document-status.enum';
import { DocumentRepository } from '../documents/document.repository';
import { VectorStoreService } from '../vector-store/vector-store.service';
import { IngestDocumentDto } from './dto/ingest-document.dto';
import { RagQueryDto } from './dto/rag-query.dto';
import { IngestionService } from './ingestion/ingestion.service';
import { StoredDocument } from './types/rag-document';

@Injectable()
export class RagService {
  constructor(
    private readonly aiService: AiService,
    private readonly vectorStore: VectorStoreService,
    private readonly ingestionService: IngestionService,
    private readonly documentRepository: DocumentRepository,
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
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
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

    if (chunks.length === 0) {
      return { answer: 'No documents have been ingested yet.', sources: [] };
    }

    const messages: Anthropic.Messages.MessageParam[] = [
      {
        role: 'user',
        content: [
          ...chunks.map((c) => toDocumentBlock(c)),
          { type: 'text', text: dto.question },
        ],
      },
    ];

    const response = await this.aiService.generateText(messages, {
      max_tokens: 2048,
    });

    const answerText = response.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    return {
      answer: answerText,
      sources: chunks.map((c) => ({
        title: c.title,
        chunkIndex: c.chunkIndex,
      })),
    };
  }
}

function toDocumentBlock(
  doc: StoredDocument,
): Anthropic.Messages.ContentBlockParam {
  return {
    type: 'document',
    source: { type: 'text', media_type: 'text/plain', data: doc.content },
    title: `${doc.title} (chunk ${doc.chunkIndex})`,
    citations: { enabled: true },
  } as unknown as Anthropic.Messages.ContentBlockParam;
}

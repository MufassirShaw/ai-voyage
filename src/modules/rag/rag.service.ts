import { Injectable } from '@nestjs/common';
import { Anthropic } from '@anthropic-ai/sdk';
import { AiService } from '../ai/ai.service';
import { EmbeddingService } from './embedding/embedding.service';
import {
  VectorStoreService,
  StoredDocument,
} from './vector-store/vector-store.service';
import { IngestionService } from './ingestion/ingestion.service';
import { IngestDocumentDto } from './dto/ingest-document.dto';
import { RagQueryDto } from './dto/rag-query.dto';

@Injectable()
export class RagService {
  constructor(
    private readonly aiService: AiService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
    private readonly ingestionService: IngestionService,
  ) {}

  async ingest(dto: IngestDocumentDto) {
    return this.ingestionService.ingest(dto.title, dto.content);
  }

  listDocuments() {
    return { titles: this.vectorStore.listTitles() };
  }

  async query(dto: RagQueryDto) {
    const topK = dto.topK ?? 5;
    const queryEmbedding = await this.embeddingService.embedOne(dto.question);
    const chunks = this.vectorStore.search(queryEmbedding, topK);

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
      maxTokens: 2048,
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

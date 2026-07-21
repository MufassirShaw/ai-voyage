import { Injectable } from '@nestjs/common';

import { DocumentChunkRepository } from '@/modules/documents/repositories/document-chunk.repository';
import { EmbeddingService } from '@/modules/embedding/embedding.service';

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;

@Injectable()
export class IngestionService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly chunkRepository: DocumentChunkRepository,
  ) {}

  async ingest(
    documentId: string,
    content: string,
  ): Promise<{ chunksStored: number }> {
    const texts = chunk(content, CHUNK_SIZE, CHUNK_OVERLAP);
    if (!texts.length) {
      return { chunksStored: 0 };
    }

    const embeddings = await this.embeddingService.embed(texts);

    await this.chunkRepository.insertMany(
      documentId,
      texts.map((text, chunkIndex) => ({
        chunkIndex,
        content: text,
        embedding: embeddings[chunkIndex],
      })),
    );

    return { chunksStored: texts.length };
  }
}

function chunk(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
  }
  return chunks;
}

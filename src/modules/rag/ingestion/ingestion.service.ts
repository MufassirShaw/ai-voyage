import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { VectorStoreService } from '@/modules/vector-store/vector-store.service';

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;

@Injectable()
export class IngestionService {
  constructor(private readonly vectorStore: VectorStoreService) {}

  async ingest(
    title: string,
    content: string,
  ): Promise<{ chunksStored: number }> {
    const chunks = chunk(content, CHUNK_SIZE, CHUNK_OVERLAP);
    const docs = chunks.map((text, i) => ({
      id: uuidv4(),
      title,
      chunkIndex: i,
      content: text,
    }));

    await this.vectorStore.addBatch(
      docs.map((doc) => ({ text: doc.content, payload: doc })),
    );

    return { chunksStored: docs.length };
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

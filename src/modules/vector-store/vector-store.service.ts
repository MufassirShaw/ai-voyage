import { Injectable } from '@nestjs/common';

import { EmbeddingService } from './embedding.service';

interface VectorEntry {
  payload: unknown;
  embedding: number[];
}

@Injectable()
export class VectorStoreService {
  private readonly store: VectorEntry[] = [];

  constructor(private readonly embeddingService: EmbeddingService) {}

  async addBatch(
    items: Array<{ text: string; payload: unknown }>,
  ): Promise<void> {
    const embeddings = await this.embeddingService.embed(
      items.map((i) => i.text),
    );
    items.forEach(({ payload }, i) => {
      this.store.push({ payload, embedding: embeddings[i] });
    });
  }

  async search<T>(query: string, topK: number): Promise<T[]> {
    if (!this.store.length) {
      return [];
    }

    const queryEmbedding = await this.embeddingService.embedOne(query);

    return this.store
      .map((entry) => ({
        payload: entry.payload,
        score: cosineSimilarity(queryEmbedding, entry.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((e) => e.payload as T);
  }

  listAll<T>(): T[] {
    return this.store.map((e) => e.payload as T);
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

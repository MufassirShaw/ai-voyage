import { Injectable } from '@nestjs/common';

export interface StoredDocument {
  id: string;
  title: string;
  chunkIndex: number;
  content: string;
}

interface VectorEntry {
  doc: StoredDocument;
  embedding: number[];
}

@Injectable()
export class VectorStoreService {
  private readonly store: VectorEntry[] = [];

  add(doc: StoredDocument, embedding: number[]): void {
    this.store.push({ doc, embedding });
  }

  search(queryEmbedding: number[], topK: number): StoredDocument[] {
    if (this.store.length === 0) return [];

    const scored = this.store.map((entry) => ({
      doc: entry.doc,
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((s) => s.doc);
  }

  listTitles(): string[] {
    const seen = new Set<string>();
    return this.store
      .map((e) => e.doc.title)
      .filter((t) => (seen.has(t) ? false : seen.add(t) && true));
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

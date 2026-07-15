import { Injectable } from '@nestjs/common';
import { VoyageAIClient } from 'voyageai';

@Injectable()
export class EmbeddingService {
  private readonly client: VoyageAIClient;
  private readonly model = 'voyage-3';

  constructor() {
    this.client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });
  }

  async embed(texts: string[]): Promise<number[][]> {
    const result = await this.client.embed({ input: texts, model: this.model });
    return result.data!.map((item) => item.embedding as number[]);
  }

  async embedOne(text: string): Promise<number[]> {
    const [embedding] = await this.embed([text]);
    return embedding;
  }
}

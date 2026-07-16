import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VoyageAIClient } from 'voyageai';

@Injectable()
export class EmbeddingService {
  constructor(
    private readonly client: VoyageAIClient,
    private readonly configService: ConfigService,
  ) {}

  async embed(texts: string[]): Promise<number[][]> {
    const result = await this.client.embed({
      input: texts,
      model: this.configService.get<string>('voyage.model')!,
    });
    return result.data!.map((item) => item.embedding as number[]);
  }

  async embedOne(text: string): Promise<number[]> {
    const [embedding] = await this.embed([text]);
    return embedding;
  }
}

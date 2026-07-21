import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  constructor(
    private readonly client: OpenAI,
    private readonly configService: ConfigService,
  ) {}

  async embed(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: this.configService.get<string>('openai.embeddingModel')!,
      input: texts,
      encoding_format: 'float',
    });
    return response.data.map((item) => item.embedding);
  }

  async embedOne(text: string): Promise<number[]> {
    const [embedding] = await this.embed([text]);
    return embedding;
  }
}

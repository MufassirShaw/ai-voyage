import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';

const OpenAIProvider = {
  provide: OpenAI,
  inject: [ConfigService],
  useFactory: (config: ConfigService) =>
    new OpenAI({ apiKey: config.get<string>('openai.apiKey')! }),
};

@Module({
  providers: [OpenAIProvider, EmbeddingService, VectorStoreService],
  exports: [VectorStoreService],
})
export class VectorStoreModule {}

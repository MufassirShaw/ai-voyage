import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VoyageAIClient } from 'voyageai';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';

@Module({
  providers: [
    {
      provide: VoyageAIClient,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const client = new VoyageAIClient({
          apiKey: config.get<string>('voyage.apiKey'),
        });
        return client;
      },
    },
    EmbeddingService,
    VectorStoreService,
  ],
  exports: [VectorStoreService],
})
export class VectorStoreModule {}

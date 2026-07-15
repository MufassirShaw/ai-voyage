import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { EmbeddingService } from './embedding/embedding.service';
import { VectorStoreService } from './vector-store/vector-store.service';
import { IngestionService } from './ingestion/ingestion.service';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';

@Module({
  imports: [AiModule],
  controllers: [RagController],
  providers: [
    EmbeddingService,
    VectorStoreService,
    IngestionService,
    RagService,
  ],
})
export class RagModule {}

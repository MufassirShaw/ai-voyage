import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { IngestionService } from './ingestion/ingestion.service';
import { RagController } from './rag.controller';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { RagService } from './rag.service';

@Module({
  imports: [AiModule, VectorStoreModule],
  controllers: [RagController],
  providers: [RagService, IngestionService],
})
export class RagModule {}

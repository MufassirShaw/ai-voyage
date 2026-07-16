import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { DocumentsModule } from '../documents/documents.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { IngestionService } from './ingestion/ingestion.service';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';

@Module({
  imports: [AiModule, VectorStoreModule, DocumentsModule],
  controllers: [RagController],
  providers: [RagService, IngestionService],
})
export class RagModule {}

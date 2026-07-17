import { Module } from '@nestjs/common';

import { DocumentsModule } from '../documents/documents.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { IngestionService } from './ingestion/ingestion.service';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { TextExtractionService } from './text-extraction/text-extraction.service';

@Module({
  imports: [VectorStoreModule, DocumentsModule],
  controllers: [RagController],
  providers: [RagService, IngestionService, TextExtractionService],
})
export class RagModule {}

import { Module } from '@nestjs/common';

import { DocumentsModule } from '../documents/documents.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { IngestionService } from './ingestion/ingestion.service';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { TextExtractionService } from './text-extraction/text-extraction.service';

@Module({
  imports: [EmbeddingModule, DocumentsModule],
  controllers: [RagController],
  providers: [RagService, IngestionService, TextExtractionService],
})
export class RagModule {}

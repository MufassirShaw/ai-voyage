import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentChunkEntity } from './entities/document-chunk.entity';
import { DocumentEntity } from './entities/document.entity';
import { DocumentChunkRepository } from './repositories/document-chunk.repository';
import { DocumentRepository } from './repositories/document.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity, DocumentChunkEntity])],
  controllers: [DocumentsController],
  providers: [DocumentRepository, DocumentChunkRepository, DocumentsService],
  exports: [DocumentRepository, DocumentChunkRepository],
})
export class DocumentsModule {}

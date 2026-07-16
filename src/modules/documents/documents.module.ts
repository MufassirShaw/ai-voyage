import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentEntity } from './document.entity';
import { DocumentRepository } from './document.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity])],
  providers: [DocumentRepository],
  exports: [DocumentRepository],
})
export class DocumentsModule {}

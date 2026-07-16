import { Body, Controller, Get, Post } from '@nestjs/common';

import { IngestDocumentDto } from './dto/ingest-document.dto';
import { RagQueryDto } from './dto/rag-query.dto';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('documents')
  ingest(@Body() dto: IngestDocumentDto) {
    return this.ragService.ingest(dto);
  }

  @Get('documents')
  listDocuments() {
    return this.ragService.listDocuments();
  }

  @Post('query')
  query(@Body() dto: RagQueryDto) {
    return this.ragService.query(dto);
  }
}

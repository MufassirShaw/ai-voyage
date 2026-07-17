import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipe,
  PayloadTooLargeException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';

import { RagQueryDto } from './dto/rag-query.dto';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly configService: ConfigService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('document/ingest')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'application/pdf' })],
      }),
    )
    file: Express.Multer.File,
    @Body('title') title?: string,
  ) {
    const maxFileSize = this.configService.get<number>('upload.maxFileSize')!;

    // could be refactored to use the FileValidationPipe
    if (file.size > maxFileSize) {
      throw new PayloadTooLargeException(
        `File exceeds the ${maxFileSize} byte limit`,
      );
    }

    return this.ragService.uploadDocument(file, title);
  }

  @Get('documents')
  listDocuments() {
    return this.ragService.listDocuments();
  }

  @Get('documents/:id')
  getDocument(@Param('id') id: string) {
    return this.ragService.getDocument(id);
  }

  @Post('query')
  query(@Body() dto: RagQueryDto) {
    return this.ragService.query(dto);
  }
}

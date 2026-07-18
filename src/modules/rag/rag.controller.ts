import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
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
  @Post('ingest')
  @UseInterceptors(FileInterceptor('file'))
  ingest(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'application/pdf' })],
      }),
    )
    file: Express.Multer.File,
    @Body('title') title?: string,
  ) {
    const maxFileSize = this.configService.get<number>('upload.maxFileSize')!;
    if (file.size > maxFileSize) {
      throw new PayloadTooLargeException(
        `File exceeds the ${maxFileSize} byte limit`,
      );
    }
    return this.ragService.ingest(file, title);
  }

  @Post('query')
  query(@Body() dto: RagQueryDto) {
    return this.ragService.query(dto);
  }
}

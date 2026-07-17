import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { AppController } from './app.controller';
import { configuration } from './config/configuration';
import { AiModule } from './modules/ai/ai.module';
import { ChatModule } from './modules/chat/chat.module';
import { DatabaseModule } from './modules/database/database.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { RagModule } from './modules/rag/rag.module';
import { VectorStoreModule } from './modules/vector-store/vector-store.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    DatabaseModule,
    DocumentsModule,
    VectorStoreModule,
    AiModule,
    ChatModule,
    RagModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

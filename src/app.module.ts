import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { configuration } from './config/configuration';
import { AiModule } from './modules/ai/ai.module';
import { VectorStoreModule } from './modules/vector-store/vector-store.module';
import { ChatModule } from './modules/chat/chat.module';
import { RagModule } from './modules/rag/rag.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    VectorStoreModule,
    AiModule,
    ChatModule,
    RagModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

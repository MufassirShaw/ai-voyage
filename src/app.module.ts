import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AiModule } from './modules/ai/ai.module';
import { ChatModule } from './modules/chat/chat.module';
import { RagModule } from './modules/rag/rag.module';

@Module({
  imports: [AiModule, ChatModule, RagModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

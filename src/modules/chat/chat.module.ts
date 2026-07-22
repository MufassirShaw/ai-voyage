import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from '../ai/ai.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessageEntity } from './entities/chat-message.entity';
import { ChatSessionEntity } from './entities/chat-session.entity';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { ChatSessionRepository } from './repositories/chat-session.repository';

@Module({
  imports: [
    AiModule,
    TypeOrmModule.forFeature([ChatSessionEntity, ChatMessageEntity]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatSessionRepository, ChatMessageRepository],
})
export class ChatModule {}

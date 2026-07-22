import { Anthropic } from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatMessageEntity } from '../entities/chat-message.entity';

export interface CreateChatMessageInput {
  sessionId: string;
  role: Anthropic.Messages.MessageParam['role'];
  content: Anthropic.Messages.MessageParam['content'];
}

@Injectable()
export class ChatMessageRepository {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly repo: Repository<ChatMessageEntity>,
  ) {}

  create(input: CreateChatMessageInput): Promise<ChatMessageEntity> {
    return this.repo.save(this.repo.create(input));
  }
}

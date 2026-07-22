import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatSessionEntity } from '../entities/chat-session.entity';

@Injectable()
export class ChatSessionRepository {
  constructor(
    @InjectRepository(ChatSessionEntity)
    private readonly repo: Repository<ChatSessionEntity>,
  ) {}

  create(): Promise<ChatSessionEntity> {
    const session = this.repo.create({});
    return this.repo.save(session);
  }

  findByIdWithMessages(id: string): Promise<ChatSessionEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { messages: true },
      order: { messages: { createdAt: 'ASC' } },
    });
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.repo.delete({ id });
    return !!result.affected;
  }
}

import { Anthropic } from '@anthropic-ai/sdk';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { CustomMessageEvent, CustomMessageEventType } from '@/types/events';

import { AiService } from '../ai/ai.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatMessageRepository } from './repositories/chat-message.repository';
import { ChatSessionRepository } from './repositories/chat-session.repository';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly sessionRepository: ChatSessionRepository,
    private readonly messageRepository: ChatMessageRepository,
  ) {}

  async createSession(): Promise<{ sessionId: string }> {
    const session = await this.sessionRepository.create();
    return { sessionId: session.id };
  }

  async getSession(id: string) {
    const session = await this.sessionRepository.findByIdWithMessages(id);
    if (!session) {
      throw new NotFoundException(`Session ${id} not found`);
    }

    return {
      id: session.id,
      createdAt: session.createdAt,
      messages: session.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    };
  }

  async deleteSession(id: string): Promise<void> {
    const deleted = await this.sessionRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundException(`Session ${id} not found`);
    }
  }

  async sendMessage(
    sessionId: string,
    payload: SendMessageDto,
  ): Promise<Observable<CustomMessageEvent>> {
    const session =
      await this.sessionRepository.findByIdWithMessages(sessionId);

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    // Persist the incoming user turn before streaming so its createdAt precedes
    // the assistant reply's, keeping replay order deterministic.
    const content = this.toUserContent(payload);
    await this.messageRepository.create({ sessionId, role: 'user', content });

    const history: Anthropic.Messages.MessageParam[] = session.messages.map(
      (message) => ({ role: message.role, content: message.content }),
    );

    // Stream the assistant reply, then persist it once the stream ends.
    let reply = '';
    return this.aiService.stream([...history, { role: 'user', content }]).pipe(
      tap((event) => {
        if (event.data.type === CustomMessageEventType.MESSAGE) {
          reply += event.data.text;
        }
        if (event.data.type === CustomMessageEventType.END) {
          void this.messageRepository
            .create({ sessionId, role: 'assistant', content: reply })
            .catch((err) =>
              this.logger.error(
                `Failed to persist assistant message for session ${sessionId}`,
                err instanceof Error ? err.stack : String(err),
              ),
            );
        }

        if (event.data.type === CustomMessageEventType.ERROR) {
          throw new Error('something went wrong', {
            cause: event.data.text,
          });
        }
      }),
    );
  }

  private toUserContent(
    payload: SendMessageDto,
  ): Anthropic.Messages.MessageParam['content'] {
    if (!payload.documents?.length) {
      return payload.message;
    }

    const documents = payload.documents.map(
      (doc): Anthropic.Messages.DocumentBlockParam => ({
        type: 'document',
        source: { type: 'text', media_type: 'text/plain', data: doc.content },
        title: doc.title,
        citations: { enabled: true },
      }),
    );

    return [...documents, { type: 'text', text: payload.message }];
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Anthropic } from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';
import { AiService, CustomMessageEvent } from '../ai/ai.service';
import { Session } from './types/chat.types';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  // TODO: bind to a database
  private readonly sessions = new Map<string, Session>();

  constructor(private readonly aiService: AiService) {}

  createSession(): { sessionId: string } {
    const id = uuidv4();
    this.sessions.set(id, { id, messages: [], createdAt: new Date() });
    return { sessionId: id };
  }

  getSession(id: string): Session {
    const session = this.sessions.get(id);
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return session;
  }

  deleteSession(id: string): void {
    if (!this.sessions.has(id))
      throw new NotFoundException(`Session ${id} not found`);
    this.sessions.delete(id);
  }

  sendMessage(
    sessionId: string,
    dto: SendMessageDto,
  ): Observable<CustomMessageEvent> {
    const session = this.getSession(sessionId);

    // Build the user content blocks
    const userContent: Anthropic.Messages.ContentBlockParam[] = [];

    // Prepend any documents with citations enabled
    if (dto.documents?.length) {
      for (const doc of dto.documents) {
        userContent.push({
          type: 'document',
          source: { type: 'text', media_type: 'text/plain', data: doc.content },
          title: doc.title,
          citations: { enabled: true },
        } as unknown as Anthropic.Messages.ContentBlockParam);
      }
    }

    userContent.push({ type: 'text', text: dto.message });
    const userMessage: Anthropic.Messages.MessageParam = {
      role: 'user',
      content: userContent,
    };

    session.messages.push(userMessage);

    // We capture the full assistant text to append to history after streaming
    let assistantText = '';

    const source$ = this.aiService.stream([...session.messages]);

    return new Observable((subscriber) => {
      const sub = source$.subscribe({
        next: (event) => {
          if (event.data.type === 'message') {
            assistantText += event.data.text;
          }
          if (event.data.type === 'end') {
            session.messages.push({
              role: 'assistant',
              content: assistantText,
            });
          }
          subscriber.next(event);
        },
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });

      return () => sub.unsubscribe();
    });
  }
}

import { Injectable } from '@nestjs/common';
import { Anthropic } from '@anthropic-ai/sdk';
import { Observable } from 'rxjs';

export interface CustomMessageEvent {
  data: {
    text: string;
    type: 'message' | 'end' | 'error';
    citations?: Anthropic.Messages.CitationsDelta[];
  };
}

export interface AiOptions {
  model?: string;
  maxTokens?: number;
}

type MessagesInput = string | Anthropic.Messages.MessageParam[];

@Injectable()
export class AiService {
  readonly aiClient: Anthropic;
  private readonly defaultModel: string;
  private readonly defaultMaxTokens: number;

  constructor() {
    this.aiClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.defaultModel = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
    this.defaultMaxTokens = parseInt(
      process.env.ANTHROPIC_MAX_TOKENS || '1024',
    );
  }

  private toMessages(input: MessagesInput): Anthropic.Messages.MessageParam[] {
    return typeof input === 'string'
      ? [{ role: 'user', content: input }]
      : input;
  }

  async generateText(
    input: MessagesInput,
    options?: AiOptions,
  ): Promise<Anthropic.Messages.Message> {
    try {
      const response = await this.aiClient.messages.create({
        model: options?.model ?? this.defaultModel,
        max_tokens: options?.maxTokens ?? this.defaultMaxTokens,
        messages: this.toMessages(input),
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to generate text: ${error}`);
    }
  }

  stream(
    input: MessagesInput,
    options?: AiOptions,
  ): Observable<CustomMessageEvent> {
    return new Observable((subscriber) => {
      const s = this.aiClient.messages.stream({
        model: options?.model ?? this.defaultModel,
        max_tokens: options?.maxTokens ?? this.defaultMaxTokens,
        messages: this.toMessages(input),
      });

      s.on('text', (text) =>
        subscriber.next({
          data: { text, type: 'message' },
        }),
      );
      s.on('end', () => {
        subscriber.next({
          data: { text: '', type: 'end' },
        });
        subscriber.complete();
      });

      s.on('error', (err) =>
        subscriber.next({
          data: { text: err.message, type: 'error' },
        }),
      );

      return () => s.abort();
    });
  }
}

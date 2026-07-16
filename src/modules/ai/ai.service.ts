import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Anthropic } from '@anthropic-ai/sdk';
import { CustomMessageEvent, CustomMessageEventType } from '@/types/events';
import { Observable } from 'rxjs';

@Injectable()
export class AiService {
  private readonly defaultModel: string;
  private readonly defaultMaxTokens: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly aiClient: Anthropic,
  ) {
    this.defaultModel = this.configService.get<string>('anthropic.model')!;
    this.defaultMaxTokens = this.configService.get<number>(
      'anthropic.maxTokens',
    )!;
  }

  private toMessages(
    input: Anthropic.Messages.MessageParam[],
  ): Anthropic.Messages.MessageParam[] {
    return typeof input === 'string'
      ? [{ role: 'user', content: input }]
      : input;
  }

  async generateText(
    input: Anthropic.Messages.MessageParam[],
    options?: Partial<
      Pick<
        Anthropic.Messages.MessageCreateParamsNonStreaming,
        'model' | 'max_tokens'
      >
    >,
  ): Promise<Anthropic.Messages.Message> {
    try {
      const response = await this.aiClient.messages.create({
        model: options?.model ?? this.defaultModel,
        max_tokens: options?.max_tokens ?? this.defaultMaxTokens,
        messages: this.toMessages(input),
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to generate text: ${error}`);
    }
  }

  stream(
    input: Anthropic.Messages.MessageParam[],
    options?: Partial<
      Pick<
        Anthropic.Messages.MessageCreateParamsNonStreaming,
        'model' | 'max_tokens'
      >
    >,
  ): Observable<CustomMessageEvent> {
    return new Observable((subscriber) => {
      const s = this.aiClient.messages.stream({
        model: options?.model ?? this.defaultModel,
        max_tokens: options?.max_tokens ?? this.defaultMaxTokens,
        messages: this.toMessages(input),
      });

      s.on('text', (text) =>
        subscriber.next({
          data: { text, type: CustomMessageEventType.MESSAGE },
        }),
      );
      s.on('end', () => {
        subscriber.next({
          data: { text: '', type: CustomMessageEventType.END },
        });
        subscriber.complete();
      });

      s.on('error', (err) =>
        subscriber.next({
          data: { text: err.message, type: CustomMessageEventType.ERROR },
        }),
      );

      return () => s.abort();
    });
  }
}

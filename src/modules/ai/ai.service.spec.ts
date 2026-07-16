import { Anthropic } from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { CustomMessageEventType } from '@/types/events';

import { AiService } from './ai.service';

const configMap: Record<string, string | number> = {
  'anthropic.model': 'claude-sonnet-4-6',
  'anthropic.maxTokens': 1024,
};

const mockConfigService = {
  get: jest.fn((key: string) => configMap[key]),
};

const mockAnthropicClient = {
  messages: {
    create: jest.fn(),
    stream: jest.fn(),
  },
};

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: Anthropic, useValue: mockAnthropicClient },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate text', async () => {
    mockAnthropicClient.messages.create.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Hello!' }],
    });

    const result = await service.generateText([
      { role: 'user', content: 'Hello, how are you?' },
    ]);

    expect(result).toBeDefined();
    expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello, how are you?' }],
    });
  });

  it('should stream text', (done: jest.DoneCallback) => {
    type StreamHandler = (...args: unknown[]) => void;
    const handlers: Record<string, StreamHandler> = {};
    const mockStream = {
      on: jest.fn().mockImplementation((event: string, cb: StreamHandler) => {
        handlers[event] = cb;
      }),
      abort: jest.fn(),
    };
    mockAnthropicClient.messages.stream.mockReturnValueOnce(mockStream);

    service
      .stream([{ role: 'user', content: 'Hello, how are you?' }])
      .subscribe((event) => {
        expect(event.data.text).toBe('Hello!');
        expect(event.data.type).toBe(CustomMessageEventType.MESSAGE);
        done();
      });

    expect(mockAnthropicClient.messages.stream).toHaveBeenCalledWith({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Hello, how are you?' }],
    });

    handlers['text']('Hello!');
  });
});

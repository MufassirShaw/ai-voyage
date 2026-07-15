import { Anthropic } from '@anthropic-ai/sdk';

export interface ChatDocument {
  title: string;
  content: string;
}

export interface Session {
  id: string;
  messages: Anthropic.Messages.MessageParam[];
  createdAt: Date;
}

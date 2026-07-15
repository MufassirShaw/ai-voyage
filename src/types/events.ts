import { CitationsDelta } from '@anthropic-ai/sdk/resources';

export enum CustomMessageEventType {
  MESSAGE = 'message',
  END = 'end',
  ERROR = 'error',
}

export interface CustomMessageEvent {
  data: {
    text: string;
    type: CustomMessageEventType;
    citations?: CitationsDelta[];
  };
}

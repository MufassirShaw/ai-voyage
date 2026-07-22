import { Anthropic } from '@anthropic-ai/sdk';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity';
import { ChatSessionEntity } from './chat-session.entity';

@Entity('chat_messages')
export class ChatMessageEntity extends AbstractEntity<ChatMessageEntity> {
  @ManyToOne(() => ChatSessionEntity, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionId' })
  session: ChatSessionEntity;

  @Index()
  @Column('uuid')
  sessionId: string;

  @Column({ type: 'enum', enum: ['user', 'assistant'] })
  role: Anthropic.Messages.MessageParam['role'];

  // Anthropic message content: a string (assistant turns) or an array of
  // content blocks (user turns with documents/citations). Stored verbatim so
  // history can be replayed to the model without lossy reconstruction.
  @Column('jsonb')
  content: Anthropic.Messages.MessageParam['content'];

  @CreateDateColumn()
  createdAt: Date;
}

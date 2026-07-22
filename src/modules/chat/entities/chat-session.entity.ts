import { CreateDateColumn, Entity, OneToMany, UpdateDateColumn } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity';
import { ChatMessageEntity } from './chat-message.entity';

@Entity('chat_sessions')
export class ChatSessionEntity extends AbstractEntity<ChatSessionEntity> {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ChatMessageEntity, (message) => message.session)
  messages: ChatMessageEntity[];
}

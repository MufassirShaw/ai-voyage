import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { CustomMessageEvent } from '@/types/events';

import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('')
  createSession() {
    return this.chatService.createSession();
  }

  @Get(':id')
  getSession(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.getSession(id);
  }

  @Delete(':id')
  async deleteSession(@Param('id', ParseUUIDPipe) id: string) {
    await this.chatService.deleteSession(id);
    return { deleted: true };
  }

  @Sse(':id/send')
  sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
  ): Promise<Observable<CustomMessageEvent>> {
    return this.chatService.sendMessage(id, dto);
  }
}

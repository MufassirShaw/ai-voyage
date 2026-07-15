import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CustomMessageEvent } from '../ai/ai.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  createSession() {
    return this.chatService.createSession();
  }

  @Get('sessions/:id')
  getSession(@Param('id') id: string) {
    return this.chatService.getSession(id);
  }

  @Delete('sessions/:id')
  deleteSession(@Param('id') id: string) {
    this.chatService.deleteSession(id);
    return { deleted: true };
  }

  @Sse('sessions/:id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ): Observable<CustomMessageEvent> {
    return this.chatService.sendMessage(id, dto);
  }
}

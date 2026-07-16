import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { Anthropic } from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    AiService,
    {
      provide: Anthropic,
      useFactory: (configService: ConfigService) => {
        return new Anthropic({
          apiKey: configService.get<string>('anthropic.apiKey'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [AiService],
})
export class AiModule {}

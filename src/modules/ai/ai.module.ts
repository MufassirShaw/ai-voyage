import { Anthropic } from '@anthropic-ai/sdk';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AiService } from './ai.service';

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

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIService } from './ai.service';
import { AI_PROVIDER } from './interfaces/ai-provider.interface';
import { MockAIProvider } from './providers/mock.provider';
import { OpenAIProvider } from './providers/openai.provider';

@Module({
  providers: [
    AIService,
    {
      provide: AI_PROVIDER,
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('ai.provider');
        return provider === 'openai' ? new OpenAIProvider(config) : new MockAIProvider();
      },
      inject: [ConfigService],
    },
  ],
  exports: [AIService],
})
export class AiModule {}

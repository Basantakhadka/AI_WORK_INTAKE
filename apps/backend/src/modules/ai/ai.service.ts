import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER, AIAnalysisInput, AIAnalysisResult, AIProvider } from './interfaces/ai-provider.interface';

/**
 * Business-facing entry point for AI analysis. WorkItemsService depends on
 * this, never on a concrete provider, so the vendor can change without
 * touching workflow code.
 */
@Injectable()
export class AIService {
  constructor(@Inject(AI_PROVIDER) private readonly provider: AIProvider) {}

  analyse(input: AIAnalysisInput): Promise<AIAnalysisResult> {
    return this.provider.analyse(input);
  }
}

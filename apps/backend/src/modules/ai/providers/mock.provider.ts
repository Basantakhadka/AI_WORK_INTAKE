import { Injectable, Logger } from '@nestjs/common';
import { AIAnalysisInput, AIAnalysisResult, AIProvider } from '../interfaces/ai-provider.interface';

/**
 * Deterministic, no-network provider used in local development and tests.
 * Lets the rest of the system (workflow, retries, validation) be exercised
 * without an OPENAI_API_KEY.
 */
@Injectable()
export class MockAIProvider implements AIProvider {
  private readonly logger = new Logger(MockAIProvider.name);

  async analyse(input: AIAnalysisInput): Promise<AIAnalysisResult> {
    this.logger.debug(`Mock-analysing work item: "${input.title}"`);

    const text = `${input.title} ${input.description}`.toLowerCase();

    let category = 'GENERAL_INQUIRY';
    if (/document|payslip|upload|attachment/.test(text)) {
      category = 'DOCUMENT_REQUEST';
    } else if (/complaint|unhappy|refund|dispute/.test(text)) {
      category = 'COMPLAINT';
    } else if (/urgent|asap|immediately|critical/.test(text)) {
      category = 'ESCALATION';
    }

    const priority: AIAnalysisResult['priority'] = /urgent|asap|immediately|critical/.test(text)
      ? 'HIGH'
      : input.description.length > 200
        ? 'MEDIUM'
        : 'LOW';

    return {
      category,
      priority,
      summary: input.description.slice(0, 160),
      recommendedAction: `Review "${input.title}" and follow up based on category ${category}.`,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AIAnalysisInput, AIAnalysisResult, AIProvider } from '../interfaces/ai-provider.interface';
import { validateAIResult } from '../schemas/ai-analysis.schema';

const SYSTEM_PROMPT =
  'You analyse an incoming work item for an operations team. ' +
  'Return ONLY a JSON object with exactly these fields: ' +
  'category (string), priority ("LOW" | "MEDIUM" | "HIGH"), summary (string), ' +
  'recommendedAction (string). Do not include any other text.';

const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Thin adapter around the OpenAI SDK. All vendor-specific request/response
 * shaping lives here; the rest of the backend only knows about AIProvider.
 */
@Injectable()
export class OpenAIProvider implements AIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.getOrThrow<string>('ai.openaiApiKey'),
      timeout: REQUEST_TIMEOUT_MS,
    });
    this.model = this.config.get<string>('ai.openaiModel') ?? 'gpt-4o-mini';
  }

  async analyse(input: AIAnalysisInput): Promise<AIAnalysisResult> {
    const response = await this.client.responses.create({
      model: this.model,
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(input) },
      ],
    });

    const raw = response.output_text?.trim();
    if (!raw) {
      throw new Error('Empty response from AI provider.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.logger.warn('AI provider returned non-JSON output.');
      throw new Error('AI provider returned malformed JSON.');
    }

    // Throws a ZodError (caught upstream) when the shape is unexpected.
    return validateAIResult(parsed);
  }
}

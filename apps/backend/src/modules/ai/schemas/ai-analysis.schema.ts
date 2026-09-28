import { z } from 'zod';

export const AIAnalysisSchema = z.object({
  category: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  summary: z.string().min(1),
  recommendedAction: z.string().min(1),
});

export type AIAnalysisSchemaType = z.infer<typeof AIAnalysisSchema>;

/**
 * The LLM response is untrusted input: parse and validate it before it is
 * ever persisted. Throws a ZodError when the shape does not match.
 */
export function validateAIResult(value: unknown): AIAnalysisSchemaType {
  return AIAnalysisSchema.parse(value);
}
